"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_js_1 = require("./utils/db.js");
const blog_js_1 = __importDefault(require("./routes/blog.js"));
const cloudinary_1 = require("cloudinary");
const rabbitmq_js_1 = require("./utils/rabbitmq.js");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.Cloud_Name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
(0, rabbitmq_js_1.connectRabbitMQ)();
const port = process.env.PORT;
async function initDB() {
    try {
        await (0, db_js_1.sql) `
        CREATE TABLE IF NOT EXISTS blogs(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        blogcontent TEXT NOT NULL,
        image VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        await (0, db_js_1.sql) `
        CREATE TABLE IF NOT EXISTS comments(
        id SERIAL PRIMARY KEY,
        comment VARCHAR(255) NOT NULL,
        userid VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        await (0, db_js_1.sql) `
        CREATE TABLE IF NOT EXISTS savedblogs(
        id SERIAL PRIMARY KEY,
        userid VARCHAR(255) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        console.log("database initialized successfully");
    }
    catch (error) {
        console.log("Error initDb", error);
    }
}
app.use("/api/v1", blog_js_1.default);
initDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
});
