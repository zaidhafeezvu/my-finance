"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATION_RULES = exports.TIMEZONES = exports.CURRENCIES = exports.DATE_FORMATS = exports.PAGINATION = exports.APP_CONFIG = void 0;
exports.APP_CONFIG = {
    NAME: 'Finance App',
    VERSION: '1.0.0',
    DESCRIPTION: 'Personal Finance Management Platform',
};
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};
exports.DATE_FORMATS = {
    US: 'MM/DD/YYYY',
    EU: 'DD/MM/YYYY',
    ISO: 'YYYY-MM-DD',
};
exports.CURRENCIES = {
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
    CAD: 'CAD',
    AUD: 'AUD',
};
exports.TIMEZONES = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
];
exports.VALIDATION_RULES = {
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_MAX_LENGTH: 255,
    NAME_MAX_LENGTH: 50,
    DESCRIPTION_MAX_LENGTH: 500,
    AMOUNT_MAX_DIGITS: 12,
    AMOUNT_DECIMAL_PLACES: 2,
};
//# sourceMappingURL=app.constants.js.map