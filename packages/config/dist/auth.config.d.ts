export declare const authConfig: {
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    bcrypt: {
        saltRounds: number;
    };
    session: {
        secret: string;
        maxAge: number;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
};
//# sourceMappingURL=auth.config.d.ts.map