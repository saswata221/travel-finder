import { Router } from "express";
import {
  searchDestinations,
  getDestination,
} from "../controllers/destinationsController.js";
const router = Router();
router.get("/search", searchDestinations);
router.get("/:id", getDestination);
export default router;
