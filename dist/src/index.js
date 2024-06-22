import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/users/users.js";
import session from "express-session";
import "dotenv/config";
import "./strategies/local-strategy.js";
import passport from "passport";
import cors from "cors";
import productRouter from "./routes/admin/products.js";
import orderRoutes from "./routes/admin/orders.js";
import genFunc from "connect-pg-simple";
const PostgresqlStore = genFunc(session);
const sessionStore = new PostgresqlStore({
    conString: process.env.DATABASE_URL,
});
const app = express();
//body parser middleware to parse request body
// this parses the json type
console.log(process.env.COOKIE_SECRET);
const sessionMiddleware = session({
    store: sessionStore,
    secret: process.env.COOKIE_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
    },
});
const corsOptions = {
    origin: "http://localhost:5173", // Replace with your client's origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    allowedHeaders: ["Content-Type", "Authorization"], // Add any other headers you need
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// .................route protection........................
const checkAuthenticated = (request, response, next) => {
    if (request.isAuthenticated()) {
        return next();
    }
    else {
        return response.status(401).send({ message: "Not unauthorized" });
    }
    //return response.redirect("http://localhost:5173/api/admin/login");
};
// ......................Routes registration...................................
app.use("/api", userRoutes);
app.use("/api/admin", checkAuthenticated, productRouter);
app.use("/api/admin", checkAuthenticated, orderRoutes);
app.get("/", (request, response) => {
    response.send("Welcome to delight chow");
});
app.post("/api/login", (req, res, next) => {
    console.log("Request got here");
    passport.authenticate("local", (err, user, info) => {
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
    })(req, res, next);
}, (err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace for debugging
    res.status(err.status || 401).json({
        error: {
            message: err.message || "Invalid credentials",
        },
    });
});
//
app.post("/api/admin/logout", function (request, response, next) {
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
app.get("/api/auth/status", (request, response) => {
    console.log("Request HeadersD: ", request.headers);
    if (!request.user)
        return response.status(401).send({ messge: "Unauthenticated" });
    return response.status(200).send({ messge: "Authenticated" });
});
// app.post(
//   "/api/upload",
//   upload.single("avatar"),
//   async (request: Request, response: Response) => {
//     console.log("Body: ", request.body);
//     console.log("File: ", request.file);
//     const fileStream = fs.createReadStream(request.file?.path as string);
//     const upload = new Upload({
//       client: s3,
//       params: {
//         Bucket: process.env.BUCKET_NAME as string,
//         Key: request.file?.originalname,
//         Body: fileStream,
//         ContentType: request.file?.mimetype,
//       },
//     });
//     const result = await upload.done();
// const command = new PutObjectCommand({
//   Bucket: process.env.BUCKET_NAME as string,
//   Key: request.file?.originalname,
//   Body: fileStream,
//   ContentType: request.file?.mimetype,
// });
// const result = await s3.send(command);
//     console.log("result: ", result);
//     response.send("File received");
//   }
// );
app.listen(4000, () => {
    console.log("Listening on port 4000");
});
// {
//   "surname": "Ndu",
//   "lastname": "Bola",
//   "email": "bola@gmail.com",
//   "password": "123456",
//   "address": "Ebonyi",
//   "phone": "123456"
// }
