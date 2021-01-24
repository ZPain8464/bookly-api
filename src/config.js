module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  API_TOKEN: process.env.API_TOKEN,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  JWT_SECRET: "bookly-token",
  DATABASE_URL: process.env.DATABASE_URL || process.env.TEST_DATABASE_URL,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
};
