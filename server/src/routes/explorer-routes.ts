import * as explorerController from "@controllers/explorer-controller";
import { Router } from "express";

const router: Router = Router();

router.get("/:tokenId", explorerController.getNFT);

export default router;
