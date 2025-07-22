"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequired = exports.isValidDate = exports.sanitizeString = exports.isValidAmount = exports.isValidPassword = exports.isValidEmail = void 0;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
exports.isValidPassword = isValidPassword;
const isValidAmount = (amount) => {
    return typeof amount === 'number' && !isNaN(amount) && amount >= 0;
};
exports.isValidAmount = isValidAmount;
const sanitizeString = (input) => {
    return input.trim().replace(/[<>]/g, '');
};
exports.sanitizeString = sanitizeString;
const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
};
exports.isValidDate = isValidDate;
const validateRequired = (value, fieldName) => {
    if (value === null || value === undefined || value === '') {
        return `${fieldName} is required`;
    }
    return null;
};
exports.validateRequired = validateRequired;
//# sourceMappingURL=validation.utils.js.map