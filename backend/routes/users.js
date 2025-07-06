const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const userServices = require('../services/userServices');
const { validateName, validateGender, validateDate, validateEmail, validatePassword, validateContactNumber, validateAddress, validateRole } = require('../middlewares/validators.js');
const { authenticateToken, authorizeRole, authorizeAccess } = require('../middlewares/auth');

// Get all users
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const users = await userServices.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user by ID
router.get('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const user = await userServices.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a user
router.post('/', authenticateToken, authorizeRole(['admin']), upload.single('image'), async (req, res) => {
    try {
        // Validate request body
        const { first_name, last_name, gender, role = 'user', date_of_birth, email, password, contact_number, address } = req.body;

        const errors = {
            first_name: validateName(first_name),
            last_name: validateName(last_name),
            gender: validateGender(gender),
            role: validateRole(role),
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

        // If there are errors, throw an error
        if (Object.keys(actualErrors).length > 0) {
            throw new Error(`Validation errors: ${JSON.stringify(actualErrors)}`);
        }

        // Get the image file path from multer
        const image = req.file?.path || null;

        const newUser = await userServices.createUser(first_name, last_name, gender, role, date_of_birth, email, password, contact_number, address, image);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user
router.put('/:id', authenticateToken, authorizeRole(['admin']), upload.single('image'), async (req, res) => {
    try {
        // Validate request body
        const { first_name, last_name, gender, date_of_birth, email, contact_number, address } = req.body;

        const errors = {
            first_name: validateName(first_name),
            last_name: validateName(last_name),
            gender: validateGender(gender),
            date_of_birth: validateDate(date_of_birth),
            email: validateEmail(email),
            contact_number: validateContactNumber(contact_number),
            address: validateAddress(address)
        };

        // Filter out null errors
        const actualErrors = Object.entries(errors)
            .filter(([_, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        // If there are errors, throw an error
        if (Object.keys(actualErrors).length > 0) {
            throw new Error(`Validation errors: ${JSON.stringify(actualErrors)}`);
        }

        // Get the image file path from multer
        const image = req.file?.path || null;

        const updated = await userServices.updateUser(req.params.id, first_name, last_name, gender, date_of_birth, email, contact_number, address, image);
        if (!updated) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Password
router.patch('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        // Validate request body
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        // Validate the new password
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            throw new Error(passwordError);
        }

        // Check if the new passwords match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }

        // Call the service to update the password
        const updated = await userServices.updatePassword(req.params.id, currentPassword, newPassword);
        if (!updated) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const deleted = await userServices.deleteUser(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
