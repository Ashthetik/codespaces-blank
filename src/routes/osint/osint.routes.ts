import express from "express";
import { verifyToken } from "../../controllers/auth/base.auth";
import { WhoIsController } from "../../controllers/osint/osint.ctr";
import { decryptBody } from "../../controllers/auth/rsa.auth";

const router = express.Router();

// POST Routes for OSINT lookups
router.post("/whois/domain", [
    decryptBody,
    verifyToken,
    WhoIsController.domain
]);
router.post("/whois/ip", [
    decryptBody,
    verifyToken,
    WhoIsController.ip
]);
router.post("/whois/email", [
    decryptBody,
    verifyToken,
]);
router.post("/whois/phone", [
    decryptBody,
    verifyToken,
]);
router.post("/whois/username", [
    decryptBody,
    verifyToken,
]);
router.post("/whois/name", [
    decryptBody,
    verifyToken,
]);
router.post("/whois/imei", [
    decryptBody,
    verifyToken,
]);

// GET Routes for OSINT lookups
router.get("/whois/results/:id", [
    decryptBody,
    verifyToken,
]);

// GET Routes for Threat Intelligence
router.get("/threat", []);
router.get("/threat/phishing", []);
router.get("/threat/maps", []);

// GET Routes for Threat Intelligence Results
router.get("/threat/results/:id", [
    decryptBody,
    verifyToken,
]);