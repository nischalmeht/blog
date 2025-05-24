"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myProfile = void 0;
const TryCatch_1 = __importDefault(require("../utils/TryCatch"));
exports.myProfile = (0, TryCatch_1.default)(async (req, res) => {
    const user = req.user;
    res.json(user);
});
