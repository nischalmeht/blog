import TryCatch from "../utils/TryCatch.js";
import User from "../model/user.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import getBuffer from "../utils/dataUri.js";
export const myProfile = TryCatch(async (req, res) => {
    const user = req.user;
    res.json(user);
});
export const getUserProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404).json({
            message: "No user with this id",
        });
        return;
    }
    res.json(user);
});
export const updateUser = TryCatch(async (req, res) => {
    const { name, instagram, facebook, linkedin, bio } = req.body;
    const user = await User.findByIdAndUpdate(req.user?._id, {
        name,
        instagram,
        facebook,
        linkedin,
        bio,
    }, { new: true });
    const token = jwt.sign({ user }, process.env.JWT_SEC, {
        expiresIn: "5d",
    });
    res.json({
        message: "User Updated",
        token,
        user,
    });
});
export const loginUser = TryCatch(async (req, res) => {
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
    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            name,
            email,
            // image: picture,
        });
    }
    const token = jwt.sign({ user }, process.env.JWT_SEC, {
        expiresIn: "5d",
    });
    res.status(200).json({
        message: "Login success",
        token,
        user,
    });
});
export const updateProfilePic = TryCatch(async (req, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).json({
            message: "No file to upload",
        });
        return;
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
            message: "Failed to generate buffer",
        });
        return;
    }
    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs",
    });
    const user = await User.findByIdAndUpdate(req.user?._id, {
        image: cloud.secure_url,
    }, { new: true });
    const token = jwt.sign({ user }, process.env.JWT_SEC, {
        expiresIn: "5d",
    });
    res.json({
        message: "User Profile pic updated",
        token,
        user,
    });
});
