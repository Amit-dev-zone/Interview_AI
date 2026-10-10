const userModel = require("../models/user.model")
const tokenBlacklistModel = require("../models/blacklist.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const getCookieOptions = () => {
    const isProd = process.env.NODE_ENV === "production" || !!process.env.RENDER || !!process.env.FRONTEND_URL
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax"
    }
}

async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }

        const isUserAlreadyExist = await userModel.findOne({
            $or: [{ username }, { email }]
        })

        if (isUserAlreadyExist) {
            return res.status(400).json({
                message: isUserAlreadyExist.email === email 
                    ? "Account already exists with this email" 
                    : "Username is already taken"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, getCookieOptions())

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Register Controller Error:", error)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "field"
            return res.status(400).json({
                message: `Account with this ${field} already exists`
            })
        }
        return res.status(500).json({
            message: error.message || "Internal server error during registration"
        })
    }
}


async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide both email and password"
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, getCookieOptions())

        return res.status(200).json({
            message: "User LoggedIn Successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Login Controller Error:", error)
        return res.status(500).json({
            message: error.message || "Internal server error during login"
        })
    }
}

async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token", getCookieOptions())

        return res.status(200).json({
            message: "User LoggedOut Successfully"
        })
    } catch (error) {
        console.error("Logout Controller Error:", error)
        return res.status(500).json({
            message: error.message || "Internal server error during logout"
        })
    }
}

async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json({
            message: "User fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("GetMe Controller Error:", error)
        return res.status(500).json({
            message: error.message || "Internal server error fetching user"
        })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}

