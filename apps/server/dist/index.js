"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("@finance-app/config");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = config_1.appConfig.port;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.appConfig.corsOrigin,
    credentials: true,
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config_1.appConfig.nodeEnv
    });
});
// API routes placeholder
app.get('/api', (req, res) => {
    res.json({
        message: 'Finance App API',
        version: '1.0.0'
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: config_1.appConfig.nodeEnv === 'development' ? err.message : 'Internal server error'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📊 Environment: ${config_1.appConfig.nodeEnv}`);
    console.log(`🌐 CORS Origin: ${config_1.appConfig.corsOrigin}`);
});
//# sourceMappingURL=index.js.map