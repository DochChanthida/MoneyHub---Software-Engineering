require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Replace with your API key
const API_KEY = process.env.API_KEY;
const BASE_URL = `https://api.currencyapi.com/v3/latest`;

// Endpoint to fetch exchange rates
router.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}?apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exchange rates' });
    }
});

module.exports = router;