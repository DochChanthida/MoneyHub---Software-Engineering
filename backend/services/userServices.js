const bcrypt = require('bcrypt');
const pool = require('../db');

// Get all users
const getAllUsers = async () => {
    const [rows] = await pool.query('SELECT id, first_name, last_name, gender, role, date_of_birth, email, contact_number, address, image FROM users');
    return rows;
};

// Get user by ID
const getUserById = async (id) => {
    const [rows] = await pool.query('SELECT id, first_name, last_name, gender, role, date_of_birth, email, contact_number, address, image FROM users WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
};

// Create a user
const createUser = async (first_name, last_name, gender, role = 'user', date_of_birth, email, password, contact_number, address, image) => {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const [result] = await pool.query(
        'INSERT INTO users (first_name, last_name, gender, role, date_of_birth, email, password, contact_number, address, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [first_name, last_name, gender, role, date_of_birth, email, hashedPassword, contact_number, address, image]
    );

    return { id: result.insertId, first_name, last_name, gender, role, date_of_birth, email, contact_number, address, image };
};

// Find or create a user
const findOrCreateUser = async (profile) => {
    // Check if the user already exists by email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [profile.email]);
    if (rows.length > 0) {
        return rows[0]; // Return the existing user
    }

        // Create a new user if not found
        const [result] = await pool.query(
            'INSERT INTO users (first_name, last_name, gender, role, date_of_birth, email, password, contact_number, address, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                profile.firstName, // Default first name if not provided
                profile.lastName,  // Default last name if not provided
                null,                           // Default gender if not provided
                'user',                         // Default role
                null,                           // No date of birth provided
                profile.email,                  // Email from the profile
                null,                           // No password for SSO users
                null,                           // No contact number provided
                null,
                null                            // No address provided
            ]
        );

        // Return the newly created user
        return {
            id: result.insertId,
            first_name: profile.firstName,
            last_name: profile.lastName,
            gender: null,
            role: 'user',
            date_of_birth: null,
            email: profile.email,
            contact_number: null,
            address: null,
            image: null
        };
};


// Update user
const updateUser = async (id, first_name, last_name, gender, date_of_birth, email, contact_number, address, image) => {
    const [result] = await pool.query(
        'UPDATE users SET first_name = ?, last_name = ?, gender = ?, date_of_birth = ?, email = ?, contact_number = ?, address = ?, image = ? WHERE id = ?',
        [first_name, last_name, gender, date_of_birth, email, contact_number, address, image, id]
    );

    return result.affectedRows > 0;
};

// Update Password
const updatePassword = async (id, currentPassword, newPassword) => {
    const connection = await pool.getConnection(); // Get a connection from the pool
    try {
        await connection.beginTransaction(); // Start a transaction

        // Fetch the user's current hashed password with a lock
        const [rows] = await connection.query('SELECT password FROM users WHERE id = ? FOR UPDATE', [id]);
        if (rows.length === 0) {
            throw new Error('User not found');
        }

        const hashedPassword = rows[0].password;

        // Verify the current password
        const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Hash the new password
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        const [result] = await connection.query(
            'UPDATE users SET password = ? WHERE id = ?', 
            [newHashedPassword, id]
        );

        await connection.commit(); // Commit the transaction
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback(); // Rollback the transaction on error
        throw error;
    } finally {
        connection.release(); // Release the connection back to the pool
    }
};

// Delete user
const deleteUser = async (id) => {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

// Export functions
module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    updatePassword,
    deleteUser,
    findOrCreateUser
};
