const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const bcrypt = require('bcrypt');
const userServices = require('../services/userServices');
const { validateName, validateGender, validateDate, validateEmail, validateContactNumber, validateAddress, validatePassword } = require('../middlewares/validators.js');
const { authenticateToken } = require('../middlewares/auth.js');

// View own profile
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await userServices.getUserById(req.user.id); // Use the authenticated user's ID
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Edit own profile
router.put('/', authenticateToken, upload.single('image'), async (req, res) => {
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

        // If there are errors, return a 400 response
        if (Object.keys(actualErrors).length > 0) {
            return res.status(400).json({ message: 'Validation errors', errors: actualErrors });
        }

        // Get the image file path from multer
        const image = req.file?.path || null;

        // Update the user's profile
        const updated = await userServices.updateUser(
            req.user.id,
            first_name,
            last_name,
            gender,
            date_of_birth,
            email,
            contact_number,
            address,
            image
        );

        if (!updated) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update own password
router.patch('/password', authenticateToken, async (req, res) => {
    try {
        // Validate request body
        const { current_password, new_password, confirm_new_password } = req.body;

        // Validate the new password
        const passwordError = validatePassword(new_password);
        if (passwordError) {
            return res.status(400).json({ message: passwordError });
        }

        // Check if the new passwords match
        if (new_password !== confirm_new_password) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }

        // Call the service to update the password
        const updated = await userServices.updatePassword(req.user.id, current_password, new_password);

        if (!updated) {
            return res.status(400).json({ message: 'Failed to update password. Please check your current password.' });
        }

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete own profile
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const deleted = await userServices.deleteUser(req.user.id); // Use the authenticated user's ID
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;