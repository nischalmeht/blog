"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAuth_1 = require("../middleware/isAuth");
const blog_js_1 = require("../controllers/blog.js");
const router = (0, express_1.default)();
// router.post("/blog/new", isAuth, uploadFile, createBlog);
// router.post("/blog/:id", isAuth, uploadFile, updateBlog);
router.delete("/blog/:id", isAuth_1.isAuth, blog_js_1.deleteBlog);
// router.post("/ai/title", aiTitleResponse);
// router.post("/ai/descripiton", aiDescriptionResponse);
// router.post("/ai/blog", aiBlogResponse);
exports.default = router;
