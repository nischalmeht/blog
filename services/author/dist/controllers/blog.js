"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiDescriptionResponse = exports.aiTitleResponse = exports.updateBlog = exports.createBlog = exports.deleteBlog = void 0;
const dataUri_js_1 = __importDefault(require("../utils/dataUri.js"));
const db_js_1 = require("../utils/db.js");
const TryCatch_js_1 = __importDefault(require("../utils/TryCatch.js"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const genai_1 = require("@google/genai");
const rabbitmq_1 = require("../utils/rabbitmq");
// import  {GoogleGenerativeAI}  from "@google/genai";
// import { GoogleGenerativeAI } from "@google/generative-ai";
exports.deleteBlog = (0, TryCatch_js_1.default)(async (req, res) => {
    const blog = await (0, db_js_1.sql) `SELECT * FROM blogs WHERE id = ${req.params.id}`;
    if (!blog.length) {
        res.status(404).json({
            message: "No blog with this id",
        });
        return;
    }
    if (blog[0].author !== req.user?._id) {
        res.status(401).json({
            message: "You are not author of this blog",
        });
        return;
    }
    await (0, db_js_1.sql) `DELETE FROM savedblogs WHERE blogid = ${req.params.id}`;
    await (0, db_js_1.sql) `DELETE FROM comments WHERE blogid = ${req.params.id}`;
    await (0, db_js_1.sql) `DELETE FROM blogs WHERE id = ${req.params.id}`;
    await (0, rabbitmq_1.invalidateChacheJob)(["blogs:*", `blog:${req.params.id}`]);
    res.json({
        message: "Blog Delete",
    });
});
exports.createBlog = (0, TryCatch_js_1.default)(async (req, res) => {
    const { title, description, blogcontent, category } = req.body;
    const file = req.file;
    if (!file) {
        res.status(400).json({
            message: "No file to upload",
        });
        return;
    }
    const fileBuffer = (0, dataUri_js_1.default)(file);
    if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
            message: "Failed to generate buffer",
        });
        return;
    }
    const cloud = await cloudinary_1.default.v2.uploader.upload(fileBuffer.content, {
        folder: "blogs",
    });
    const result = await (0, db_js_1.sql) `INSERT INTO blogs (title, description, image, blogcontent,category, author) VALUES (${title}, ${description},${cloud.secure_url},${blogcontent},${category},${req.user?._id}) RETURNING *`;
    // await invalidateChacheJob(["blogs:"])
    await (0, rabbitmq_1.invalidateChacheJob)(["blogs:*",]);
    res.json({
        message: "Blog Created",
        blog: result[0],
    });
});
exports.updateBlog = (0, TryCatch_js_1.default)(async (req, res) => {
    const { id } = req.params;
    const { title, description, blogcontent, category } = req.body;
    const file = req.file;
    const blog = await (0, db_js_1.sql) `SELECT * FROM blogs WHERE id = ${id}`;
    if (!blog.length) {
        res.status(404).json({
            message: "No blog with this id",
        });
        return;
    }
    if (blog[0].author !== req.user?._id) {
        res.status(401).json({
            message: "You are not author of this blog",
        });
        return;
    }
    let imageUrl = blog[0].image;
    if (file) {
        const fileBuffer = (0, dataUri_js_1.default)(file);
        if (!fileBuffer || !fileBuffer.content) {
            res.status(400).json({
                message: "Failed to generate buffer",
            });
            return;
        }
        const cloud = await cloudinary_1.default.v2.uploader.upload(fileBuffer.content, {
            folder: "blogs",
        });
        imageUrl = cloud.secure_url;
    }
    const updatedBlog = await (0, db_js_1.sql) `UPDATE blogs SET 
    title = ${title || blog[0].title},
    description = ${title || blog[0].description},
    image= ${imageUrl},
    blogcontent = ${title || blog[0].blogcontent},
    category = ${title || blog[0].category}
  
    WHERE id = ${id}
    RETURNING *
    `;
    await (0, rabbitmq_1.invalidateChacheJob)(["blogs:*", `blog:${id}`]);
    res.json({
        message: "Blog Updated",
        blog: updatedBlog[0],
    });
});
exports.aiTitleResponse = (0, TryCatch_js_1.default)(async (req, res) => {
    const { text } = req.body;
    const prompt = `Correct the grammar of the following blog title and return only the corrected title without any additional text, formatting, or symbols: "${text}"`;
    let result;
    const ai = new genai_1.GoogleGenAI({
        apiKey: process.env.Gemini_Api_Key,
    });
    async function main() {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });
        let rawtext = response.text;
        if (!rawtext) {
            res.status(400).json({
                message: "Something went wrong",
            });
            return;
        }
        result = rawtext
            .replace(/\*\*/g, "")
            .replace(/[\r\n]+/g, "")
            .replace(/[*_`~]/g, "")
            .trim();
    }
    await main();
    res.json(result);
});
exports.aiDescriptionResponse = (0, TryCatch_js_1.default)(async (req, res) => {
    const { title, description } = req.body;
    const prompt = description === ""
        ? `Generate only one short blog description based on this 
  title: "${title}". Your response must be only one sentence, strictly under 30 words, with no options, no greetings, and 
  no extra text. Do not explain. Do not say 'here is'. Just return the description only.`
        : `Fix the grammar in the 
  following blog description and return only the corrected sentence. Do not add anything else: "${description}"`;
    let result;
    const ai = new genai_1.GoogleGenAI({
        apiKey: process.env.Gemini_Api_Key,
    });
    async function main() {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });
        let rawtext = response.text;
        if (!rawtext) {
            res.status(400).json({
                message: "Something went wrong",
            });
            return;
        }
        result = rawtext
            .replace(/\*\*/g, "")
            .replace(/[\r\n]+/g, "")
            .replace(/[*_`~]/g, "")
            .trim();
    }
    await main();
    res.json(result);
});
// export const aiBlogResponse = TryCatch(async (req, res) => {
//   const prompt = ` You will act as a grammar correction engine. I will provide you with blog content 
// in rich HTML format (from Jodit Editor). Do not generate or rewrite the content with new ideas. Only correct 
// grammatical, punctuation, and spelling errors while preserving all HTML tags and formatting. Maintain inline styles, 
// image tags, line breaks, and structural tags exactly as they are. Return the full corrected HTML string as output. `;
//   const { blog } = req.body;
//   if (!blog) {
//     res.status(400).json({
//       message: "Please provide blog",
//     });
//     return;
//   }
//   const fullMessage = `${prompt}\n\n${blog}`;
//   const ai = new GoogleGenerativeAI(process.env.Gemini_Api_Key as string);
//   const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" });
//   const result = await model.generateContent({
//     contents: [
//       {
//         role: "user",
//         parts: [
//           {
//             text: fullMessage,
//           },
//         ],
//       },
//     ],
//   });
//   const responseText = await result.response.text();
//   const cleanedHtml = responseText
//     .replace(/^(html|```html|```)\n?/i, "")
//     .replace(/```$/i, "")
//     .replace(/\*\*/g, "")
//     .replace(/[\r\n]+/g, "")
//     .replace(/[*_`~]/g, "")
//     .trim();
//   res.status(200).json({ html: cleanedHtml });
// });
