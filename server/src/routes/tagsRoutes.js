import { Router } from "express";
import { getTags } from "../controllers/tagsController.js";
const router = Router();
router.get("/", getTags);
export default router;
