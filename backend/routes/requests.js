const express = require('express')
const router = express.Router()
const requestServices = require('../services/requestServices')
const userServices = require('../services/userServices')
const upload = require('../middlewares/multer'); // Import multer configuration
const { validateUserId, validateEmploymentStatus, validateJobTitle, validateAmount, validateRepaymentTerm, validatePurpose, validateCollateralType, validateName, validateGuarantorRelationship } = require('../middlewares/validators.js')
const { authenticateToken, authorizeRole, authorizeAccess } = require('../middlewares/auth');

// Get all requests
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const requests = await requestServices.getAllRequests()
        res.json(requests)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Get all requests made by the authenticated user
router.get('/myRequests', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRequests = await requestServices.getRequestsByUserId(userId);
        res.json(userRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get request by ID
router.get('/:id', authenticateToken, authorizeAccess(requestServices.getRequestById), async (req, res) => {
    try {
        const request = await requestServices.getRequestById(req.params.id)
        if (!request) {
            return res.status(404).json({ message: 'Request not found' })
        }
        res.json(request)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


// Create a request
router.post(
    '/',
    authenticateToken,
    upload.fields([
        { name: 'national_id', maxCount: 1 },
        { name: 'birth_certificate', maxCount: 1 },
        { name: 'family_record_book', maxCount: 1 },
        { name: 'carnet_de_residence', maxCount: 1 },
        { name: 'income_statement', maxCount: 1 },
        { name: 'ownership_proof', maxCount: 1 },
        { name: 'guarantor_national_id', maxCount: 1 },
        { name: 'guarantor_income_statement', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            // Extract user ID from the token
            const user_id = req.user.id; // Assuming the user ID is stored in the token

            // Fetch the user's profile details
            const user = await userServices.getUserById(user_id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if required profile fields are missing
            const missingFields = [];
            if (!user.gender) missingFields.push('gender');
            if (!user.date_of_birth) missingFields.push('date_of_birth');
            if (!user.contact_number) missingFields.push('contact_number');
            if (!user.address) missingFields.push('address');

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: 'Please update your profile before creating a request',
                    missingFields
                });
            }

            // Parse text fields from form-data
            const {
                employment_status,
                job_title,
                monthly_income,
                amount_request,
                repayment_term,
                purpose,
                collateral_type,
                estimated_value,
                guarantor_name,
                guarantor_relationship
            } = req.body;

            // Get file paths from multer
            const national_id = req.files['national_id']?.[0]?.path;
            const birth_certificate = req.files['birth_certificate']?.[0]?.path;
            const family_record_book = req.files['family_record_book']?.[0]?.path;
            const carnet_de_residence = req.files['carnet_de_residence']?.[0]?.path;
            const income_statement = req.files['income_statement']?.[0]?.path;
            const ownership_proof = req.files['ownership_proof']?.[0]?.path;
            const guarantor_national_id = req.files['guarantor_national_id']?.[0]?.path;
            const guarantor_income_statement = req.files['guarantor_income_statement']?.[0]?.path;

            // Validate request body
            const errors = {
                user_id: await validateUserId(user_id),
                employment_status: validateEmploymentStatus(employment_status),
                job_title: validateJobTitle(job_title),
                monthly_income: validateAmount(monthly_income),
                amount_request: validateAmount(amount_request),
                repayment_term: validateRepaymentTerm(repayment_term),
                purpose: validatePurpose(purpose),
                collateral_type: validateCollateralType(collateral_type),
                estimated_value: validateAmount(estimated_value),
                guarantor_name: validateName(guarantor_name),
                guarantor_relationship: validateGuarantorRelationship(guarantor_relationship)
            };

            // Filter out null errors
            const actualErrors = Object.entries(errors)
                .filter(([_, value]) => value !== null)
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

            // If there are validation errors, return a 400 response
            if (Object.keys(actualErrors).length > 0) {
                return res.status(400).json({ message: 'Validation errors', errors: actualErrors });
            }

            // Call the service to create the request
            const newRequest = await requestServices.createRequest(
                user_id,
                national_id,
                birth_certificate,
                family_record_book,
                carnet_de_residence,
                employment_status,
                job_title,
                monthly_income,
                income_statement,
                amount_request,
                repayment_term,
                purpose,
                collateral_type,
                estimated_value,
                ownership_proof,
                guarantor_name,
                guarantor_relationship,
                guarantor_national_id,
                guarantor_income_statement
            );

            res.status(201).json(newRequest);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

router.put(
    '/:id',
    authenticateToken,
    authorizeAccess(requestServices.getRequestById),
    upload.fields([
        { name: 'national_id', maxCount: 1 },
        { name: 'birth_certificate', maxCount: 1 },
        { name: 'family_record_book', maxCount: 1 },
        { name: 'carnet_de_residence', maxCount: 1 },
        { name: 'income_statement', maxCount: 1 },
        { name: 'ownership_proof', maxCount: 1 },
        { name: 'guarantor_national_id', maxCount: 1 },
        { name: 'guarantor_income_statement', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            // Extract the authenticated user's ID
            const user_id = req.user.id;

            // Fetch the existing request from the database
            const existingRequest = await requestServices.getRequestById(req.params.id);
            if (!existingRequest) {
                return res.status(404).json({ message: 'Request not found' });
            }

            // Parse text fields from form-data
            const {
                employment_status,
                job_title,
                monthly_income,
                amount_request,
                repayment_term,
                purpose,
                collateral_type,
                estimated_value,
                guarantor_name,
                guarantor_relationship
            } = req.body;

            // Get file paths from multer or fallback to existing paths
            const national_id = req.files['national_id']?.[0]?.path || existingRequest.national_id;
            const birth_certificate = req.files['birth_certificate']?.[0]?.path || existingRequest.birth_certificate;
            const family_record_book = req.files['family_record_book']?.[0]?.path || existingRequest.family_record_book;
            const carnet_de_residence = req.files['carnet_de_residence']?.[0]?.path || existingRequest.carnet_de_residence;
            const income_statement = req.files['income_statement']?.[0]?.path || existingRequest.income_statement;
            const ownership_proof = req.files['ownership_proof']?.[0]?.path || existingRequest.ownership_proof;
            const guarantor_national_id = req.files['guarantor_national_id']?.[0]?.path || existingRequest.guarantor_national_id;
            const guarantor_income_statement = req.files['guarantor_income_statement']?.[0]?.path || existingRequest.guarantor_income_statement;

            // Validate request body
            const errors = {
                user_id: await validateUserId(user_id),
                employment_status: validateEmploymentStatus(employment_status),
                job_title: validateJobTitle(job_title),
                monthly_income: validateAmount(monthly_income),
                amount_request: validateAmount(amount_request),
                repayment_term: validateRepaymentTerm(repayment_term),
                purpose: validatePurpose(purpose),
                collateral_type: validateCollateralType(collateral_type),
                estimated_value: validateAmount(estimated_value),
                guarantor_name: validateName(guarantor_name),
                guarantor_relationship: validateGuarantorRelationship(guarantor_relationship)
            };

            // Filter out null errors
            const actualErrors = Object.entries(errors)
                .filter(([_, value]) => value !== null)
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

            // If there are validation errors, return a 400 response
            if (Object.keys(actualErrors).length > 0) {
                return res.status(400).json({ message: 'Validation errors', errors: actualErrors });
            }

            // Call the service to update the request
            const updated = await requestServices.updateRequest(
                req.params.id,
                user_id,
                national_id,
                birth_certificate,
                family_record_book,
                carnet_de_residence,
                employment_status,
                job_title,
                monthly_income,
                income_statement,
                amount_request,
                repayment_term,
                purpose,
                collateral_type,
                estimated_value,
                ownership_proof,
                guarantor_name,
                guarantor_relationship,
                guarantor_national_id,
                guarantor_income_statement
            );

            if (!updated) {
                return res.status(404).json({ message: 'Request not found' });
            }

            res.json({ message: 'Request updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// Approve a request
router.patch('/:id/approve', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const approved = await requestServices.approveRequest(req.params.id);
        if (!approved) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json({ message: 'Request approved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reject a request
router.patch('/:id/reject', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const rejected = await requestServices.rejectRequest(req.params.id);
        if (!rejected) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json({ message: 'Request rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark a request as pending
router.patch('/:id/pending', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const pending = await requestServices.markRequestAsPending(req.params.id);
        if (!pending) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json({ message: 'Request marked as pending successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a request
router.delete('/:id', authenticateToken, authorizeAccess(requestServices.getRequestById), async (req, res) => {
    try {
        const deleted = await requestServices.deleteRequest(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;