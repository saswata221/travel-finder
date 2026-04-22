import { Router } from "express";
import {
  batchDestinationPhotos,
  searchPhotos,
} from "../controllers/photosController.js";

const router = Router();

router.get("/search", searchPhotos);
router.post("/batch", batchDestinationPhotos);

export default router;

