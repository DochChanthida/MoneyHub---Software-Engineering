const express = require('express')
const router = express.Router()

// Import route modules
const userRoutes = require('./users')
const requestRoutes = require('./requests')
const assignmentRoutes = require('./assignments')
const rateRoutes = require('./rates')
const authRoutes = require('./auth')
const profileRoutes = require('./profile')

// Mounting routes
router.use('/users', userRoutes)
router.use('/requests', requestRoutes)
router.use('/assignments', assignmentRoutes)
router.use('/rates', rateRoutes)
router.use('/auth', authRoutes)
router.use('/profile', profileRoutes)

module.exports = router