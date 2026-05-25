// This code creates a reusable error-handling wrapper middleware for Express.js

import { Request, Response, NextFunction, RequestHandler } from "express";

export const TryCatch = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
};
