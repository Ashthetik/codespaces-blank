import { parentPort } from "worker_threads";
import crypto from "node:crypto";
import { IUser, findUserByKey } from "../../common/database/models/User.model";

async function RDecrypt(data: string, key: string): Promise<string> {
    const buffer = Buffer.from(data);
    const user: IUser | null = await findUserByKey(key);
    
    if (!user) {
        return "Invalid Key";
    } else {
       const decrypted = crypto.privateDecrypt({
            key: key,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        }, buffer);
        return decrypted.toString("utf-8");
    }
}

parentPort?.on('message', async (message) => {
    const { data, key } = message;
    const decrypted = await RDecrypt(data, key);
    parentPort?.postMessage({ decrypted });
});