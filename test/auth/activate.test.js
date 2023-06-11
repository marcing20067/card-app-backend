jest.mock("nodemailer", () => ({
  createTransport: () => ({
    sendMail: () => Promise.resolve(),
  }),
}));

jest.mock("jsonwebtoken", () => {
  const { JWT_MOCK_USER_ID } = require("../helpers/mocks");
  return {
    verify: jest.fn().mockReturnValue({ id: JWT_MOCK_USER_ID }),
  };
});

const app = require("../../app");
const OneTimeToken = require("../../models/oneTimeToken");
const User = require("../../models/user");
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

      const findedUser = await User.findOne({ _id: user._id });
      expect(findedUser.isActivated).toBe(true);

      const findedOneTimeToken = await OneTimeToken.findOne({
        _id: oneTimeToken._id,
      });
      expect(findedOneTimeToken.activation.token).toBe("0");
    });

    it("when the token is expired", async () => {
      await createUser({ isActivated: false });
      const oneTimeToken = await createOneTimeToken({
        activation: {
          endOfValidity: 1,
          token: "3120321902jj121232",
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

      const findedOneTimeToken = await OneTimeToken.findOne({
        creator: oneTimeToken.creator,
      });
      const oldToken = oneTimeToken.activation.token;
      expect(findedOneTimeToken.activation.token).not.toBe(oldToken);
    });
  });

  describe("when request is wrong", () => {
    it("when token was used", async () => {
      const oneTimeToken = await createOneTimeToken({
        activation: {
          token: "0",
          endOfValidity: 0,
        },
      });
      const response = await getActivateRequest(oneTimeToken.activation.token);
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
  });
});
