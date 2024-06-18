import { Router, Request, Response } from "express";
import { db } from "@/db/db.js";
import { users } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { body, validationResult } from "express-validator";
import bcryptjs from "bcryptjs";
import {
  validateNewUser,
  validatePatchRequest,
} from "@/middlewares/user_validation.js";

const router = Router();

router.get("/users/:id", async (request, response) => {
  const parsedId = parseInt(request.params.id);
  if (isNaN(parsedId)) {
    return response.status(400).send({ message: "Invalid user ID" });
  }
  try {
    const result = await db
      .select({
        user_id: users.user_id,
        surname: users.surname,
        lastname: users.lastname,
        email: users.email,
        phone: users.phone,
        address: users.address,
      })
      .from(users)
      .where(eq(users.user_id, parsedId));
    console.log(result);

    if (!result[0]) return response.status(404).send({ msg: "User not found" });
    response.status(200).send(result[0]);
  } catch (err) {
    response.status(500).send({ msg: "An error occured" });
    console.log("Error: ", err);
  }
});

// validation of user post request before it is stored in the database

// post request for creating a new user
router.post(
  "/users",
  validateNewUser,
  async (request: Request, response: Response) => {
    const { body } = request;
    const result = validationResult(request);
    if (!result.isEmpty()) {
      return response.status(400).send({ errors: result.array() });
    }
    const passwordSalt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(body.password, passwordSalt);
    try {
      const res = await db
        .insert(users)
        .values({
          surname: body.surname,
          lastname: body.lastname,
          password: hashedPassword,
          address: body.address,
          email: body.email,
          phone: body.phone,
        })
        .returning({ insertedId: users.user_id });

      response.status(201).send(res);
    } catch (err: any) {
      switch (err.code) {
        case "23505":
          return response.status(409).send({ msg: "email already exists" });
          break;
      }
    }
  }
);

// update the entire user data
router.put(
  "/users/:id",
  validateNewUser,
  async (request: Request, response: Response) => {
    const {
      body,
      params: { id },
    } = request;
    const result = validationResult(request);
    if (!result.isEmpty()) {
      return response.status(400).send({ error: result.array() });
    }

    const parsedId = parseInt(id);
    if (isNaN(parsedId))
      return response.status(400).send({ message: "Invalid user ID" });
    try {
      await db
        .update(users)
        .set({
          surname: body.surname,
          lastname: body.lastname,
          password: body.password,
          phone: body.phone,
          address: body.address,
          email: body.email,
        })
        .where(eq(users.user_id, parsedId));
      response.status(200).send({ msg: "Successful" });
    } catch (err) {
      console.log(err);
    }
  }
);

// patch a user data
router.patch(
  "/users/:id",
  validatePatchRequest,
  async (request: Request, response: Response) => {
    const {
      body,
      params: { id },
    } = request;
    console.log(body, id);
    const parsedId = parseInt(id);
    if (isNaN(parsedId))
      return response.status(400).send({ message: "Invalid user ID" });

    try {
      await db
        .update(users)
        .set({
          ...body,
        })
        .where(eq(users.user_id, parsedId));
      response.status(200).send({ msg: "Successful" });
    } catch (err) {
      console.log(err);
    }
  }
);

// delete a user
router.delete("/users/:id", async (request, response) => {
  const {
    params: { id },
  } = request;
  const parsedId = parseInt(id);
  if (isNaN(parsedId))
    return response.status(400).send({ message: "Invalid user ID" });

  try {
    const res = await db
      .delete(users)
      .where(eq(users.user_id, parsedId))
      .returning({ deletedId: users.user_id });
    console.log("res is : ", res);
    if (res[0]) response.status(200).send({ msg: "Successful" });
    else response.status(404).send({ msg: "User not found" });
  } catch (err) {
    console.log(err);
  }
});

export default router;
