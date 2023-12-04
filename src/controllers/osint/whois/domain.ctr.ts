import { NextFunction, Request, Response } from "express";
import User from "../../../common/database/models/User.model";
import jwt from "jsonwebtoken";
import BlockList from "../../../common/database/models/JWT.model";
import { SuperfaceClient } from "@superfaceai/one-sdk";
import { resolve, join } from "path";
import { Worker } from "worker_threads";

const blockList: Promise<string[]> = BlockList.findOne({ id: 1 }).then((o) => o?.blocked as string[]);

export default class WhoIsController {
    static async domain(
        req: Request, res: Response, next: NextFunction
    ) {

        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).send({
                message: "Unauthorized",
                error: [
                    "Missing Authorization Header(s)."
                ]
            });
        }

        const token = authorization.split(" ")[1];
        if ((await blockList).includes(token)) {
            return res.status(401).send({
                message: "Unauthorized",
                error: [
                    "Invalid Auth Token. Please Sign In, Again."
                ]
            });
        }

        jwt.verify((req as any).jwt, process.env.JWT_SECRET as string, (err: any, user: any) => {
            if (err) {
                return res.status(403).send({
                    message: "Unauthorized",
                    error: [
                        "Invalid JWT Token. Please Sign In, Again."
                    ]
                })
            }

            // @ts-ignore
            req.user = user;
            next();
        });

        const user = await User.findOne({
            token: token
        });

        if (!user) {
            return res.status(401).send({
                message: "Unauthorized",
                error: [
                    "Invalid Credentials Given. Please Try Again."
                ]
            });
        }

        const { domain } = req.body;
        if (!domain) {
            return res.status(400).send({
                message: "Bad Request",
                error: [
                    "Missing Required Parameter: domain"
                ]
            });
        }

        const worker = new Worker(
            resolve(
                join(
                    __dirname, "..", "..", "..", "workers", "osint", "domain.worker.js"
                )
            ), {
            workerData: {
                domain: domain
            }
        });

        let data: any = {};

        worker.on('message', (message) => {
            return data = message.data;
        });

        worker.on('error', (err) => {
            console.error(err);
            return res.status(500).send({
                message: "Internal Server Error",
                error: [
                    "An unexpected error occurred while processing your request. Please try again."
                ]
            });
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
                return res.status(500).send({
                    message: "Internal Server Error",
                    error: [
                        "An unexpected error occurred while processing your request. Please try again."
                    ]
                });
            }
        });

        return res.status(200).send({
            message: "OK",
            data: data
        });
    }

    static async ip(
        req: Request, res: Response, next: NextFunction
    ) {
        const SDK = new SuperfaceClient();
        const profile = await SDK.getProfile("address/ip-geolocation@1.0.1");
        

        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).send({
                message: "Unauthorized",
                error: [
                    "Missing Authorization Header(s)."
                ]
            });
        }

        const token = authorization.split(" ")[1];
        if ((await blockList).includes(token)) {
            return res.status(401).send({
                message: "Unauthorized",
                error: [
                    "Invalid Auth Token. Please Sign In, Again."
                ]
            });
        }

        jwt.verify((req as any).jwt, process.env.JWT_SECRET as string, (err: any, user: any) => {
            if (err) {
                return res.status(403).send({
                    message: "Unauthorized",
                    error: [
                        "Invalid JWT Token. Please Sign In, Again."
                    ]
                })
            }

            // @ts-ignore
            req.user = user;
            next();
        });

        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(401).send({
                message: "Unauthorized",
                error: [
                    "Invalid Credentials Given. Please Try Again."
                ]
            });
        }

        const { ip } = req.body;
        if (!ip) {
            return res.status(400).send({
                message: "Bad Request",
                error: [
                    "Missing Required Parameter: ip"
                ]
            });
        }

        const result = await profile.getUseCase("IpGeolocation").perform({
            ipAddress: ip
        }, {
            provider: "ipdata",
            security: {
                apikey: {
                    apikey: process.env.IPDATA_KEY as string
                }
            }
        });

        try {
            const data = result.unwrap();
            return res.status(200).send({
                message: "OK",
                data: data
            });
        } catch (err) {
            return res.status(500).send({
                message: "Internal Server Error",
                error: [
                    "An unexpected error occurred while processing your request. Please try again."
                ]
            });
        }
    }
}
