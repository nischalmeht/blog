"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateChacheJob = exports.publishToQueue = exports.connectRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
let channel;
const connectRabbitMQ = async () => {
    try {
        // const connection = await amqp.connect({
        //   // protocol: "amqp",
        //   // hostname: "localhost", // or 'rabbitmq-container' if inside Docker
        //   // port: 5672,
        //   // username: "admin",
        //   // password: "admin123",
        // });
        const connection = await amqplib_1.default.connect("amqp://localhost");
        // channel = await connection.createChannel();
        // console.log("✅ Connected to RabbitMQ");
        // const connection = await amqp.connect({
        //   protocol: "amqp",
        //   hostname: "localhost",
        //   port: 5672,
        //   username: "admin",
        //   password: "admin123",
        // });
        channel = await connection.createChannel();
        console.log("✅ Connected to Rabbitmq");
        // console.log("Message sent.");
    }
    catch (error) {
        console.error("❌ Failed to connect to RabbitMQ", error);
    }
};
exports.connectRabbitMQ = connectRabbitMQ;
const publishToQueue = async (queueName, message) => {
    if (!channel) {
        console.error("Rabbitmq channel is not intialized");
        return;
    }
    console.log(queueName, 'queueName');
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};
exports.publishToQueue = publishToQueue;
const invalidateChacheJob = async (cacheKeys) => {
    try {
        const message = {
            action: "invalidateCache",
            keys: cacheKeys,
        };
        console.log('cacheKeys', cacheKeys);
        await (0, exports.publishToQueue)("cache-invalidation", message);
        console.log("✅ Cache invalidation job published to Rabbitmq");
    }
    catch (error) {
        console.error("❌ Failed to Publish cache on Rabbitmq", error);
    }
};
exports.invalidateChacheJob = invalidateChacheJob;
