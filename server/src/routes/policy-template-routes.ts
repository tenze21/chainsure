import * as templateController from "@controllers/policy-template-controller";
import { Router } from "express";
import { admin, authenticate } from "@/middlewares/auth-middleware";

const router: Router = Router();

router.route("/category").get(templateController.getCategories).post(authenticate, admin, templateController.createCategory);

router.route("/").post(authenticate, admin, templateController.createTemplate).get(templateController.getTemplates);
router.route("/:id").get(templateController.getTemplateById).patch(authenticate, admin, templateController.updateTemplate);

export default router;
