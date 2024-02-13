import express, { Request, Response } from "express";
import { verifyToken } from "../../controllers/auth/jwt.controller";

const router = express.Router();

// POST Routes for OCR, Face Detection, and Image Classification
router.post("/vision/ocr", [
    verifyToken,
]);
router.post("/vision/face", [
    verifyToken,
]);
router.post("/vision/classify", [
    verifyToken,
]);

// GET Routes for Description of OCR, Face Detection, and Image Classification
router.get("/vision/ocr");
router.get("/vision/face");
router.get("/vision/classify");