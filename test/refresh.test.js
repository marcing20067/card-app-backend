jest.mock("jsonwebtoken", () => {
  const { JWT_MOCK_USER_ID } = require("./helpers/mocks");
  return {
    verify: jest.fn().mockReturnValue({ _id: JWT_MOCK_USER_ID }),
    sign: jest.fn().mockReturnValue("token"),
  };
});

const app = require("../app");
const { clearChanges, closeConnection } = require("./helpers/db");
const { makeHttpRequest } = require("./helpers/requests");
const jsonwebtoken = require("jsonwebtoken");

afterEach(clearChanges);
afterAll(closeConnection);

describe("/refresh GET", () => {
  const refreshRequest = (extraOptions) => {
    return makeHttpRequest(app, {
      method: "POST",
      data: {},
      endpoint: "/refresh",
      ...extraOptions,
    });
  };

  it("when request is correct", async () => {
    const response = await refreshRequest({
      cookie: "refreshToken=dummy",
    });
    const data = response.body;

    expect(response.statusCode).toBe(201);
    expect(data).toHaveProperty("accessTokenExpiresIn");
    expect(data).toHaveProperty("accessToken");
  });

  describe("when request is invalid", () => {
    it("when refresh token doesn't exist", async () => {
      const response = await refreshRequest();
      const message = response.body.message;

      expect(response.status).toBe(200);
      expect(message).toBe("Invalid refresh token.");
    });

    it("when jwt verify throws error ", async () => {
      jsonwebtoken.verify.mockImplementationOnce(() => {
        throw {
          name: "TokenExpiredError",
          message: "jwt expired",
          expiredAt: new Date("0001-01-01"),
        };
      });

      const response = await refreshRequest({
        cookie: "refreshToken=dummy",
      });
      const message = response.body.message;

      expect(response.statusCode).toBe(400);
      expect(message).toBe("Invalid refresh token.");
    });
  });
});
