import express, { Request, Response } from "express";
import UserController from "../../controllers/users/user.controller";
import { verifyToken } from "../../controllers/auth/jwt.controller";

const router = express.Router();

router.post("/register", UserController.register);
router.post("/login", [
    UserController.login
]);
router.post("/logout", [
    verifyToken,
    UserController.logout
]);
router.get("/test", [
    verifyToken,
    (req: Request, res: Response) => {
        return res.status(200).send({
            message: "OK"
        });
    }
]);

module.exports = router;