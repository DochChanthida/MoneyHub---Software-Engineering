const pool = require('../db');

// Validation functions
const validateName = (name) => {
    if (!name) return 'Name is required';
    if (name.length < 1 || name.length > 255) return 'Name must be between 1 and 255 characters';
    return null;
};

const validateGender = (gender) => {
    const validGenders = ['M', 'F'];
    if (!gender) return 'Gender is required';
    if (!validGenders.includes(gender)) return 'Gender must be M or F';
    return null;
};

const validateDate = (date) => {
    if (!date) return 'Date is required';
    if (isNaN(Date.parse(date))) return 'Invalid date format';
    return null;
};

const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    if (email.length < 1 || email.length > 255) return 'Email must be between 1 and 255 characters';
    return null;
};

const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    return null;
};

const validateContactNumber = (contact_number) => {
    if (!contact_number) return 'Contact number is required';
    if (!/^0\d{8,9}$/.test(contact_number)) return 'Contact number must start with 0 and be 9 or 10 digits long';
    return null;
};

const validateAddress = (address) => {
    if (!address) return 'Address is required';
    if (address.length > 255) return 'Address must be less than 255 characters';
    return null;
};

const validateRole = (role) => {
    const allowedRoles = ['user', 'admin'];
    if (!allowedRoles.includes(role)) return `Role must be one of: ${allowedRoles.join(', ')}`;
    return null;
};

const validateUserId = async (user_id) => {
    if (!user_id) return 'User ID is required';
    if (isNaN(user_id)) return 'User ID must be a valid number';

    // Check if the user exists in the database
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (rows.length === 0) return 'User ID does not exist in the users table';

    return null;
};

const validateEmploymentStatus = (employment_status) => {
    const validStatuses = ['full-time', 'part-time', 'self-employed', 'unemployed', 'student', 'retired'];
    if (!employment_status) return 'Employment status is required';
    if (!validStatuses.includes(employment_status)) return `Employment status must be one of: ${validStatuses.join(', ')}`;
    return null;
};

const validateJobTitle = (job_title) => {
    if (!job_title) return 'Job title is required';
    if (job_title.length < 1 || job_title.length > 255) return 'Job title must be between 1 and 255 characters';
    return null;
};

const validateAmount = (amount) => {
    if (!amount) return 'Amount is required';
    if (isNaN(amount) || amount <= 0) return 'Amount must be a positive number';
    return null;
};

const validateRepaymentTerm = (repayment_term) => {
    if (!repayment_term) return 'Repayment term is required';
    if (isNaN(repayment_term) || repayment_term <= 0) return 'Repayment term must be a positive number';
    return null;
};

const validatePurpose = (purpose) => {
    if (!purpose) return 'Purpose is required';
    if (purpose.length < 1 || purpose.length > 255) return 'Purpose must be between 1 and 255 characters';
    return null;
};

const validateCollateralType = (collateral_type) => {
    const allowedTypes = ['real_estate', 'vehicle', 'jewelry', 'stock', 'equipment', 'other'];
    if (!collateral_type) return 'Collateral type is required';
    if (!allowedTypes.includes(collateral_type)) {
        return `Collateral type must be one of: ${allowedTypes.join(', ')}`;
    }
    return null;
};

const validateGuarantorRelationship = (guarantor_relationship) => {
    if (!guarantor_relationship) return 'Guarantor relationship is required';
    if (guarantor_relationship.length < 1 || guarantor_relationship.length > 255) return 'Guarantor relationship must be between 1 and 255 characters';
    return null;
};

const validateRequestId = async (request_id) => {
    if (!request_id) return 'Request ID is required';
    if (isNaN(request_id)) return 'Request ID must be a valid number';

    // Check if the request exists in the database
    const [rows] = await pool.query('SELECT id FROM requests WHERE id = ?', [request_id]);
    if (rows.length === 0) return 'Request ID does not exist in the requests table';

    return null;
};

const validateEndDate = (end_date, start_date) => {
    if (!end_date) return 'End date is required';
    if (isNaN(Date.parse(end_date))) return 'Invalid end date format';
    if (!start_date) return 'Start date is required to validate end date';
    if (isNaN(Date.parse(start_date))) return 'Invalid start date format';
    if (new Date(end_date) <= new Date(start_date)) return 'End date must be later than start date';
    return null;
};

const validateUserAbaAccountNumber = (user_aba_account_number) => {
    if (!user_aba_account_number) return 'ABA account number is required';
    if (!/^\d{9}$/.test(user_aba_account_number)) return 'ABA account number must be 9 digits';
    return null;
};

module.exports = {
    validateName,
    validateGender,
    validateDate,
    validateEmail,
    validatePassword,
    validateContactNumber,
    validateAddress,
    validateRole,
    validateUserId,
    validateEmploymentStatus,
    validateJobTitle,
    validateRepaymentTerm,
    validatePurpose,
    validateCollateralType,
    validateGuarantorRelationship,
    validateRequestId,
    validateAmount,
    validateEndDate,
    validateUserAbaAccountNumber,
};