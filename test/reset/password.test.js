jest.mock("nodemailer", () => ({
  createTransport: () => ({
    sendMail: () => Promise.resolve(),
  }),
}));

const app = require("../../app");
const { OneTimeToken } = require("../../models/oneTimeToken");
const { makeHttpRequest } = require("../helpers/requests");
const { createUser, createOneTimeToken } = require("../helpers/mocks");
const { clearChanges, closeConnection } = require("../helpers/db");

afterEach(clearChanges);
afterAll(closeConnection);

describe("/resetPassword POST", () => {
  const resetPasswordRequest = (username, extraOptions) => {
    return makeHttpRequest(app, {
      method: "POST",
      endpoint: `/reset/password`,
      data: {
        username,
      },
      ...extraOptions,
    });
  };

  it("when request is correct", async () => {
    const user = await createUser();
    const oneTimeToken = await createOneTimeToken();
    const response = await resetPasswordRequest(user.username);

    const contentType = response.headers["content-type"];
    const message = response.body.message;

    expect(/json/.test(contentType));
    expect(response.status).toBe(200);
    expect(message).toBe("Check your email.");

    const foundOneTimeToken = await OneTimeToken.findOne({
      creator: user._id,
    });
    expect(foundOneTimeToken.resetPassword).not.toEqual(
      oneTimeToken.resetPassword
    );
  });

  describe("when request is wrong", () => {
    it("when username is wrong", async () => {
      const wrongUsername = "wrong";
      const response = await resetPasswordRequest(wrongUsername);
      const message = response.body.message;
      const contentType = response.headers["content-type"];

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("User does not exist.");
    });

    it("when username is undefined", async () => {
      const wrongUsername = undefined;
      const response = await resetPasswordRequest(wrongUsername);
      const message = response.body.message;
      const contentType = response.headers["content-type"];

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("User does not exist.");
    });
  });
});

describe("/resetPassword/:oneTimeToken PUT", () => {
  const resetPasswordWithTokenRequest = (resetPasswordToken, extraOptions) => {
    return makeHttpRequest(app, {
      method: "PUT",
      endpoint: `/reset/password/${resetPasswordToken}`,
      data: {},
      ...extraOptions,
    });
  };

  it("when request is correct", async () => {
    await createUser();
    const oneTimeToken = await createOneTimeToken();

    const response = await resetPasswordWithTokenRequest(
      oneTimeToken.resetPassword.token,
      {
        data: {
          newPassword: "extraNewPassword123!",
        },
      }
    );

    const contentType = response.headers["content-type"];
    const message = response.body.message;

    expect(/json/.test(contentType));
    expect(response.status).toBe(200);
    expect(message).toBe("Password has been changed successfully.");

    const foundOneTimeToken = await OneTimeToken.findOne({
      _id: oneTimeToken._id,
    });
    expect(foundOneTimeToken.resetPassword).toBe(null);
  });

  describe("when request is wrong", () => {
    it("when resetPasswordToken is wrong", async () => {
      const user = await createUser();
      await createOneTimeToken();
      const wrongToken = "wrongToken";
      const response = await resetPasswordWithTokenRequest(wrongToken, {
        data: {
          newPassword: user.password + "new",
        },
      });
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Token does not exist.");
    });

    it("when newPassword is undefined", async () => {
      await createUser();
      const oneTimeToken = await createOneTimeToken();
      const response = await resetPasswordWithTokenRequest(
        oneTimeToken.resetPassword.token,
        {
          data: {
            newPassword: undefined,
          },
        }
      );
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Invalid request data.");
    });
  });
});
