const app = require('../app.js');
const debug = require('debug');
const http = require('http');

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}


const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  errorFunctions = {
    'EACCES': (bind) => {
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    },
    'EADDRINUSE': (bind) => {
      console.error(bind + ' is already in use');
      process.exit(1);
    }

  }

  const errorFunction = errorFunctions[error.code];

  if (errorFunction) {
    return errorFunction(bind)
  }
  throw error;
}

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

