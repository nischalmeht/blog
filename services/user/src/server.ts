import express from "express";
import dotenv from "dotenv";
// import cors from "cors";
import cors from "cors"
import connectDb from "./utils/db";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
connectDb();


const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});