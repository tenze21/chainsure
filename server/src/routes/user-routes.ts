import * as userController from "@controllers/user-controller";
import { Router } from "express";

const router: Router = Router();

router.route("/").get(userController.getUserDetails).patch(userController.updateProfile);
router.get("/policy", userController.getUserPolicies);
router.get("/claims", userController.getUserClaims);

export default router;
