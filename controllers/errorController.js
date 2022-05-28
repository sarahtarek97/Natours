const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value ${value}, Please use another value!.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError("Invalid token Please login again", 401);

  const handleJWTExpirationError = (err) =>
  new AppError("Token expired, Please login again", 401);

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorForPro = (err, res) => {
  //if this is a trusted(we know and handeled before in controller and appError) error then send it to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //if the error not trusted then send genertic to the client and log it to consol for developers
  } else {
    console.error("Error", err);
    res.status(500).json({
      status: "error",
      message: "something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = err;
    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError(error);
    if (err.name === "TokenExpiredError") error = handleJWTExpirationError(error);

    sendErrorForPro(error, res);
  }
};
