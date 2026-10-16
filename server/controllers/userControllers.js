import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
}

// controller for user registration
// POST: /api/users/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // check if required fields are present
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Missing required fields'
            });
        }

        // check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });
        const token = generateToken(newUser);
        newUser.password = undefined;

        return res.status(201).json({
            message: 'User registered successfully',
            user: newUser,
            token
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// controller for user login
// POST: /api/users/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        //check  if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'Invalid email or password'

            });
        }
        //check if password is correct
        const isPasswordValid = user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }
        //return success msg 
        const token = generateToken(user);
        user.password = undefined;
        return res.status(200).json({
            message: 'User logged in successfully',
            user,
            token
        });
    }
    catch (error) {
        return res.status(400).json({
            message: 'Server error',
            error: error.message
        });
    }
    // controller for getting user by id
    // GET: /api/users/data

    export const getUserById = async (req, res) => {
        try {
            const userId = req.userId;

            // check if user exists
            const user = await User.findById(userId)

            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }

            // return user
            user.password = undefined;
            return res.status(200).json({ user })

        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    }