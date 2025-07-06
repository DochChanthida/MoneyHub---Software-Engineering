const pool = require('../db');

// Get all requests
const getAllRequests = async () => {
    const [rows] = await pool.query('SELECT * FROM requests');
    return rows;
};

// Get user by ID
const getRequestById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM requests WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
};

const getRequestsByUserId = async (userId) => {
    try {
        // Query the database to fetch requests for the given user ID
        const [rows] = await pool.query('SELECT * FROM requests WHERE user_id = ?', [userId]);
        return rows;
    } catch (error) {
        throw new Error('Error fetching user requests: ' + error.message);
    }
};

// Create a request
const createRequest = async (
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
) => {
    const [result] = await pool.query(
        'INSERT INTO requests (user_id, national_id, birth_certificate, family_record_book, carnet_de_residence, employment_status, job_title, monthly_income, income_statement, amount_request, repayment_term, purpose, collateral_type, estimated_value, ownership_proof, guarantor_name, guarantor_relationship, guarantor_national_id, guarantor_income_statement) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
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
        ]
    );
    return {
        id: result.insertId,
        user_id,
        status: result.status,
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
    };
};

// Update request
const updateRequest = async (
    id,
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
) => {
    const [result] = await pool.query(
        `UPDATE requests
         SET user_id = ?, national_id = ?, birth_certificate = ?, family_record_book = ?, carnet_de_residence = ?,
             employment_status = ?, job_title = ?, monthly_income = ?, income_statement = ?, amount_request = ?,
             repayment_term = ?, purpose = ?, collateral_type = ?, estimated_value = ?, ownership_proof = ?,
             guarantor_name = ?, guarantor_relationship = ?, guarantor_national_id = ?, guarantor_income_statement = ?
         WHERE id = ?`,
        [
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
            guarantor_income_statement,
            id
        ]
    );

    return result.affectedRows > 0; // Return true if the update was successful
};

// Mark request as approved
const approveRequest = async (id) => {
    const [result] = await pool.query('UPDATE requests SET status = ? WHERE id = ?', ['approved', id]);
    return result.affectedRows > 0; // Return true if the update was successful
};

// Mark request as rejected
const rejectRequest = async (id) => {
    const [result] = await pool.query('UPDATE requests SET status = ? WHERE id = ?', ['rejected', id]);
    return result.affectedRows > 0; // Return true if the update was successful
};

// Mark request as pending
const markRequestAsPending = async (id) => {
    const [result] = await pool.query('UPDATE requests SET status = ? WHERE id = ?', ['pending', id]);
    return result.affectedRows > 0; // Return true if the update was successful
};

//Delete request
const deleteRequest = async (id) => {
    const [result] = await pool.query('DELETE FROM requests WHERE id = ?', [id]);
    return result.affectedRows > 0; // Return true if the deletion was successful
};


// Export functions
module.exports = {
    getAllRequests,
    getRequestById,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    markRequestAsPending,
    deleteRequest,
    getRequestsByUserId
};