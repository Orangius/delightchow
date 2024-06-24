import { NextFunction, Request, Response } from "express";

// .................route protection........................
const checkAuthenticated = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (request.isAuthenticated()) {
    return next();
  } else {
    return response.status(401).send({ message: "Not unauthenticated" });
  }
  //return response.redirect("http://localhost:5173/api/admin/login");
};
