import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";

import session from "express-session";
import "dotenv/config";
import "@/strategies/local-strategy.js";
import passport from "passport";
import cors from "cors";

import productRouter from "@/routes/products.js";
import orderRoutes from "@/routes/orders.js";
import authROuter from "@/routes/auth.js";
import genFunc from "connect-pg-simple";
import userRoutes from "@/routes/users.js";

const PostgresqlStore = genFunc(session);
const sessionStore = new PostgresqlStore({
  conString: process.env.DATABASE_URL as string,
});

const app = express();

//body parser middleware to parse request body
// this parses the json type

const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.COOKIE_SECRET as string,
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    sameSite: "none",
  },
});

const corsOptions = {
  origin: "https://delightchow-frontend.vercel.app", // Replace with your client's origin
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allow specified methods
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

// ......................Routes registration...................................
app.use("/api", authROuter);
app.use("/api", userRoutes);
app.use("/api", productRouter);
app.use("/api", orderRoutes);

app.get("/", (request, response) => {
  response.send("Welcome to delight chow");
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
