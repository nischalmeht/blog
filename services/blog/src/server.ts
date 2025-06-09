import express from "express";
import dotenv from "dotenv";
// import cors from "cors";
import cors from "cors"
import { createClient } from "redis";
import { startCacheConsumer } from "./utils/consumer";
// import {sql} from "./utils/db";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
// connectDb();
startCacheConsumer()
console.log(process.env.REDIS_URL,"process.env.REDIS_URL");
export const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient
  .connect()
  .then(() => console.log("Connected to redis"))
  .catch(console.error);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});