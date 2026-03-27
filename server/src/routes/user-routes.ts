import * as userController from "@controllers/user-controller";
import { Router } from "express";

const router: Router = Router();

router.patch("/update", userController.updateProfile);

export default router;
