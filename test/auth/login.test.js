const app = require("../../app");


jest.mock("bcryptjs", () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

const bcryptjs = require("bcryptjs");
const { clearChanges, closeConnection } = require("../helpers/db");
const { createUser, userObj } = require("../helpers/mocks");
const { makeHttpRequest } = require("../helpers/requests");

afterEach(clearChanges);
afterAll(closeConnection);

describe("/auth/login POST", () => {
  const loginRequest = (userData) => {
    return makeHttpRequest(app, {
      method: "POST",
      endpoint: "/auth/login",
      data: userData,
    });
  };

  it("when request is correct", async () => {
    const user = await createUser();
    const response = await loginRequest(user);
    const data = response.body;
    const contentType = response.headers["content-type"];

    expect(/json/.test(contentType));
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("accessToken");
    expect(data).toHaveProperty("accessTokenExpiresIn");
  });

  describe("when request is invalid", () => {
    it("when username is undefined", async () => {
      const userData = {
        ...userObj,
        username: undefined,
      };
      const response = await loginRequest(userData);
      const message = response.body.message;
      const contentType = response.headers["content-type"];

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("User does not exist.");
    });

    it("when password is undefined", async () => {
      const userData = {
        ...userObj,
        password: undefined,
      };
      const response = await loginRequest(userData);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("User does not exist.");
    });

    it("when username is invalid", async () => {
      const userData = {
        ...userObj,
        username: "us",
      };
      const response = await loginRequest(userData);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("User does not exist.");
    });

    it("when valid password is failed", async () => {
      const user = await createUser();
      bcryptjs.compare.mockResolvedValue(false);
      response = await loginRequest(user);

      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("User does not exist.");
    });

    it("when password is invalid", async () => {
      const userData = {
        ...userObj,
        password: "pas",
      };
      const response = await loginRequest(userData);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("User does not exist.");
    });
  });
});
