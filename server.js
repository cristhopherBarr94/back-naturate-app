// import libraries
const app = require("./backend/index");
const debug = require("debug")("node-angular");
const http = require("http");

// port normalization
const normalizePort = (val) => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

// create onError function
const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// create onListening function
const onListening = () => {
  const addr = server.address();
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  debug("Listening on " + bind);
};

// config the listen port to the server, if env port is not avaliable takes the 3000 port as default
const port = normalizePort(process.env.PORT || 3000);
// configuration for express environment
app.set("port", port);
// create the server
const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(port);
