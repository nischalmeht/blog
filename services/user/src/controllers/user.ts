import TryCatch from "../utils/TryCatch";
import User from "../model/user";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
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
  export const updateUser = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { name, instagram, facebook, linkedin, bio } = req.body;
  
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        name,
        instagram,
        facebook,
        linkedin,
        bio,
      },
      { new: true }
    );
  
    const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
      expiresIn: "5d",
    });
  
    res.json({
      message: "User Updated",
      token,
      user,
    });
  });
  