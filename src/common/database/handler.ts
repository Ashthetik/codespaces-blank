import mongoose from "mongoose";
import consoleHelper from "../../tools/logger";

mongoose.Promise = global.Promise;

const connectWithRetry = async (maxCount: number) => {
    console.log("MongoDB connection with retry");
    for (let i = 0; i < maxCount; i++) {
        if (maxCount === i && i === 0) {
            throw new EvalError("maxCount must be greater than 0");
        }

        const connection = mongoose.createConnection();

        const created = await connection.openUri(process.env.MONGO_URI as string);
        created.on("error", (err) => {
            consoleHelper.stdin.error(`MongoDB connection unsuccessful, retry after 5 seconds.\nError: \n${err}`);
            setTimeout(connectWithRetry, 5000);
        });

        created.once("open", () => {
            consoleHelper.stdout.info("MongoDB connection successful");
        });

        created.on("disconnected", () => {
            consoleHelper.stdout.warn("MongoDB connection disconnected, retrying after 5 seconds");
            setTimeout(connectWithRetry, 5000);
        });

        created.on("reconnected", () => {
            consoleHelper.stdout.info("MongoDB connection reconnected");
        });

        created.on("close", () => {
            consoleHelper.stdout.warn("MongoDB connection closed, retrying after 5 seconds");
            setTimeout(connectWithRetry, 5000);
        });
    }
};

export default connectWithRetry;
