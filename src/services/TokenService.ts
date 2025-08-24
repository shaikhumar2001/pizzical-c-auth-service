import fs from "fs";
import path from "path";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";
import { StringValue } from "ms";

export class TokenService {
  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;

    try {
      privateKey = fs.readFileSync(
        path.join(__dirname, "../../certs/private.pem"),
      );
    } catch {
      const error = createHttpError(500, "Error while reading private key");
      throw error;
    }
    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: (Config.ACCESS_TOKEN_AGE as StringValue) || "1h",
      issuer: (Config.JWT_TOKEN_ISSUER as StringValue) || "auth-service",
    });
    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, String(Config.REFRESH_TOKEN_SECRET), {
      algorithm: "HS256",
      expiresIn: (Config.REFRESH_TOKEN_AGE as StringValue) || "1y",
      issuer: (Config.JWT_TOKEN_ISSUER as StringValue) || "auth-service",
      jwtid: String(payload.id),
    });
    return refreshToken;
  }
}
