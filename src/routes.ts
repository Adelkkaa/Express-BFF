import axios, { AxiosError } from "axios";
import express from "express";
import { IInfoToken, type AuthResult } from "./types/types";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "./configs/config";
import { decodeTokens } from "./helpers/decodeTokens";

const router = express.Router();

router.post("/auth/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    const response = await axios.post(
      `${config.apiUrl}/login`,
      {
        login,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { access_token, refresh_token, info_token }: AuthResult =
      response.data;
    const { decodedInfoToken, maxAgeAccessToken, maxAgeRefreshToken } =
      decodeTokens({ access_token, refresh_token, info_token });

    res.cookie("access_token", access_token, {
      httpOnly: true,
      maxAge: maxAgeAccessToken,
    });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      maxAge: maxAgeRefreshToken,
    });
    res.cookie("info_token", info_token, {
      httpOnly: true,
      maxAge: maxAgeRefreshToken,
    });

    res.json(decodedInfoToken);
  } catch (error: AxiosError | any) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Произошла ошибка при отправке запроса" });
  }
});

router.post("/auth/refresh", async (req, res) => {
  try {
    const refresh_token = req.cookies.refresh_token || "";
    const info_token = req.cookies.info_token || "";
    const decodedInfoToken = jwt.decode(info_token) as IInfoToken | null;

    if (decodedInfoToken && refresh_token) {
      const response = await axios.post(
        `${config.apiUrl}/refresh`,
        {
          refresh_token,
          login: decodedInfoToken.login_ad,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const {
        decodedInfoToken: newDecodedInfoToken,
        maxAgeAccessToken,
        maxAgeRefreshToken,
      } = decodeTokens({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        info_token: response.data.info_token,
      });

      res.cookie("access_token", response.data.access_token, {
        httpOnly: true,
        maxAge: maxAgeAccessToken,
      });
      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        maxAge: maxAgeRefreshToken,
      });
      res.cookie("info_token", info_token, {
        httpOnly: true,
        maxAge: maxAgeRefreshToken,
      });
      res.json(newDecodedInfoToken);
    } else {
      res.cookie("access_token", "", { maxAge: 0 });
      res.cookie("refresh_token", "", { maxAge: 0 });
      res.cookie("info_token", "", { maxAge: 0 });
      res.status(401).send();
    }
  } catch (error: AxiosError | any) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Произошла ошибка при отправке запроса" });
  }
});

router.post("/auth/logout", async (req, res) => {
  try {
    const refresh_token = req.cookies.refresh_token || "";
    res.cookie("access_token", "", { maxAge: 0 });
    res.cookie("refresh_token", "", { maxAge: 0 });
    res.cookie("info_token", "", { maxAge: 0 });

    if (!refresh_token) {
      res.status(204).send();
      return;
    }
    await axios.post(`${config.apiUrl}/logout?refresh_token=${refresh_token}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    res.status(204).send();
  } catch (error: AxiosError | any) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Произошла ошибка при отправке запроса" });
  }
});

router.get("/auth/info", (req, res) => {
  const info_token = req.cookies.info_token || "";
  const decodedInfoToken = jwt.decode(info_token) as IInfoToken | null;
  if (!decodedInfoToken) {
    res.status(401).send();
    return;
  }
  res.json(decodedInfoToken);
});

export default router;
