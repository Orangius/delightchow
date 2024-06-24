import { NextFunction, Request, Response } from "express";

// .................route protection........................
export const authenticate = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (request.isAuthenticated()) {
    return next();
  } else {
    return response.status(401).send({ message: "unauthenticated" });
  }
  //return response.redirect("http://localhost:5173/api/admin/login");
};

export const authorize = (role: string) => {
  return (request: Request, response: Response, next: NextFunction) => {
    if (request.user?.role !== role) {
      return response.status(403).send({ message: "unauthorized" });
    } else {
      next();
    }
  };
};
