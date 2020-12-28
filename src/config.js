module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  API_TOKEN: process.env.API_TOKEN,
  JWT_SECRET: "bookly-token",
  DATABASE_URL: process.env.DATABASE_URL || process.env.TEST_DATABASE_URL,
};
