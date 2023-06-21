const app = require("../app.js");
const debug = require("debug");

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
};

const port = normalizePort(process.env.PORT || "3000");

const onListen = () => {
  debug("Listening on " + port);
};
app.listen(port, onListen);
