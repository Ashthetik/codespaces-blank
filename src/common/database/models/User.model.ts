import { Schema, model } from 'mongoose';
import { Worker } from 'node:worker_threads';
import {
    join, resolve
} from "node:path";
import crypto, { randomBytes, randomFill } from "node:crypto";
import JWTModel from './JWT.model';

import consoleHelper from '../../../tools/logger';

const UserSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => {
            crypto.randomUUID({
                "disableEntropyCache": false,
            });
        }
    },
    username: {
        type: String,
        required: true,
        unique: false,
        minlength: 3,
        maxlength: 32
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwd: {
        type: String,
        required: true,
        unique: false,
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    jwt: {
        type: JWTModel.schema,
        required: false,
        unique: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        default: () => {
            let sect1:string = Math.floor(new Date().getTime() / 1000).toString(); // Seconds since epoch
            // Convert Sect1 into B64
            sect1 = Buffer.from(sect1).toString('base64');
            
            let sect2 = crypto.randomBytes(32).toString('hex'); // Random 32 byte string
            // The most vital part of the token, the signature
            // This is a HMAC SHA512 hash of the first two parts + an auto-generated secret
            const secret = randomBytes(48).toString('hex');
            let sect3 = crypto.createHmac("SHA512", secret).update(`${sect1}.${sect2}`).digest('hex');
            
            // The token format will be: {sect1}.{sect2}+{sect3}
            return `${sect1}.${sect2}+${sect3}`;
        }
    },
    // Keys Structure:
    // { 0: { public: string, private: string }, 1: { public: string, private: string } }
    keys: {
        type: [{ public: String, private: String }],
        required: true,
        unique: true,
        default: () => {
            const keypair = crypto.generateKeyPairSync("rsa", {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: "spki",
                    format: "pem"
                },
                privateKeyEncoding: {
                    type: "pkcs8",
                    format: "pem"
                }
            });

            const keypair2 = crypto.generateKeyPairSync("rsa", {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: "spki",
                    format: "pem"
                },
                privateKeyEncoding: {
                    type: "pkcs8",
                    format: "pem"
                }
            });
            
            // Keys Structure:
            // { 0: { public: string, private: string }, 1: { public: string, private: string } }
            return [
                {
                    public: keypair.publicKey,
                    private: keypair.privateKey
                },
                {
                    public: keypair2.publicKey,
                    private: keypair2.privateKey
                }
            ];
        }
    }
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified("passwd")) {
        return next();
    }

    const worker = new Worker(
        resolve(
            join(
                __dirname, "..", "..", "workers", "database", "hash.worker.js"
            )
        ), {
        workerData: {
            password: this.passwd
        }
    });

    worker.on('message', (message) => {
        this.passwd = message.hashedPassword;
        next();
    });

    worker.on('error', (err) => {
        consoleHelper.stdin.error(`Error hashing new Password:\n${err}`);
        next(err);
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            consoleHelper.stdin.error(`Worker stopped with exit code ${code}`);
            next(new Error(`Worker stopped with exit code ${code}`));
        }
    });
});

UserSchema.methods.matchPassword = async function(password: string) {
    const worker = new Worker(
        resolve(
            join(
                __dirname, "..", "..", "workers", "database", "compare.worker.js"
            )
        ), {
        workerData: {
            password: this.passwd,
            givenpassword: password
        }
    });

    worker.on('message', (message) => {
        return message.isSame;
    });

    worker.on('error', (err) => {
        consoleHelper.stdin.error(`Error comparing Password:\n${err}`);
        return false;
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            consoleHelper.stdin.error(`Worker stopped with exit code ${code}`);
            return false;
        }
    });
}

// Create a type for the User Model
export interface IUser {
    id: string;
    username: string;
    email: string;
    passwd: string;
    verified: boolean;
    jwt: typeof JWTModel;
    token: string;
    keys: string[];
}

const UserModel = model("User", UserSchema);

export const findUserByKey = async (key: string): Promise<IUser | null>  => {
    return await UserModel.findOne({ keys: { $elemMatch: { $eq: key } } });
}

export default UserModel;