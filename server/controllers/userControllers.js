import User from "../models/User.js";
import Resume from "../models/Resume.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// POST: /api/users/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        const token = generateToken(newUser);

        const safeUser = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email
        };

        return res.status(201).json({
            message: "User registered successfully",
            user: safeUser,
            token
        });

    } catch (error) {
        return res.status(400).json({
            message: "Server error",
            error: error.message
        });
    }
};

// POST: /api/users/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user);

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email
        };

        return res.status(200).json({
            message: "User logged in successfully",
            user: safeUser,
            token
        });

    } catch (error) {
        return res.status(400).json({
            message: "Server error",
            error: error.message
        });
    }
};

// GET: /api/users/data
export const getUserById = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email
        };

        return res.status(200).json({ user: safeUser });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

// GET: /api/users/resumes
export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId;

        const resumes = await Resume.find({ userId });

        return res.status(200).json({ resumes });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};