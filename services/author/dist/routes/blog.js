"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAuth_1 = require("../middleware/isAuth");
const multer_1 = __importDefault(require("../middleware/multer"));
const blog_js_1 = require("../controllers/blog.js");
const router = (0, express_1.default)();
router.post("/blog/new", isAuth_1.isAuth, multer_1.default, blog_js_1.createBlog);
router.post("/blog/:id", isAuth_1.isAuth, multer_1.default, blog_js_1.updateBlog);
router.delete("/blog/:id", isAuth_1.isAuth, blog_js_1.deleteBlog);
router.post("/ai/title", blog_js_1.aiTitleResponse);
router.post("/ai/descripiton", blog_js_1.aiDescriptionResponse);
// router.post("/ai/blog", aiBlogResponse);
exports.default = router;
