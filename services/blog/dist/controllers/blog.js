"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedBlog = exports.saveBlog = exports.deleteComment = exports.getAllComments = exports.addComment = exports.getSingleBlog = exports.getAllBlogs = void 0;
const server_js_1 = require("../server.js");
const db_js_1 = require("../utils/db.js");
const TryCatch_js_1 = __importDefault(require("../utils/TryCatch.js"));
const axios_1 = __importDefault(require("axios"));
exports.getAllBlogs = (0, TryCatch_js_1.default)(async (req, res) => {
    const { searchQuery = "", category = "" } = req.query;
    const cacheKey = `blogs:${searchQuery}:${category}`;
    const cached = await server_js_1.redisClient.get(cacheKey);
    if (cached) {
        console.log("Serving from Redis cache");
        res.json(JSON.parse(cached));
        return;
    }
    let blogs;
    if (searchQuery && category) {
        blogs = await (0, db_js_1.sql) `SELECT * FROM blogs WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"}) AND category = ${category} ORDER BY create_at DESC`;
    }
    else if (searchQuery) {
        blogs = await (0, db_js_1.sql) `SELECT * FROM blogs WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"}) ORDER BY create_at DESC`;
    }
    else if (category) {
        blogs =
            await (0, db_js_1.sql) `SELECT * FROM blogs `;
    }
    else {
        blogs = await (0, db_js_1.sql) `SELECT * FROM blogs ORDER BY create_at DESC`;
    }
    console.log("Serving from db");
    await server_js_1.redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });
    res.json(blogs);
});
exports.getSingleBlog = (0, TryCatch_js_1.default)(async (req, res) => {
    const blogid = req.params.id;
    const cacheKey = `blog:${blogid}`;
    const cached = await server_js_1.redisClient.get(cacheKey);
    if (cached) {
        console.log("Serving single blog from Redis cache");
        res.json(JSON.parse(cached));
        return;
    }
    const blog = await (0, db_js_1.sql) `SELECT * FROM blogs WHERE id = ${blogid}`;
    if (blog.length === 0) {
        res.status(404).json({
            message: "no blog with this id",
        });
        return;
    }
    const { data } = await axios_1.default.get(`${process.env.USER_SERVICE}/api/v1/user/${blog[0].author}`);
    const responseData = { blog: blog[0], author: data };
    await server_js_1.redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });
    res.json(responseData);
});
exports.addComment = (0, TryCatch_js_1.default)(async (req, res) => {
    const { id: blogid } = req.params;
    const { comment } = req.body;
    await (0, db_js_1.sql) `INSERT INTO comments (comment, blogid, userid, username) VALUES (${comment}, ${blogid}, ${req.user?._id}, ${req.user?.name}) RETURNING *`;
    res.json({
        message: "Comment Added",
    });
});
exports.getAllComments = (0, TryCatch_js_1.default)(async (req, res) => {
    const { id } = req.params;
    const comments = await (0, db_js_1.sql) `SELECT * FROM comments WHERE blogid = ${id} ORDER BY create_at DESC`;
    res.json(comments);
});
exports.deleteComment = (0, TryCatch_js_1.default)(async (req, res) => {
    const { commentid } = req.params;
    const comment = await (0, db_js_1.sql) `SELECT * FROM comments WHERE id = ${commentid}`;
    console.log(comment);
    if (comment[0].userid !== req.user?._id) {
        res.status(401).json({
            message: "You are not owner of this comment",
        });
        return;
    }
    await (0, db_js_1.sql) `DELETE FROM comments WHERE id = ${commentid}`;
    res.json({
        message: "Comment Deleted",
    });
});
exports.saveBlog = (0, TryCatch_js_1.default)(async (req, res) => {
    const { blogid } = req.params;
    const userid = req.user?._id;
    if (!blogid || !userid) {
        res.status(400).json({
            message: "Missing blog id or userid",
        });
        return;
    }
    const existing = await (0, db_js_1.sql) `SELECT * FROM savedblogs WHERE userid = ${userid} AND blogid = ${blogid}`;
    if (existing.length === 0) {
        await (0, db_js_1.sql) `INSERT INTO savedblogs (blogid, userid) VALUES (${blogid}, ${userid})`;
        res.json({
            message: "Blog Saved",
        });
        return;
    }
    else {
        await (0, db_js_1.sql) `DELETE FROM savedblogs WHERE userid = ${userid} AND blogid = ${blogid}`;
        res.json({
            message: "Blog Unsaved",
        });
        return;
    }
});
exports.getSavedBlog = (0, TryCatch_js_1.default)(async (req, res) => {
    const blogs = await (0, db_js_1.sql) `SELECT * FROM savedblogs WHERE userid = ${req.user?._id}`;
    res.json(blogs);
});
