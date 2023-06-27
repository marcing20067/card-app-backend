jest.mock("nodemailer", () => ({
  createTransport: () => ({
    sendMail: () => Promise.resolve(),
  }),
}));

const app = require("../../app");
const { User } = require("../../models/user");
const { OneTimeToken } = require("../../models/oneTimeToken");
const { clearChanges, closeConnection } = require("../helpers/db");
const { createUser, userObj } = require("../helpers/mocks");
const { makeHttpRequest } = require("../helpers/requests");

afterEach(clearChanges);
afterAll(closeConnection);

describe("/signup POST", () => {
  const signupRequest = (userData) => {
    return makeHttpRequest(app, {
      method: "POST",
      data: userData,
      endpoint: "/auth/signup",
    });
  };

  it("when request is correct", async () => {
    const response = await signupRequest(userObj);
    const contentType = response.headers["content-type"];
    const message = response.body.message;

    expect(/json/.test(contentType));
    expect(response.status).toBe(201);
    expect(message).toBe("Check your email.");

    const foundUser = await User.findOne({ username: userObj.username });
    expect(foundUser).not.toBe(null);

    const foundOneTimeToken = await OneTimeToken.findOne({
      creator: foundUser._id,
    });
    expect(foundOneTimeToken).not.toBe(null);
  });

  describe("when request is invalid", () => {
    it("when username is too short", async () => {
      const userData = {
        ...userObj,
        username: "u",
      };
      const response = await signupRequest(userData);
      const message = response.body.message;
      const contentType = response.headers["content-type"];

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Username is too short.");
    });

    it("when password is too short", async () => {
      const userData = {
        ...userObj,
        password: "p",
      };
      const response = await signupRequest(userData);
      const message = response.body.message;
      const contentType = response.headers["content-type"];

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Password is too short.");
    });

    it("when userData is empty object", async () => {
      const userData = {};
      const response = await signupRequest(userData);

      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Username is required.");
    });

    it("when only password is undefined", async () => {
      const userData = {
        ...userObj,
        password: undefined,
      };
      const response = await signupRequest(userData);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Password is required.");
    });

    it("when only username is undefined", async () => {
      const userData = {
        ...userObj,
        username: undefined,
      };
      const response = await signupRequest(userData);
      const message = response.body.message;
      const contentType = response.headers["content-type"];

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Username is required.");
    });

    it("when only email is undefined", async () => {
      const userData = {
        ...userObj,
        email: undefined,
      };
      const response = await signupRequest(userData);

      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Email is required.");
    });

    it("when email is invalid", async () => {
      const userData = {
        ...userObj,
        email: "email",
      };
      const response = await signupRequest(userData);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Invalid email format.");
    });

    it("when username is already taken", async () => {
      const user = await createUser();

      const response = await signupRequest({
        ...user,
        email: `custom${user.email}`,
      });

      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(409);
      expect(message).toBe("Username is already taken.");
    });

    it("when email is already taken", async () => {
      const user = await createUser();
      const response = await signupRequest({
        ...user,
        username: `custom${user.username}`,
      });
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(409);
      expect(message).toBe("Email is already taken.");
    });
  });
});
