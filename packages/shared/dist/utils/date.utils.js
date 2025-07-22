"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDaysBetween = exports.getEndOfMonth = exports.getStartOfMonth = exports.addMonths = exports.addDays = exports.isDateInRange = exports.formatDate = void 0;
const formatDate = (date, format = 'MM/DD/YYYY') => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    switch (format) {
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'MM/DD/YYYY':
        default:
            return `${month}/${day}/${year}`;
    }
};
exports.formatDate = formatDate;
const isDateInRange = (date, startDate, endDate) => {
    return date >= startDate && date <= endDate;
};
exports.isDateInRange = isDateInRange;
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
exports.addDays = addDays;
const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};
exports.addMonths = addMonths;
const getStartOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};
exports.getStartOfMonth = getStartOfMonth;
const getEndOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};
exports.getEndOfMonth = getEndOfMonth;
const getDaysBetween = (startDate, endDate) => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};
exports.getDaysBetween = getDaysBetween;
//# sourceMappingURL=date.utils.js.map