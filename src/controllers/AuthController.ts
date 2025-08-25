import { NextFunction, Response } from "express";
import { LoginUserRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
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
      this.logger.info("User has been registered successfully", {
        id: user.id,
      });

      // set access token and refresh token via http only cookies
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      // generate access token
      const accessToken = this.tokenService.generateAccessToken(payload);

      // persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      // generate refresh token
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
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
      return;
    } catch (err) {
      next(err);
      return;
    }
  }

  async login(req: LoginUserRequest, res: Response, next: NextFunction) {
    // Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { email, password } = req.body;

    this.logger.debug("New request to login a user", {
      email,
      password: "******",
    });
    try {
      // 1. Check if email exists in database
      // 2. Compare password

      const user = await this.userService.findByEmail(email);

      // check if user does not exists
      if (!user) {
        const error = createHttpError(400, "Email or password does not match.");
        next(error);
        return;
      }

      // check if password does not match
      const passwordMatch = await this.credentialService.comparePassword(
        password,
        user.password,
      );

      if (!passwordMatch) {
        const error = createHttpError(400, "Email or password does not match.");
        next(error);
        return;
      }

      // set access token and refresh token via http only cookies
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      // generate access token
      const accessToken = this.tokenService.generateAccessToken(payload);

      // persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      // generate refresh token
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
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

      this.logger.info("User has been logged in successfully", { id: user.id });
      res.status(201).json({ id: user.id });
      return;
    } catch (err) {
      next(err);
      return;
    }
  }
}
