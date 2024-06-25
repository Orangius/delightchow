import { body } from "express-validator";

export const validateOrderPostBody = [
  body("*.food_id")
    .notEmpty()
    .withMessage("food_id cannot be empty")
    .isInt()
    .withMessage("food id  must be a number"),

  body("*.food_quantity")
    .notEmpty()
    .withMessage("food quantity cannot be empty")
    .isNumeric()
    .withMessage("food price must be a number"),
];
