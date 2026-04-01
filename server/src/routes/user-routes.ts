import * as userController from "@controllers/user-controller";
import { Router } from "express";

const router: Router = Router();

router.route("/").get(userController.getUserDetails).patch(userController.updateProfile);

export default router;
