import logger from "winston";
import { ErrorRequestHandler } from "express";

export const logErrors: ErrorRequestHandler = (error, req, res, next) => {
  logger.error(error.stack);
  next(error);
};

export const clientErrorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  if (req.xhr) {
    res.status(500).send({ error: error });
  } else {
    next(error);
  }
};

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  res.status(500).send(`<div>${error}</div>`);
};
