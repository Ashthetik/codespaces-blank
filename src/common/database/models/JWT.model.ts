import { Schema, model } from "mongoose";

const BlockList = new Schema({
    blocked: [
        String
    ],
    id: {
        type: Number,
        default: 1
    }
});

export default model("BlockList", BlockList);