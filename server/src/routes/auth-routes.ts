import * as authController from "@controllers/auth-controller";
import { Router } from "express";
import { authLimiter } from "@/middlewares/rate-limit-middleware";

const router: Router = Router();

/**
 * POST /api/auth/register
 * Register new user account
*/
router.post("/register", authLimiter, authController.register);

router.post("/register/admin", authLimiter, authController.registerAdmin);

/**
 * POST /api/auth/login
 * Login user
*/
router.post("/login", authLimiter, authController.login);

router.post("/login/admin", authLimiter, authController.loginAdmin);

/**
 * POST /api/auth/logout
 * Logout user (clear refresh token)
*/
router.post("/logout", authController.logout);

export default router;
