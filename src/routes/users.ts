import { Router } from "express";

import {
  validateNewUser,
  validatePatchRequest,
} from "@/validators/user_validation.js";
import { authenticate } from "@/middlewares/authMiddleware.js";
import {
  deleteUser,
  getUserById,
  patchUpdateUser,
  putUpdateUser,
  registerNewUser,
} from "@/controllers/users.js";

const router = Router();

router.get("/users/:id", getUserById);

router.post("/register", validateNewUser, registerNewUser);

// update the entire user data
router.put("/users/:id", authenticate, validateNewUser, putUpdateUser);

// patch a user data
router.patch("/users/:id", authenticate, validatePatchRequest, patchUpdateUser);

// delete a user
router.delete("/users/:id", authenticate, deleteUser);

export default router;
