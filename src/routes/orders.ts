import { Router } from "express";

import { body, param } from "express-validator";
import {
  getAllOrders,
  getOrderbyId,
  patchUpdateOrders,
  placeOrder,
} from "@/controllers/orders.js";
import { validateOrderPostBody } from "@/validators/order_validation.js";
import { authenticate, authorize } from "@/middlewares/authMiddleware.js";

const orderRoutes = Router();

orderRoutes.get("/orders", getAllOrders);

orderRoutes.get(
  "/orders/:id",
  authenticate,
  authorize("admin"),
  param("id").isUUID().withMessage("Invalid order id"),
  getOrderbyId
);

orderRoutes.post("/orders", authenticate, validateOrderPostBody, placeOrder);

orderRoutes.patch(
  "/orders/:id",
  authenticate,
  authorize("admin"),
  param("id").isUUID().withMessage("Invalid order id"),
  body("status").notEmpty().withMessage("Status cannot be empty").isString(),
  patchUpdateOrders
);

export default orderRoutes;
