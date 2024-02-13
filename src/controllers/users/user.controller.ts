import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../../common/database/models/User.model";
import emailValidation from "../../common/validator/email";
import jwt from "jsonwebtoken";
import consoleHelper from "../../tools/logger";
import BlockList from "../../common/database/models/JWT.model";

const blockList: Promise<string[]> = BlockList.findOne({ id: 1 }).then((o) => o?.blocked as string[]);

class UserController {
    static async register(
        req: Request, res: Response, next: NextFunction
    ) {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).send({
                message: "Unauthorized",
                error: [
                    "Missing Required Credentials. Please Check Username/Email/Password, And Try Again."
                ]
            });
        }

        if (!emailValidation(email)) {
            return res.status(400).send({
                message: "Unauthorized",
                error: [
                    "Invalid Email Given. Please Confirm Email And Retry."
                ]
            });
        }

        const user = await User.findOne({ email: email});

        if (user) {
            return res.status(406).send({
                message: "Not Acceptable",
                error: [
                    "Error Creating User. Please Try Again."
                ]
            });
        }

        const newUser = new User({
            username: username,
            email: email,
            passwd: password,
        });

        await newUser.save().catch((e) => {
            consoleHelper.stdin.error(`Error saving new User:\n${e}`);

            return res.status(500).send({
                message: "Internal Server Error"
            });
        });

        // We're only giving 0's public and 1's private to the user
        const redactedKeys = {
            outbound: {
                public: newUser.keys[0].public,
            },
            inbound: {
                private: newUser.keys[0].private
            }
        }

        const redactedUser = {
            username: newUser.username,
            email: newUser.email,
            verified: newUser.verified,
            keys: redactedKeys
        }

        const token: string = (req as any).token;
        (req as any).token = null;

        return res.status(201).send({
            message: "User created successfully",
            jwt_token: token,
            user: redactedUser
        });
    }

    static async login(
        req: Request, res: Response, next: NextFunction
    ) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({
                message: "Unauthorized",
                error: [
                    "Missing Required Credentials. Please Check Username/Email/Password, And Try Again."
                ]
            });
        }

        if (!emailValidation(email)) {
            return res.status(400).send({
                message: "Unauthorized",
                error: [
                    "Invalid Email Given. Please Confirm Email And Retry."
                ]
            });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).send({
                message: "Unauthorized",
                error: [
                    "Invalid Credentials Given. Please Try Again."
                ]
            });
        }

        // @ts-ignore The Typescript compiler doesn't know that the matchPassword method exists
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).send({
                message: "Unauthorized",
                error: [
                    "Invalid Credentials Given. Please Try Again."
                ]
            });
        }

        if (
            (await blockList).includes(user.token as string) || 
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
            { id: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        return res.status(200).send({
            message: "Login successful",
            token: token
        });
    }

    static async logout(
        req: Request, res: Response, next: NextFunction
    ) {
        const { email, password } = req.body;
        const header = req.headers["authorization"]?.split(" ")[1];

        if (!email || !password) {
            return res.status(400).send({
                message: "Unauthorized",
                error: [
                    "Missing Required Credentials. Please Check Username/Email/Password, And Try Again."
                ]
            });
        }

        if (!header) {
            return res.status(400).send({
                message: "Unauthorized",
                error: [
                    "Missing Auth Header. Please Retry With Header."
                ]
            });
        }

        if (!emailValidation(email)) {
            return res.status(400).send({
                message: "Unauthorized",
                error: [
                    "Invalid Email Given. Please Confirm Email And Retry."
                ]
            });
        }

        // @ts-ignore
        const isMatch = await User.findOne({ email: email }).matchPassword(password);
        
        if (!isMatch) {
            return res.status(401).send({
                message: "Unauthorized",
                error: [
                    "Invalid Credentials Given. Please Try Again."
                ]
            });
        }

        if (req.destroyed) {
            (await blockList).push(header);
        } else {
            (await blockList).push(header);
        }

        return res.status(200).send({
            message: "Session Terminated.\nPlease Log In to continue using the service"
        });
    }
}

export default UserController;