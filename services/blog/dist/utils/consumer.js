"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCacheConsumer = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const server_js_1 = require("../server.js");
const db_js_1 = require("./db.js");
const startCacheConsumer = async () => {
    try {
        const connection = await amqplib_1.default.connect({
            protocol: "amqp",
            hostname: process.env.Rabbimq_Host,
            port: 5672,
            username: process.env.Rabbimq_Username,
            password: process.env.Rabbimq_Password,
        });
        const channel = await connection.createChannel();
        const queueName = "cache-invalidation";
        await channel.assertQueue(queueName, { durable: true });
        console.log("✅ Blog Service cache consumer started");
        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    console.log("📩 Blog service recieved cache invalidation message", content);
                    if (content.action === "invalidateCache") {
                        for (const pattern of content.keys) {
                            const keys = await server_js_1.redisClient.keys(pattern);
                            if (keys.length > 0) {
                                await server_js_1.redisClient.del(keys);
                                console.log(`🗑️ Blog service invalidated ${keys.length} cache keys matching: ${pattern}`);
                                const category = "";
                                const searchQuery = "";
                                const cacheKey = `blogs:${searchQuery}:${category}`;
                                const blogs = await (0, db_js_1.sql) `SELECT * FROM blogs ORDER BY create_at DESC`;
                                await server_js_1.redisClient.set(cacheKey, JSON.stringify(blogs), {
                                    EX: 3600,
                                });
                                console.log("🔄️ Cache rebuilt with key:", cacheKey);
                            }
                        }
                    }
                    channel.ack(msg);
                }
                catch (error) {
                    console.error("❌ Error processing cache invalidation in blog service:", error);
                    channel.nack(msg, false, true);
                }
            }
        });
    }
    catch (error) {
        console.error("❌ Failed to start rabbitmq consumer");
    }
};
exports.startCacheConsumer = startCacheConsumer;
