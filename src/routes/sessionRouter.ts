import { Router } from "express";
import AuthController from "@controllers/authController";

export default function createSessionRoutes(
  authController: AuthController
): Router {
  const router = Router();

  // Public routes
  router.post("/", authController.login.bind(authController));

  return router;
}
