import * as claimController from "@controllers/claim-controller";
import { admin } from "@middlewares/auth-middleware";
import { Router } from "express";

const router: Router = Router();

router.post("/:policyId", claimController.claimPolicy);
router.patch("/approve/:claimId", admin, claimController.approveClaim);
router.patch("/reject/:claimId", admin, claimController.rejectClaim);
router.get("/", admin, claimController.getClaims);

export default router;
