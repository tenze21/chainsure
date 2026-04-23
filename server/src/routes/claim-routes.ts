import * as claimController from "@controllers/claim-controller";
import { Router } from "express";

const router: Router = Router();

router.post("/:policyId", claimController.claimPolicy);
router.patch("/approve/:claimId", claimController.approveClaim);
router.patch("/reject/:claimId", claimController.rejectClaim);

export default router;
