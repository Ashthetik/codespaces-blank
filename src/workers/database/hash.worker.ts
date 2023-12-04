import { parentPort } from "worker_threads";
import bcrypt from 'bcrypt';

parentPort?.on('message', async (message) => {
  const { password } = message;
  const hashedPassword = await bcrypt.hash(password, 15);
  parentPort?.postMessage({ hashedPassword });
});