"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePic = exports.loginUser = exports.updateUser = exports.getUserProfile = exports.myProfile = void 0;
const TryCatch_1 = __importDefault(require("../utils/TryCatch"));
const user_1 = __importDefault(require("../model/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloudinary_1 = require("cloudinary");
const dataUri_1 = __importDefault(require("../utils/dataUri"));
exports.myProfile = (0, TryCatch_1.default)(async (req, res) => {
    const user = req.user;
    res.json(user);
});
exports.getUserProfile = (0, TryCatch_1.default)(async (req, res) => {
    const user = await user_1.default.findById(req.params.id);
    if (!user) {
        res.status(404).json({
            message: "No user with this id",
        });
        return;
    }
    res.json(user);
});
exports.updateUser = (0, TryCatch_1.default)(async (req, res) => {
    const { name, instagram, facebook, linkedin, bio } = req.body;
    const user = await user_1.default.findByIdAndUpdate(req.user?._id, {
        name,
        instagram,
        facebook,
        linkedin,
        bio,
    }, { new: true });
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SEC, {
        expiresIn: "5d",
    });
    res.json({
        message: "User Updated",
        token,
        user,
    });
});
exports.loginUser = (0, TryCatch_1.default)(async (req, res) => {
    // const { code } = req.body;
    // if (!code) {
    //   res.status(400).json({
    //     message: "Authorization code is required",
    //   });
    //   return;
    // }
    // const googleRes = await oauth2client.getToken(code);
    // oauth2client.setCredentials(googleRes.tokens);
    // const userRes = await axios.get(
    //   `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    // );
    const { email, name, } = req.body;
    let user = await user_1.default.findOne({ email });
    if (!user) {
        user = await user_1.default.create({
            name,
            email,
            // image: picture,
        });
    }
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SEC, {
        expiresIn: "5d",
    });
    res.status(200).json({
        message: "Login success",
        token,
        user,
    });
});
exports.updateProfilePic = (0, TryCatch_1.default)(async (req, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).json({
            message: "No file to upload",
        });
        return;
    }
    const fileBuffer = (0, dataUri_1.default)(file);
    if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
            message: "Failed to generate buffer",
        });
        return;
    }
    const cloud = await cloudinary_1.v2.uploader.upload(fileBuffer.content, {
        folder: "blogs",
    });
    const user = await user_1.default.findByIdAndUpdate(req.user?._id, {
        image: cloud.secure_url,
    }, { new: true });
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SEC, {
        expiresIn: "5d",
    });
    res.json({
        message: "User Profile pic updated",
        token,
        user,
    });
});
