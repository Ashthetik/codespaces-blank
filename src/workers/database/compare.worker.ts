import { parentPort } from "worker_threads";
import bcrypt from 'bcrypt';

parentPort?.on('message', async (message) => {
    const { password, givenpassword } = message;
    const isSame = await bcrypt.compare(givenpassword, password);
    parentPort?.postMessage({ isSame });
});