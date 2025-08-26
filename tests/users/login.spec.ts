import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";

describe("POST /auth/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  // Happy Path
  describe("Given all fields", () => {
    it("should return 200 status code", async () => {
      // Arrange
      const registerUserData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "password",
      };

      await request(app).post("/auth/register").send(registerUserData);

      const loginUserData = {
        email: "johndoe@email.com",
        password: "password",
      };

      // Act
      const response = await request(app)
        .post("/auth/login")
        .send(loginUserData);

      // Assert
      expect(response.statusCode).toBe(200);
    });
    it("should return valid json response", async () => {
      // Arrange
      const registerUserData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        password: "password",
      };

      await request(app).post("/auth/register").send(registerUserData);

      const loginUserData = {
        email: "johndoe@email.com",
        password: "password",
      };

      // Act
      const response = await request(app)
        .post("/auth/login")
        .send(loginUserData);

      // Assert: application/json in the response header content-type
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json"),
      );
    });
  });

  // Sad Path
  describe("Fields are missing", () => {});
});
