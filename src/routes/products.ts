import { Request, Response, Router } from "express";

import { foods } from "@/db/schema.js";
import { db } from "@/db/db.js";
import { eq } from "drizzle-orm";
import {
  validateProductPatchBody,
  validateProductPostBody,
} from "@/validators/product_validation.js";
import { validationResult } from "express-validator";

///.............packages needed for upload.......................
// import { Upload } from "@aws-sdk/lib-storage";
// import fs from "fs";
import { s3Upload } from "@/s3/s3.js";

const productRouter = Router();

productRouter.get("/products", async (request: Request, response: Response) => {
  //go into the database and get all the procuts and send over to the server
  // there is nothing to validate here
  try {
    const data = await db.select().from(foods);

    if (data.length === 0) return response.status(404).send("Not found");
    response.status(200).send(data);
  } catch (err) {
    response.status(500).send({ msg: "An error occured" });
  }
});

productRouter.get(
  "/products/:id",
  async (request: Request, response: Response) => {
    const parsedId = parseInt(request.params.id);
    if (isNaN(parsedId)) return response.status(400).send("Invalid ID");
    try {
      const data = await db
        .select()
        .from(foods)
        .where(eq(foods.food_id, parsedId));
      if (!data[0]) response.status(404).send({ msg: "Not found" });
      response.status(200).send(data[0]);
    } catch (error) {
      response.status(500).send("An error occured");
    }
  }
);

productRouter.post(
  "/products",
  s3Upload.single("file"),
  validateProductPostBody,
  async (request: Request, response: Response) => {
    const { body } = request;
    const result = validationResult(request);
    if (!result.isEmpty())
      return response.status(400).send({ error: result.array() });

    const file = request.file as Express.MulterS3.File;
    const imageURL = file.location;
    console.log("ImageUrl: ", imageURL);

    try {
      const insertedProduct = await db
        .insert(foods)
        .values({
          name: body.name,
          description: body.description,
          imageURL: imageURL,
          price: parseInt(body.price),
          category: body.category,
        })
        .returning({ insertedProduct: foods.food_id });
      return response.status(201).send(insertedProduct);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ msg: "An error occured" });
    }
  }
);

productRouter.patch(
  "/products/:id",
  validateProductPatchBody,
  async (request: Request, response: Response) => {
    const { body } = request;
    const parsedId = parseInt(request.params.id);
    const result = validationResult(request);
    if (isNaN(parsedId))
      return response.status(400).send({ msg: "Invalid product ID" });
    if (!result.isEmpty())
      return response.status(400).send({ error: result.array() });
    try {
      const returnedProduct = await db
        .update(foods)
        .set({
          ...body,
        })
        .where(eq(foods.food_id, parsedId))
        .returning({ id: foods.food_id });
      return response.status(200).send(returnedProduct);
    } catch (error) {
      console.log(error);
      response.status(500).send({ msg: "An error occured" });
    }
  }
);

productRouter.delete(
  "/products/:id",
  async (request: Request, response: Response) => {
    const parsedId = parseInt(request.params.id);
    if (isNaN(parsedId))
      return response.status(400).send({ msg: "Invalid product ID" });
    try {
      const deletedFood = await db
        .delete(foods)
        .where(eq(foods.food_id, parsedId))
        .returning({ deletedId: foods.food_id });
      if (deletedFood.length === 0)
        return response.status(404).send({ msg: "Product not found" });
      return response.status(200).send(deletedFood);
    } catch (error) {
      console.log(error);
      response.status(500).send({ msg: "An error occured" });
    }
  }
);

export default productRouter;
