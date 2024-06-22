import { body } from "express-validator";
export const validateNewUser = [
    body("surname")
        .isString()
        .withMessage("Name must be a string")
        .notEmpty()
        .withMessage("Name must not be empty")
        .trim(),
    body("lastname")
        .isString()
        .withMessage("Name must be a string")
        .notEmpty()
        .withMessage("Name must not be empty")
        .trim(),
    body("email", "Field must be an email").trim().isEmail(),
    body("password")
        .isLength({ min: 6, max: 50 })
        .withMessage("Password must be 6-50 characters"),
    body("phone")
        .isString()
        .notEmpty()
        .withMessage("Phone number cannot be empty")
        .trim(),
    body("address").isString().notEmpty().withMessage("Address cannot be empty"),
];
export const validatePatchRequest = [
    body("surname")
        .optional()
        .isString()
        .withMessage("Name must be a string")
        .notEmpty()
        .withMessage("Name must not be empty")
        .trim(),
    body("lastname")
        .optional()
        .isString()
        .withMessage("Name must be a string")
        .notEmpty()
        .withMessage("Name must not be empty")
        .trim(),
    body("email", "Field must be an email").optional().trim().isEmail(),
    body("password")
        .optional()
        .isLength({ min: 6, max: 50 })
        .withMessage("Password must be 6-50 characters"),
    body("phone")
        .optional()
        .isString()
        .notEmpty()
        .withMessage("Phone number cannot be empty")
        .trim(),
    body("address")
        .optional()
        .isString()
        .notEmpty()
        .withMessage("Address cannot be empty"),
];
