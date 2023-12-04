import { Request, Response, NextFunction } from "express"
import { join, resolve } from "path";
import { Worker } from "worker_threads";

export function decryptBody(
    req: Request, res: Response, next: NextFunction
) {
    const worker = new Worker(
        resolve(
            join(
                __dirname, "..", "..", "workers", "auth", "decrypt.worker.js"
            )
        ), {
            workerData: {
                body: req.body
            }
        }
    )

    worker.on('message', (message) => {
        req.body = message.decrypted;
        next();
    });
    
    worker.on('error', (err) => {
        console.log(`Error decrypting body:\n${err}`);
        res.status(500).send({
            message: "Error decrypting body.",
            error: [
                "Please verify that you are sending the correct data and keys."
            ]
        });
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.log(`Worker stopped with exit code ${code}`);
            res.status(500).send({
                message: "Error decrypting body.",
                error: [
                    "Please verify that you are sending the correct data and keys."
                ]
            });
        } else {
            next();
        }
    });
}

export function encryptBody(
    req: Request, res: Response, next: NextFunction
) {
    const worker = new Worker(
        resolve(
            join(
                __dirname, "..", "..", "workers", "auth", "encrypt.worker.js"
            )
        ), {
            workerData: {
                body: req.body
            }
        }
    )

    worker.on('message', (message) => {
        req.body = message.encrypted;
        next();
    });
    
    worker.on('error', (err) => {
        console.log(`Error encrypting body:\n${err}`);
        res.status(500).send({
            message: "Error encrypting body.",
            error: [
                "Please verify that you are sending the correct data and keys."
            ]
        });
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.log(`Worker stopped with exit code ${code}`);
            res.status(500).send({
                message: "Error encrypting body.",
                error: [
                    "Please verify that you are sending the correct data and keys."
                ]
            });
        } else {
            next();
        }
    });
}