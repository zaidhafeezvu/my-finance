"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = exports.generateId = exports.formatAccountNumber = exports.capitalizeFirst = exports.truncateText = void 0;
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength) + '...';
};
exports.truncateText = truncateText;
const capitalizeFirst = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
exports.capitalizeFirst = capitalizeFirst;
const formatAccountNumber = (accountNumber) => {
    // Show only last 4 digits
    if (accountNumber.length <= 4)
        return accountNumber;
    return `****${accountNumber.slice(-4)}`;
};
exports.formatAccountNumber = formatAccountNumber;
const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
exports.generateId = generateId;
const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.slugify = slugify;
//# sourceMappingURL=format.utils.js.map