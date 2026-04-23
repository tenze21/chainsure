import * as subscriptionController from "@controllers/subscription-controller";
import { admin } from "@middlewares/auth-middleware";
import { Router } from "express";

const router: Router = Router();

router.get("/", admin, subscriptionController.getSubscriptions);

export default router;
