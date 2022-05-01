const AppError = require('../utils/appError');

const handleCastErrorDB = err =>{
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err =>{
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const message = `Duplicate field value x, Please use another value!.`
}

const handleValidationErrorDB = err =>{

}

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  })
}

const sendErrorForPro = (err, res)=>{ 
  if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  }else{
    res.status(500).json({
      status: 'error',
      message: 'something went very long!'
    })
  }
  
}

module.exports = (err, req, res, next)=> {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if(process.env.NODE_ENV === 'development'){
      sendErrorForDev(err, res)
    }else if(process.env.NODE_ENV === 'production'){
      let error = {...err};

      if(error.name === "CastError") error = handleCastErrorDB(error);
      if(error.code === 11000) error = handleDuplicateFieldsDB(error);
      if(error.name === "ValidationError") error = handleValidationErrorDB(error);
      

      sendErrorForPro(error, res)
    }
  }