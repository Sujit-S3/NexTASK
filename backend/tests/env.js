process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-automated-tests';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '1h';
process.env.JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '1d';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-api-key';
