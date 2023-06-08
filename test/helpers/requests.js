const supertest = require("supertest");
const jsonwebtoken = require("jsonwebtoken");
const USER_ID = "5349b4ddd2781d08c09890f3";


const makeHttpRequest = async (app, options) => {
  const { method, endpoint, cookie, data, mockJwt } = options;
  let request = supertest(app)[method.toLowerCase()](endpoint);

  if (cookie) {
    request = request.set("Cookie", customCookie);
  }

  request = request
    .set("Authorization", "Bearer token")
    .set("Accept", "application/json");

  if (mockJwt) {
    jsonwebtoken.verify.mockReturnValue({ id: USER_ID });
  }

  if (method === "POST" || method === "PUT") {
    request = request.send(data);
  }

  const response = await request;

  if (mockJwt) {
    jsonwebtoken.verify.mockRestore();
  }

  return response;
};

module.exports = { makeHttpRequest };
