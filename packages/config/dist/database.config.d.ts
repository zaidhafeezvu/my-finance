export declare const databaseConfig: {
    mongodb: {
        uri: string;
        options: {
            maxPoolSize: number;
            serverSelectionTimeoutMS: number;
            socketTimeoutMS: number;
        };
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
    };
};
//# sourceMappingURL=database.config.d.ts.map