jest.mock("nodemailer", () => ({
  createTransport: () => ({
    sendMail: () => Promise.resolve(),
  }),
}));

jest.mock("jsonwebtoken", () => {
  const { JWT_MOCK_USER_ID } = require("../helpers/mocks");
  return {
    verify: jest.fn().mockReturnValue({ _id: JWT_MOCK_USER_ID }),
  };
});

const app = require("../../app");
const { OneTimeToken } = require("../../models/oneTimeToken");
const { User } = require("../../models/user");
const { createOneTimeToken, createUser } = require("../helpers/mocks");
const { makeHttpRequest } = require("../helpers/requests");
const { clearChanges, closeConnection } = require("../helpers/db");

afterEach(clearChanges);
afterAll(closeConnection);

describe("/auth/activate/:token GET", () => {
  const getActivateRequest = (activationToken) => {
    return makeHttpRequest(app, {
      method: "GET",
      endpoint: `/auth/activate/${activationToken}`,
    });
  };

  describe("when request is correct", () => {
    it("when the token is not expired", async () => {
      const user = await createUser({ isActivated: false });
      const oneTimeToken = await createOneTimeToken();

      const response = await getActivateRequest(oneTimeToken.activation.token);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(200);
      expect(message).toBe("The user has been activated successfully.");

      const foundUser = await User.findOne({ _id: user._id });
      expect(foundUser.isActivated).toBe(true);

      const foundOneTimeToken = await OneTimeToken.findOne({
        _id: oneTimeToken._id,
      });
      expect(foundOneTimeToken.activation).toBe(null);
    });

    it("when the token is expired", async () => {
      const user = await createUser({ isActivated: false });
      const oneTimeToken = await createOneTimeToken({
        activation: {
          endOfValidity: 1,
          token: "3029daosdsada",
        },
      });

      const response = await getActivateRequest(oneTimeToken.activation.token);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(200);
      expect(message).toBe(
        "The previous token has expired. Check the email and go to the new link."
      );

      const foundOneTimeToken = await OneTimeToken.findOne({
        creator: oneTimeToken.creator,
      });
      const oldToken = oneTimeToken.activation.token;
      expect(foundOneTimeToken.activation.token).not.toBe(oldToken);

      const foundUser = await User.findOne({ _id: user._id });
      expect(foundUser.isActivated).toBe(false);
    });
  });

  describe("when request is wrong", () => {
    it("when token is undefined", async () => {
      const response = await getActivateRequest(undefined);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Token does not exist.");
    });

    it("when oneTimeToken is wrong", async () => {
      const wrongOneTimeToken = "wrongToken";
      const response = await getActivateRequest(wrongOneTimeToken);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Token does not exist.");
    });

    it("when user is already activated", async () => {
      await createUser();
      const oneTimeToken = await createOneTimeToken();
      const response = await getActivateRequest(oneTimeToken.activation.token);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Invalid request data.");
    });
  });
});
