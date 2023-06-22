jest.mock("jsonwebtoken", () => {
  const { JWT_MOCK_USER_ID } = require("../helpers/mocks");
  return {
    verify: jest.fn().mockReturnValue({ _id: JWT_MOCK_USER_ID }),
  };
});

const { createUser } = require("../helpers/mocks");
const app = require("../../app");
const { makeHttpRequest } = require("../helpers/requests");
const { clearChanges, closeConnection } = require("../helpers/db");

afterEach(clearChanges);
afterAll(closeConnection);

describe("/status GET", () => {
  const statusRequest = (extraOptions) => {
    return makeHttpRequest(app, {
      method: "GET",
      endpoint: "/auth/status",
      ...extraOptions,
    });
  };

  it("when request is correct", async () => {
    const user = await createUser();
    const response = await statusRequest();
    const contentType = response.headers["content-type"];

    expect(/json/.test(contentType));
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("username");
    expect(response.body.email).toBe(user.email);
    expect(response.body.username).toBe(user.username);
  });

  describe("wrong request", () => {
    it("when user does not exist", async () => {
      const response = await statusRequest();
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Invalid request data.");
    });
  });
});
