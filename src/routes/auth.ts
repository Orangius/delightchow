import { Router } from "express";
import express, { Request, Response, NextFunction } from "express";
import passport from "passport";

const authRouter = Router();
authRouter.post(
  "/login",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: any,
        user: Express.User | false | null,
        info: object | string | Array<string | undefined>
      ) => {
        if (err) {
          console.log("err is: ", err.message);
          return next(err);
        }

        if (!user) {
          return res.status(401).send(info);
        }
        console.log("info: ", info);
        req.user = user;
        req.login(user, (err) => {
          // ! important
          if (err) {
            return res.status(500).send({ error: "Login failed." });
          }
          res.status(200).send();
        });
      }
    )(req, res, next);
  },
  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack); // Log the error stack trace for debugging
    res.status(err.status || 401).json({
      error: {
        message: err.message || "Invalid credentials",
      },
    });
  }
);
//

authRouter.post("/logout", function (request, response, next) {
  console.log("request user: ", request.user);
  request.logout(function (err) {
    if (err) {
      return next(err);
    }
    request.session.destroy(function (err) {
      // destroys the session
      response
        .status(200)
        .clearCookie("connect.sid")
        .send({ message: "Logout successful" }); // clear the cookie
    });

    //response.redirect("/");
  });
});

authRouter.get("/auth/status", (request, response) => {
  console.log("Request HeadersD: ", request.headers);
  console.log("user: ", request.user);
  if (!request.user)
    return response.status(401).send({ messge: "Unauthenticated" });
  return response.status(200).send({ messge: "Authenticated" });
});

export default authRouter;
