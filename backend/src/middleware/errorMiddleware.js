const errorHandler = (err, req, res, next) => {
  const code = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(code);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

function throwErrorWithMessagesOrCallNext(messages, res, next) {
  if (messages.length) {
    let error = new Error(messages.join(', '));
    res.status(400);
    throw error;
  } else {
    next();
  }
}

export { notFound, errorHandler, throwErrorWithMessagesOrCallNext };
