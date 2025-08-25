//? Imports
import express, { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

// controllers
import { AuthController } from "../controllers/AuthController";

// services
import { UserService } from "../services/UserService";
import { TokenService } from "../services/TokenService";

// db related imports
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { RefreshToken } from "../entity/RefreshToken";

// validators
import registerValidator from "../validators/register-validator";
import loginValidator from "../validators/login-validator";
import { CredentialService } from "../services/CredentialService";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialService,
);

router.post(
  "/register",
  registerValidator,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.register(req, res, next);
  },
);

router.post(
  "/login",
  loginValidator,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.login(req, res, next);
  },
);

export default router;
