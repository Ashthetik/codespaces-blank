import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import BlockList from "../../common/database/models/JWT.model";

const blockList: Promise<string[]> = BlockList.findOne({ id: 1 }).then((o) => o?.blocked as string[]);
config();

export async function verifyToken(
    req: Request, res: Response, next: NextFunction
) {
    const authHeader = req.headers["authorization"];
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        if ((await blockList).includes(token)) {
            return res.status(401).send({
                message: "Unauthorized",
                error: [
                    "Invalid Auth Token. Please Sign In, Again."
                ]
            });
        }


        jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
            if (err) {
                return res.status(403).send({
                    message: "Unauthorized",
                    error: [
                        "Invalid Auth Token. Please Sign In, Again."
                    ]
                })
            }

            // @ts-ignore
            req.user = user;
            next();
        });
    } else {
        return res.status(401).send({
            message: "Unauthorized",
            error: [
                "Missing Authorization Header(s)."
            ]
        })
    }
}

export async function createToken(
    req: Request, res: Response, next: NextFunction
) {
    const { email, password } = req.body;
    const header = req.headers["authorization"]?.split(" ")[1];

    if (
        (await blockList).includes(header as string) ||
        (await blockList).includes(
            req.headers["authorization"]
                ?.split(" ")[1] as string ?? ""
        )
    ) {
        return res.status(401).send({
            message: "Unauthorized",
            error: [
                "Unexpected Auth Header. Please Try Again Without an Auth Header."
            ]
        });
    }

    const token = jwt.sign(
        { email, password },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );
    
    // Pass the token to the next middleware
    // @ts-ignore
    req.token = token;
    next();
}

