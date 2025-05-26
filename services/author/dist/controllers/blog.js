"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlog = exports.createBlog = exports.deleteBlog = void 0;
const dataUri_js_1 = __importDefault(require("../utils/dataUri.js"));
const db_js_1 = require("../utils/db.js");
const TryCatch_js_1 = __importDefault(require("../utils/TryCatch.js"));
const cloudinary_1 = __importDefault(require("cloudinary"));
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
    // await invalidateChacheJob(["blogs:*", `blog:${req.params.id}`]);
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
    // await invalidateChacheJob(["blogs:*"]);
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
    // await invalidateChacheJob(["blogs:*", `blog:${id}`]);
    res.json({
        message: "Blog Updated",
        blog: updatedBlog[0],
    });
});
