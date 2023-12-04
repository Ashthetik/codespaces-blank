import express from "express";
import { refreshToken, verifyToken } from "../../controllers/auth/jwt.controller";

const router = express.Router();

router.post("/auth/refresh", [
    verifyToken,
    refreshToken
]);
