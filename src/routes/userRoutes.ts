import { Router } from "express";
import UserController from "@controllers/userController";
import AuthController from "@controllers/authController";

export default function createUserRoutes(
  userController: UserController,
  authController: AuthController
): Router {
  const router = Router();

  router.post("/create", authController.register.bind(authController));

  return router;
}
