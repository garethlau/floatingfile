import { Request, Response, NextFunction } from "express";
let keys = ["secretdog", "secretcat"];

export default function requireKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.originalUrl.includes("/api/v4/subscriptions")) {
    return next();
  }
  if (!req.headers || !req.headers["api-key"]) {
    return res.status(403).send({ message: "Missing API Key." });
  }
  let isValid = false;
  keys.forEach((key) => {
    if (req.headers["api-key"] === key) {
      isValid = true;
      return;
    }
  });
  if (isValid) {
    return next();
  } else {
    return res.status(403).send({ message: "Invalid API Key." });
  }
}
