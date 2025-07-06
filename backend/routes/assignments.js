const express = require('express');
const router = express.Router();
const assignmentServices = require('../services/assignmentServices');
const { validateUserId, validateRequestId, validateAmount, validateRepaymentTerm, validateDate, validateEndDate, validateUserAbaAccountNumber, validateName } = require('../middlewares/validators.js');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.js');
// Get all assignments
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const assignments = await assignmentServices.getAllAssignments();
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get assignment by ID
router.get('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const assignment = await assignmentServices.getAssignmentById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new assignment
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { user_id, request_id, amount, repayment_term, amount_repay_per_month, start_date, end_date, user_aba_account_number, user_aba_account_name } = req.body;
        
        // Validate request body
        const errors = {
            user_id: await validateUserId(user_id),
            request_id: await validateRequestId(request_id),
            amount: validateAmount(amount),
            repayment_term: validateRepaymentTerm(repayment_term),
            amount_repay_per_month: validateAmount(amount_repay_per_month),
            start_date: validateDate(start_date),
            end_date: validateEndDate(end_date, start_date),
            user_aba_account_number: validateUserAbaAccountNumber(user_aba_account_number),
            user_aba_account_name: validateName(user_aba_account_name)
        };

        // Filter out null errors
        const actualErrors = Object.entries(errors)
            .filter(([_, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        // If there are validation errors, return a 400 response
        if (Object.keys(actualErrors).length > 0) {
            return res.status(400).json({ message: 'Validation errors', errors: actualErrors });
        }
        
        const newAssignment = await assignmentServices.createAssignment(
            user_id,
            request_id,
            amount,
            repayment_term,
            amount_repay_per_month,
            start_date,
            end_date,
            user_aba_account_number,
            user_aba_account_name
        );
        res.status(201).json(newAssignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update assignment
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { user_id, request_id, amount, repayment_term, amount_repay_per_month, start_date, end_date, user_aba_account_number, user_aba_account_name } = req.body;
        
        // Validate request body
        const errors = {
            user_id: await validateUserId(user_id),
            request_id: await validateRequestId(request_id),
            amount: validateAmount(amount),
            repayment_term: validateRepaymentTerm(repayment_term),
            amount_repay_per_month: validateAmount(amount_repay_per_month),
            start_date: validateDate(start_date),
            end_date: validateEndDate(end_date, start_date),
            user_aba_account_number: validateUserAbaAccountNumber(user_aba_account_number),
            user_aba_account_name: validateName(user_aba_account_name)
        };

        // Filter out null errors
        const actualErrors = Object.entries(errors)
            .filter(([_, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        // If there are validation errors, return a 400 response
        if (Object.keys(actualErrors).length > 0) {
            return res.status(400).json({ message: 'Validation errors', errors: actualErrors });
        }
        
        const updatedAssignment = await assignmentServices.updateAssignment(
            req.params.id,
            user_id,
            request_id,
            amount,
            repayment_term,
            amount_repay_per_month,
            start_date,
            end_date,
            user_aba_account_number,
            user_aba_account_name
        );
        
        if (!updatedAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        
        res.json({ message: 'Assignment updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete assignment
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const assignment = await assignmentServices.getAssignmentById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        
        await assignmentServices.deleteAssignment(req.params.id);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
