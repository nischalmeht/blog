"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blog_js_1 = require("../controllers/blog.js");
const isAuth_js_1 = require("../middleware/isAuth.js");
const router = express_1.default.Router();
router.get("/blog/all", blog_js_1.getAllBlogs);
router.get("/blog/:id", blog_js_1.getSingleBlog);
router.post("/comment/:id", isAuth_js_1.isAuth, blog_js_1.addComment);
router.get("/comment/:id", blog_js_1.getAllComments);
router.delete("/comment/:commentid", isAuth_js_1.isAuth, blog_js_1.deleteComment);
router.post("/save/:blogid", isAuth_js_1.isAuth, blog_js_1.saveBlog);
router.get("/blog/saved/all", isAuth_js_1.isAuth, blog_js_1.getSavedBlog);
exports.default = router;
