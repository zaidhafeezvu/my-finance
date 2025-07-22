"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.API_ENDPOINTS = void 0;
exports.API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        REFRESH: '/api/auth/refresh',
        LOGOUT: '/api/auth/logout',
        RESET_PASSWORD: '/api/auth/reset-password',
        VERIFY_EMAIL: '/api/auth/verify-email',
    },
    USERS: {
        PROFILE: '/api/users/profile',
        PREFERENCES: '/api/users/preferences',
        SECURITY: '/api/users/security',
    },
    ACCOUNTS: {
        BASE: '/api/accounts',
        CONNECT: '/api/accounts/connect',
        SYNC: '/api/accounts/sync',
        DISCONNECT: '/api/accounts/disconnect',
    },
    TRANSACTIONS: {
        BASE: '/api/transactions',
        CATEGORIZE: '/api/transactions/categorize',
        MANUAL: '/api/transactions/manual',
        DUPLICATES: '/api/transactions/duplicates',
    },
    BUDGETS: {
        BASE: '/api/budgets',
        STATUS: '/api/budgets/status',
        REPORTS: '/api/budgets/reports',
    },
    INVESTMENTS: {
        BASE: '/api/investments',
        PORTFOLIO: '/api/investments/portfolio',
        SYNC: '/api/investments/sync',
    },
    BILLS: {
        BASE: '/api/bills',
        UPCOMING: '/api/bills/upcoming',
        PAYMENTS: '/api/bills/payments',
    },
    REPORTS: {
        BASE: '/api/reports',
        SPENDING: '/api/reports/spending',
        INCOME: '/api/reports/income',
        NET_WORTH: '/api/reports/net-worth',
    },
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
};
//# sourceMappingURL=api.constants.js.map