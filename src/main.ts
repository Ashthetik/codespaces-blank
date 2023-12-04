import express, { Express } from "express";
import CORS from "cors";
import Helmet from "helmet";
import consoleHelper from "./tools/logger";
// import connectWithRetry from "./common/database/handler";
const UserRouter = require("./routes/user.routes"); 

const app: Express = express();
// const maxCount = (process.env.MAX_RETRY as any) || 5

app.use(CORS());
app.use(Helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);
app.set("PORT", process.env.PORT || 80);

// connectWithRetry(maxCount);

app.get("/", (req, res) => {
  res.status(200).send({
    status: "OK",
    time: new Date().toISOString(),
    message: "Hello, World!"
  })
});

app.use("/api/users", UserRouter);

app.listen(app.get("PORT"), () => {
  consoleHelper.stdout.info(`Server running: http://localhost:${app.get("PORT")}/`);
});