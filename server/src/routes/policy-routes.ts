import * as policyController from "@controllers/policy-controller";
import { admin } from "@middlewares/auth-middleware";
import { Router } from "express";

const router: Router = Router();

router.post("/:proposalId", admin, policyController.createPolicy);
router.get("/all", admin, policyController.getAllPolicies);

export default router;
