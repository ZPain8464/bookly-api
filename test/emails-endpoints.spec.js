const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");

const EmailsService = require("../src/Emails/emails-service");

describe(`Emails service object`, function () {
  let db;
  let authToken;
  before(`setup db`, () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });
});
