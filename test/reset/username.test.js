jest.mock("nodemailer", () => ({
  createTransport: () => ({
    sendMail: () => Promise.resolve(),
  }),
}));

const app = require("../../app");
const { OneTimeToken } = require("../../models/oneTimeToken");
const { User } = require("../../models/user");

const { clearChanges, closeConnection } = require("../helpers/db");
const {
  createOneTimeToken,
  createUser,
  userObj2,
} = require("../helpers/mocks");
const { makeHttpRequest } = require("../helpers/requests");

afterEach(clearChanges);
afterAll(closeConnection);

describe("/resetUsername POST", () => {
  const resetUsernameRequest = (username, extraOptions) => {
    return makeHttpRequest(app, {
      method: "POST",
      endpoint: `/reset/username`,
      data: {
        username: username,
      },
      ...extraOptions,
    });
  };

  it("when request is correct", async () => {
    const oneTimeToken = await createOneTimeToken();
    const user = await createUser();
    const response = await resetUsernameRequest(user.username);
    const contentType = response.headers["content-type"];
    const message = response.body.message;

    expect(/json/.test(contentType));
    expect(response.status).toBe(200);
    expect(message).toBe("Check your email.");

    const foundOneTimeToken = await OneTimeToken.findOne({
      creator: user._id,
    });
    expect(foundOneTimeToken.resetUsername).not.toEqual(
      oneTimeToken.resetUsername
    );
  });

  describe("when request is wrong", () => {
    it("when username is wrong", async () => {
      const wrongUsername = "";
      const response = await resetUsernameRequest(wrongUsername);
      const message = response.body.message;
      const contentType = response.headers["content-type"];

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("User does not exist.");
    });
  });
});

describe("/resetUsername/:oneTimeToken PUT", () => {
  const resetUsernameWithTokenRequest = (resetUsernameToken, extraOptions) => {
    return makeHttpRequest(app, {
      method: "PUT",
      endpoint: `/reset/username/${resetUsernameToken}`,
      data: {},
      ...extraOptions,
    });
  };

  it("when request is correct", async () => {
    const user = await createUser();
    const oneTimeToken = await createOneTimeToken();
    const response = await resetUsernameWithTokenRequest(
      oneTimeToken.resetUsername.token,
      {
        data: {
          newUsername: user.username + "random",
        },
      }
    );

    const contentType = response.headers["content-type"];
    const message = response.body.message;

    expect(/json/.test(contentType));
    expect(response.status).toBe(200);
    expect(message).toBe("Username has been changed successfully.");

    const foundUser = await User.findOne({ _id: user._id });
    expect(foundUser.username).toBe(user.username + "random");

    const foundOneTimeToken = await OneTimeToken.findOne({
      _id: oneTimeToken._id,
    });
    expect(foundOneTimeToken.resetUsername).toBe(null);
  });

  describe("when request is wrong", () => {
    it("when resetUsernameToken is wrong", async () => {
      const user = await createUser();
      await createOneTimeToken();
      const wrongToken = "wrongToken";
      const response = await resetUsernameWithTokenRequest(wrongToken, {
        data: {
          newUsername: user.username + "x",
        },
      });

      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Invalid request data.");
    });

    it("when newUsername is alreadytaken", async () => {
      await createUser();
      const oneTimeToken = await createOneTimeToken();
      const two = await createUser(userObj2);
      const response = await resetUsernameWithTokenRequest(
        oneTimeToken.resetUsername.token,
        {
          data: {
            newUsername: two.username,
          },
        }
      );

      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(409);
      expect(message).toBe("Username is already taken.");
    });
  });
});
