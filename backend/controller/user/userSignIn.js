const bcrypt = require('bcryptjs')
const userModel = require('../../models/userModel')
const jwt = require('jsonwebtoken');

async function userSignInController(req, res) {
    try {
        console.log('🔍 Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
        const { email, password } = req.body

        if (!email) {
            console.log('❌ No email provided');
            throw new Error("Please provide email")
        }
        if (!password) {
            console.log('❌ No password provided');
            throw new Error("Please provide password")
        }

        const user = await userModel.findOne({ email })
        console.log('🔍 User found:', user ? { id: user._id, email: user.email, role: user.role } : 'Not found');

        if (!user) {
            console.log('❌ User not found for email:', email);
            throw new Error("User not found")
        }

        const checkPassword = await bcrypt.compare(password, user.password)
        console.log('🔍 Password check result:', checkPassword);

        if (checkPassword) {
            console.log('✅ Login successful for user:', user.email, 'role:', user.role);
            const tokenData = {
                _id: user._id,
                email: user.email,
            }
            const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: 60 * 60 * 8 });

            const tokenOption = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
            }

            const responseData = {
                message: "Login successfully",
                token: token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                success: true,
                error: false
            };

            console.log('📤 Sending login response:', {
                success: responseData.success,
                userRole: responseData.user.role,
                hasToken: !!responseData.token,
                userId: responseData.user._id
            });

            res.cookie("token", token, tokenOption).status(200).json(responseData)

        } else {
            throw new Error("Please check Password")
        }







    } catch (err) {
        console.log('❌ Login error:', err.message);
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false,
        })
    }

}

module.exports = userSignInController