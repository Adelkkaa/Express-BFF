import jwt, { JwtPayload } from "jsonwebtoken";

interface IDecodeTokensArgs {
    access_token: string;
    refresh_token: string;
    info_token: string;
}

interface IDecodeTokensReturn {
    maxAgeAccessToken?: number;
    maxAgeRefreshToken?: number;
    decodedInfoToken?: JwtPayload | string | null;
    decodedAccessToken?: JwtPayload | string | null;
    decodedRefreshToken?: JwtPayload | string | null;
}


export const decodeTokens = (
 {
    access_token,
    refresh_token,
    info_token
 }: IDecodeTokensArgs
): IDecodeTokensReturn => {
  const decodedAccessToken = jwt.decode(access_token);
  const decodedRefreshToken = jwt.decode(refresh_token);
  const decodedInfoToken = jwt.decode(info_token);

  // Тут непонятно ещё что делать с timezone
  const maxAgeAccessToken =
    typeof decodedAccessToken === "object" &&
    decodedAccessToken?.exp &&
    decodedAccessToken?.iat
      ? (decodedAccessToken?.exp - decodedAccessToken?.iat) * 1000
      : undefined;
  const maxAgeRefreshToken =
    typeof decodedRefreshToken === "object" &&
    decodedRefreshToken?.exp &&
    decodedRefreshToken?.iat
      ? (decodedRefreshToken?.exp - decodedRefreshToken?.iat) * 1000
      : undefined;
  return {
    decodedAccessToken,
    decodedRefreshToken,
    decodedInfoToken,
    maxAgeAccessToken,
    maxAgeRefreshToken,
  };
};
