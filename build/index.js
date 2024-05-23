"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const stream_chat_1 = require("stream-chat");
const bcrypt_1 = require("bcrypt");
dotenv_1.default.config();
const { PORT, STREAM_API_KEY, STREAM_API_SECRET } = process.env;
const client = stream_chat_1.StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
const app = (0, express_1.default)();
app.use(express_1.default.json());
const salt = (0, bcrypt_1.genSaltSync)(10);
const USERS = [];
// Create user in Stream Chat
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: 'Email and password are required.',
        });
    }
    // Minlength 6
    if (password.length < 6) {
        return res.status(400).json({
            message: 'Password must be at least 6 characters.',
        });
    }
    const existingUser = USERS.find((user) => user.email === email);
    if (existingUser) {
        return res.status(400).json({
            message: 'User already exists.',
        });
    }
    try {
        const hashed_password = (0, bcrypt_1.hashSync)(password, salt);
        const id = Math.random().toString(36).substr(2, 9);
        const user = {
            id,
            email,
            hashed_password,
        };
        USERS.push(user);
        yield client.upsertUser({
            id,
            email,
            name: email,
        });
        // Create token for user
        const token = client.createToken(id);
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
            },
        });
    }
    catch (e) {
        return res.json({
            message: 'User already exists.',
        });
    }
}));
// Login user
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = USERS.find((user) => user.email === email);
    const hashed_password = (0, bcrypt_1.hashSync)(password, salt);
    if (!user || user.hashed_password !== hashed_password) {
        return res.status(400).json({
            message: 'Invalid credentials.',
        });
    }
    // Create token for user
    const token = client.createToken(user.id);
    return res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    });
}));
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
//# sourceMappingURL=index.js.map