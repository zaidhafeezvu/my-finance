export const appConfig = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  apiPrefix: process.env.API_PREFIX || '/api',
  plaid: {
    clientId: process.env.PLAID_CLIENT_ID || '',
    secret: process.env.PLAID_SECRET || '',
    environment: process.env.PLAID_ENV || 'sandbox',
  },
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
  },
  marketData: {
    apiKey: process.env.MARKET_DATA_API_KEY || '',
    baseUrl: process.env.MARKET_DATA_BASE_URL || 'https://api.marketdata.com',
  },
}