"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// import cors from "cors";
const cors_1 = __importDefault(require("cors"));
const blog_js_1 = __importDefault(require("./routes/blog.js"));
const redis_1 = require("redis");
const consumer_js_1 = require("./utils/consumer.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
(0, consumer_js_1.startCacheConsumer)();
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
exports.redisClient
    .connect()
    .then(() => console.log("Connected to redis"))
    .catch(console.error);
app.use("/api/v1", blog_js_1.default);
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
