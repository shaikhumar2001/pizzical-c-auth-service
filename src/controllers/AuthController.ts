import fs from "fs";
import path from "path";
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";
import { StringValue } from "ms";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("New request to register a user", {
      firstName,
      lastName,
      email,
      password: "******",
    });
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });
      this.logger.info("User has been registered", { id: user.id });

      // set access token and refresh token via http only cookies
      let privateKey: Buffer;

      try {
        privateKey = fs.readFileSync(
          path.join(__dirname, "../../certs/private.pem"),
        );
      } catch {
        const error = createHttpError(500, "Error while reading private key");
        next(error);
        return;
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = sign(payload, privateKey, {
        algorithm: "RS256",
        expiresIn: (Config.ACCESS_TOKEN_AGE as StringValue) || "1h",
        issuer: (Config.JWT_TOKEN_ISSUER as StringValue) || "auth-service",
      });
      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
        algorithm: "HS256",
        expiresIn: (Config.REFRESH_TOKEN_AGE as StringValue) || "1y",
        issuer: (Config.JWT_TOKEN_ISSUER as StringValue) || "auth-service",
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        httpOnly: true, // very important
        maxAge: 1000 * 60 * 60, // 1 hour
      });
      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        httpOnly: true, // very important
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      });

      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }
}
