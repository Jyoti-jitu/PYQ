const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Register a new user
const register = async (req, res) => {
    const { email, password, fullName, rollNumber, phone, branch, semester } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('students')
            .select('*')
            .or(`email.eq.${email},roll_number.eq.${rollNumber}`)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or roll number already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert into custom students table
        const { data, error } = await supabase
            .from('students')
            .insert([
                {
                    full_name: fullName,
                    roll_number: rollNumber,
                    email: email,
                    phone: phone,
                    branch: branch,
                    semester: semester,
                    password_hash: passwordHash
                }
            ])
            .select()
            .single();

        if (error) {
            return res.status(error.status || 400).json({ error: error.message });
        }

        res.status(201).json({ message: 'Registration successful', user: data });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Login an existing user
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Find user by email
        const { data: user, error } = await supabase
            .from('students')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Compare password hash
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Return user data (excluding password)
        const { password_hash, ...safeUserData } = user;

        res.status(200).json({
            message: 'Login successful',
            user: safeUserData,
            // Assuming we don't strictly need a JWT session token for the current simplified flow,
            // or we could generate one here if the frontend requires it. 
            // The frontend just currently checks 'message'.
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Request password reset
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Find user by email
        const { data: user, error } = await supabase
            .from('students')
            .select('id')
            .eq('email', email)
            .single();

        if (error || !user) {
            // Do not reveal if the user exists or not, just return success
            return res.status(200).json({ message: 'If an account with that email exists, a reset link has been generated.' });
        }

        // Generate reset token and expiry
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

        // Save token to database
        const { error: updateError } = await supabase
            .from('students')
            .update({
                reset_token: resetToken,
                reset_token_expiry: resetTokenExpiry
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error saving reset token:', updateError);
            return res.status(500).json({ error: 'Failed to generate reset request' });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        // Log to console (in real app, this would be emailed)
        console.log(`\n\n=== PASSWORD RESET LINK GENERATED ===\nCopy and paste this link into your browser to reset your password:\n${resetUrl}\n=====================================\n\n`);

        res.status(200).json({
            message: 'Password reset link generated. Check the backend console for the link.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Reset password using token
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
    }

    try {
        // Find user by token and ensure not expired
        const { data: user, error } = await supabase
            .from('students')
            .select('id, reset_token_expiry')
            .eq('reset_token', token)
            .single();

        if (error || !user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const now = new Date();
        const expiry = new Date(user.reset_token_expiry);

        if (now > expiry) {
            return res.status(400).json({ error: 'Reset token has expired' });
        }

        // Hash new password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password and clear token
        const { error: updateError } = await supabase
            .from('students')
            .update({
                password_hash: passwordHash,
                reset_token: null,
                reset_token_expiry: null
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error resetting password:', updateError);
            return res.status(500).json({ error: 'Failed to reset password' });
        }

        res.status(200).json({ message: 'Password has been successfully reset' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};
