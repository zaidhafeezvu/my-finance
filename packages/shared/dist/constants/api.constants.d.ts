export declare const API_ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/api/auth/login";
        readonly REGISTER: "/api/auth/register";
        readonly REFRESH: "/api/auth/refresh";
        readonly LOGOUT: "/api/auth/logout";
        readonly RESET_PASSWORD: "/api/auth/reset-password";
        readonly VERIFY_EMAIL: "/api/auth/verify-email";
    };
    readonly USERS: {
        readonly PROFILE: "/api/users/profile";
        readonly PREFERENCES: "/api/users/preferences";
        readonly SECURITY: "/api/users/security";
    };
    readonly ACCOUNTS: {
        readonly BASE: "/api/accounts";
        readonly CONNECT: "/api/accounts/connect";
        readonly SYNC: "/api/accounts/sync";
        readonly DISCONNECT: "/api/accounts/disconnect";
    };
    readonly TRANSACTIONS: {
        readonly BASE: "/api/transactions";
        readonly CATEGORIZE: "/api/transactions/categorize";
        readonly MANUAL: "/api/transactions/manual";
        readonly DUPLICATES: "/api/transactions/duplicates";
    };
    readonly BUDGETS: {
        readonly BASE: "/api/budgets";
        readonly STATUS: "/api/budgets/status";
        readonly REPORTS: "/api/budgets/reports";
    };
    readonly INVESTMENTS: {
        readonly BASE: "/api/investments";
        readonly PORTFOLIO: "/api/investments/portfolio";
        readonly SYNC: "/api/investments/sync";
    };
    readonly BILLS: {
        readonly BASE: "/api/bills";
        readonly UPCOMING: "/api/bills/upcoming";
        readonly PAYMENTS: "/api/bills/payments";
    };
    readonly REPORTS: {
        readonly BASE: "/api/reports";
        readonly SPENDING: "/api/reports/spending";
        readonly INCOME: "/api/reports/income";
        readonly NET_WORTH: "/api/reports/net-worth";
    };
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly INTERNAL_SERVER_ERROR: 500;
};
//# sourceMappingURL=api.constants.d.ts.map