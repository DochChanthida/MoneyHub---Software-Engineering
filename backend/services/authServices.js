const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;


const login = async (email, password) => {
    try {
    // Query the database for the user by email
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    // Check if the user exists
    if (result.rows.length === 0) {
        return { success: false, message: 'Invalid email or password' };
    }

    const user = result.rows[0];

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return { success: false, message: 'Invalid email or password' };
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role:user.role }, JWT_SECRET, { expiresIn: '3600s' });

    // Return the token and user information
    return { success: true, token, expiresIn, user: { id: user.id, email: user.email, role:user.role } };
    } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'An error occurred during login' };
    }
};

module.exports = { login };