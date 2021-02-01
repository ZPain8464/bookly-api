const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { inviteArray } = require("./emails.fixtures");

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

  //   beforeEach("register and login", () => {
  //     let invites = inviteArray();
  //     return supertest(app)
  //       .post("/api/users")
  //       .send(users[0])
  //       .then((res) => {
  //         return supertest(app)
  //           .post("/api/auth/login")
  //           .send(users[0])
  //           .then((res2) => {
  //             authToken = res2.body.authToken;
  //           });
  //       });
  //   });
  describe(`POST /api/emails`, () => {});
});
