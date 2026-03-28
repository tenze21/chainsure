import * as proposalController from "@controllers/proposal-controller";
import { Router } from "express";
import { admin } from "@/middlewares/auth-middleware";

const router: Router = Router();

router.post("/:templateId", proposalController.createProposal);

router.get("/user", proposalController.getUserProposals);

router.get("/admin", admin, proposalController.getProposals);

router.get("/:id", proposalController.getProposal);

router.route("/:id").get(proposalController.getProposal).patch(admin, proposalController.rejectProposal);

export default router;
