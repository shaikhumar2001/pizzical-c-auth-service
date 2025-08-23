import { config } from "dotenv";
import path from "path";
config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  ACCESS_TOKEN_AGE,
  REFRESH_TOKEN_AGE,
  REFRESH_TOKEN_SECRET,
  JWT_TOKEN_ISSUER,
} = process.env;

export const Config = {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  ACCESS_TOKEN_AGE,
  REFRESH_TOKEN_AGE,
  REFRESH_TOKEN_SECRET,
  JWT_TOKEN_ISSUER,
};
