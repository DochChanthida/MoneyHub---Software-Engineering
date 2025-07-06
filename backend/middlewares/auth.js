const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

//For any user who sign in
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET); 
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

// Middleware to authorize roles
const authorizeRole = (roles) => {
    return (req, res, next) => {
        // Ensure the user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Check if the user's role is allowed
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
};

// Middleware for authorizing both admin and owner users
const authorizeAccess = (fetchResource) => {
    return async (req, res, next) => {
        try {
            // Fetch the resource using the provided function
            const resource = await fetchResource(req.params.id);

            if (!resource) {
                return res.status(404).json({ message: 'Resource not found' });
            }

            // Check if the user is an admin or the owner of the resource
            if (req.user.role !== 'admin' && req.user.id !== resource.user_id) {
                return res.status(403).json({ message: 'Access denied. You do not have permission to access this resource.' });
            }

            // Attach the resource to the request object
            req.resource = resource;

            next();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
};

module.exports = { authenticateToken, authorizeRole, authorizeAccess };
