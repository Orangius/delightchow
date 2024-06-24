import { body } from "express-validator";

export const validateProductPostBody = [
  body("name")
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isString()
    .withMessage("Name must be a string")
    .trim(),
  body("description")
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isString()
    .withMessage("Name must be a string")
    .trim(),
  body("price")
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isNumeric()
    .withMessage("Name must be a number")
    .trim(),
  body("category")
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isString()
    .withMessage("Name must be a string")
    .trim(),
];

export const validateProductPatchBody = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isString()
    .withMessage("Name must be a string")
    .trim(),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isString()
    .withMessage("Name must be a string")
    .trim(),
  body("price")
    .optional()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isNumeric()
    .withMessage("Name must be a number")
    .trim(),
  body("category")
    .optional()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isString()
    .withMessage("Name must be a string")
    .trim(),
];
