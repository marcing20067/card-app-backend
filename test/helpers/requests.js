const supertest = require("supertest");

const makeHttpRequest = async (app, options) => {
  const { method, endpoint, cookie, data } = options;
  let request = supertest(app)[method.toLowerCase()](endpoint);

  if (cookie) {
    request = request.set("Cookie", cookie);
  }

  request = request
    .set("Authorization", "Bearer token")
    .set("Accept", "application/json");

  if (method === "POST" || method === "PUT") {
    request = request.send(data);
  }

  const response = await request;

  return response;
};

module.exports = { makeHttpRequest };
