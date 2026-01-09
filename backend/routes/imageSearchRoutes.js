import express from "express";
import multer from "multer";
import { imageSearch } from "../controllers/imageSearchController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

router.post("/", upload.single("file"), imageSearch);

export default router;
