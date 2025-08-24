import fs from "fs";
import path from "path";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";
import ms, { StringValue } from "ms";
import { User } from "../entity/User";
import { RefreshToken } from "../entity/RefreshToken";
import { Repository } from "typeorm";

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

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

  async persistRefreshToken(user: User) {
    const newRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      expiresAt: new Date(
        Date.now() + ms((Config.REFRESH_TOKEN_AGE as StringValue) || "1y"),
      ),
    });
    return newRefreshToken;
  }
}
