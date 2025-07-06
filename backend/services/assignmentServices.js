const pool = require('../db');

// Get all assignments
const getAllAssignments = async () => {
    const [rows] = await pool.query('SELECT * FROM loan_assignments');
    return rows;
};

// Get assignment by ID
const getAssignmentById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM loan_assignments WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
};

// Create a new assignment
const createAssignment = async (user_id, request_id, amount, repayment_term, amount_repay_per_month, start_date, end_date, user_aba_account_number, user_aba_account_name) => {
    const [result] = await pool.query(
        'INSERT INTO loan_assignments (user_id, request_id, amount, repayment_term, amount_repay_per_month, start_date, end_date, user_aba_account_number, user_aba_account_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, request_id, amount, repayment_term, amount_repay_per_month, start_date, end_date, user_aba_account_number, user_aba_account_name]
    );
    return { id: result.insertId, user_id, request_id, amount, repayment_term, amount_repay_per_month, start_date, end_date, user_aba_account_number, user_aba_account_name };
};

// Update assignment
const updateAssignment = async (id, user_id, request_id, amount, repayment_term, amount_repay_per_month, start_date, end_date, user_aba_account_number, user_aba_account_name) => {
    const [result] = await pool.query(
        'UPDATE loan_assignments SET user_id = ?, request_id = ?, amount = ?, repayment_term = ?, amount_repay_per_month = ?, start_date = ?, end_date = ?, user_aba_account_number = ?, user_aba_account_name = ? WHERE id = ?',
        [user_id, request_id, amount, repayment_term, amount_repay_per_month, start_date, end_date, user_aba_account_number, user_aba_account_name, id]
    );
    return result.affectedRows > 0;
};

// Delete assignment
const deleteAssignment = async (id) => {
    const [result] = await pool.query('DELETE FROM loan_assignments WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    getAllAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment
};
