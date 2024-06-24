import { Router } from "express";
import {
  validateProductPatchBody,
  validateProductPostBody,
} from "@/validators/product_validation.js";

///.............packages needed for upload.......................
// import { Upload } from "@aws-sdk/lib-storage";
// import fs from "fs";
import { s3Upload } from "@/s3/s3.js";
import { authenticate, authorize } from "@/middlewares/authMiddleware.js";
import {
  addNewProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  patchUpdateProduct,
} from "@/controllers/products.js";

const productRouter = Router();

productRouter.get("/products", getAllProducts);

productRouter.get("/products/:id", getProductById);

productRouter.post(
  "/products",
  authenticate,
  authorize("admin"),
  s3Upload.single("file"),
  validateProductPostBody,
  addNewProduct
);

productRouter.patch(
  "/products/:id",
  authenticate,
  authorize("admin"),
  validateProductPatchBody,
  patchUpdateProduct
);

productRouter.delete(
  "/products/:id",
  authenticate,
  authorize("admin"),
  deleteProduct
);

export default productRouter;
