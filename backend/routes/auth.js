const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { login } = require('../services/authServices');
const { validateName, validateGender, validateDate, validateEmail, validatePassword, validateContactNumber, validateAddress } = require('../middlewares/validators');
const userServices = require('../services/userServices');
const passport = require('passport');
require('../config/passport');
const pool = require('../db');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate email and password
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        if (emailError || passwordError) {
            return res.status(400).json({ message: 'Validation errors', errors: { email: emailError, password: passwordError } });
        }

        // Query the database for the user by email
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.query(query, [email]); // MySQL returns rows as an array

        // Check if the user exists
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '3600s' }
        );
        // Respond with the token and user details
        res.json({
            message: 'Login successful',
            token,
            expiresIn: '3600s',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred during login', error: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        // Extract user details from the request body
        const { first_name, last_name, gender, date_of_birth, email, password, contact_number, address } = req.body;

        // Validate the input fields
        const errors = {
            first_name: validateName(first_name),
            last_name: validateName(last_name),
            gender: validateGender(gender),
            date_of_birth: validateDate(date_of_birth),
            email: validateEmail(email),
            password: validatePassword(password),
            contact_number: validateContactNumber(contact_number),
            address: validateAddress(address)
        };

        // Filter out null errors
        const actualErrors = Object.entries(errors)
            .filter(([_, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        // If there are validation errors, return them
        if (Object.keys(actualErrors).length > 0) {
            return res.status(400).json({ message: 'Validation errors', errors: actualErrors });
        }

        // Create the user in the database
        const newUser = await userServices.createUser(
            first_name,
            last_name,
            gender,
            'user', // Default role for registered users
            date_of_birth,
            email,
            password,
            contact_number,
            address,
            null  // No image provided during registration
        );

        // Respond with the created user (excluding sensitive information like password)
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to initiate Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route for Google to redirect to
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }), // Disable session
    (req, res) => {
        // Successful authentication
        const { user, token } = req.user; // Extract user and token
        res.redirect(`http://localhost:5500/frontend/index.html?token=${token}`);
    }
);

module.exports = router;