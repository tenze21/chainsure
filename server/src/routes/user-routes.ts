import * as userController from "@controllers/user-controller";
import { admin } from "@/middlewares/auth-middleware";
import { Router } from "express";

const router: Router = Router();

router.get("/admin", admin, userController.getUsers);
router.route("/").get(userController.getUserDetails).patch(userController.updateProfile);
router.patch("/:id/status", admin, userController.updateUserStatus);

export default router;
