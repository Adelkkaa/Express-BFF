import axios, { AxiosError } from "axios";
import express from "express";
import { type AuthResult } from "./types";
import jwt from 'jsonwebtoken'
import { config } from "./config";

const router = express.Router();

router.post("/auth/login", async (req, res) => {
    try {
        const { login, password } = req.body;

    
        const response = await axios.post(`${config.apiUrl}/login`, {
          login,
          password,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const {access_token, refresh_token, info_token}: AuthResult = response.data;

        const decodedAccessToken = jwt.decode(access_token);
        const decodedRefreshToken = jwt.decode(refresh_token);
        const decodedInfoToken = jwt.decode(info_token);

        const currentDate = Date.now(); 

        // Тут непонятно ещё что делать с timezone
        const maxAgeAccessToken = typeof decodedAccessToken === 'object' && decodedAccessToken?.exp && decodedAccessToken?.iat ?  (decodedAccessToken?.exp - decodedAccessToken?.iat) * 1000 : undefined;
        const maxAgeRefreshToken = typeof decodedRefreshToken === 'object' && decodedRefreshToken?.exp && decodedRefreshToken?.iat ? (decodedRefreshToken?.exp - decodedRefreshToken?.iat) * 1000: undefined;
        res.cookie('access_token', access_token, { httpOnly: true, maxAge: maxAgeAccessToken });
        res.cookie('refresh_token', refresh_token, { httpOnly: true, maxAge: maxAgeRefreshToken });
        res.cookie('info_token', info_token, { httpOnly: true, maxAge: maxAgeRefreshToken  });

        res.json(decodedInfoToken)
      } catch (error: AxiosError | any) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Произошла ошибка при отправке запроса' });
      }
});

router.post("/auth/refresh", (req, res) => {
  res.status(200).json({ message: "Token refreshed" });
});

router.post("/auth/logout", (req, res) => {
    res.cookie('access_token', '', { maxAge: 0 });
    res.cookie('refresh_token', '', { maxAge: 0 });
    res.cookie('info_token', '', { maxAge: 0 });
  res.status(204).send();
});

export default router;
