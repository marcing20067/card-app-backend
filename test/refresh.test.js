jest.mock("jsonwebtoken", () => {
  const { JWT_MOCK_USER_ID } = require("./helpers/mocks");
  return {
    verify: jest.fn().mockReturnValue({ id: JWT_MOCK_USER_ID }),
    sign: jest.fn().mockReturnValue("token"),
  };
});

const app = require("../app");
const { clearChanges, closeConnection } = require("./helpers/db");
const { makeHttpRequest } = require("./helpers/requests");

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
      const message = response.body.error;

      expect(response.status).toBe(200);
      expect(message).toBe("Invalid refresh token.");
    });
  });
});
