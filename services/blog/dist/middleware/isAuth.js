"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                message: "Please Login - No auth header",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decodeValue = jsonwebtoken_1.default.verify(token, process.env.JWT_SEC);
        if (!decodeValue || !decodeValue.user) {
            res.status(401).json({
                message: "Invalid token",
            });
            return;
        }
        req.user = decodeValue.user;
        next();
    }
    catch (error) {
        console.log("JWT verification error: ", error);
        res.status(401).json({
            message: "Please Login - Jwt error",
        });
    }
};
exports.isAuth = isAuth;
