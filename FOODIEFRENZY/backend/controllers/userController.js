import { User } from '../modals/index.js'; // Import from the new index.js
import jwt from 'jsonwebtoken';
import bycrypt from 'bcrypt';
import validator from 'validator';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

// LOGIN USER
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.json({ success: false, message: "User Doesn't Exist" });
        }
        const isMatch = await bycrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }
        const token = createToken(user.id);
        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// REGISTER USER
export const registerUser = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const exists = await User.findOne({ where: { email } });
        if (exists) {
            return res.json({ success: false, message: "User Already Exists" });
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please Enter A Valid Email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please Enter A Strong Password" });
        }
        const salt = await bycrypt.genSalt(10);
        const hashedPassword = await bycrypt.hash(password, salt);

        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPassword
        });
        const token = createToken(newUser.id);
        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};