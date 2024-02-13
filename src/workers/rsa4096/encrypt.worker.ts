import { parentPort } from "worker_threads";
import crypto from "node:crypto";
import { IUser, findUserByKey } from "../../common/database/models/User.model";

async function REncrypt(data: string, key: string): Promise<string> {
    const buffer = Buffer.from(data);
    const user: IUser | null = await findUserByKey(key);

    if (!user) {
        return "Invalid Key";
    } else {
        const encrypted = crypto.publicEncrypt({
            key: key,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        }, buffer);
        return encrypted.toString("base64");
    }
}

parentPort?.on('message', async (message) => {
    const { data, key } = message;
    const encrypted = await REncrypt(data, key);
    parentPort?.postMessage({ encrypted });
});