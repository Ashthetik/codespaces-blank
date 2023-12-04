import { Express } from "express";

const UserRouter = require("./user/user.routes");
const OSINTRouter = require("./osint/osint.routes");
const AIRouter = require("./ai/ai.routes");
// const AuthRouter = require("./auth/auth.routes");

const router = (app: Express) => {
    app.use("/api/users", UserRouter);
    app.use("/api/osint", OSINTRouter);
    app.use("/api/ai", AIRouter);
    // app.use("/api/auth", AuthRouter);
};

export default router;