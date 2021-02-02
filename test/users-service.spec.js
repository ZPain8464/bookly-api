const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeUsersArray } = require("./users.fixtures");

describe(`Users service object`, function () {
  let db;
  let authToken;
  let users = makeUsersArray();

  before(() => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  before("clean db", () => db("users").truncate());
  afterEach("clean db", () => db("users").truncate());

  after("destroy db connection", () => db.destroy());

  //   beforeEach("clean the users table", () =>
  //     db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
  //   );

  beforeEach("register and login", () => {
    return supertest(app)
      .post("/api/users")
      .send(users[0])
      .then((res) => {
        return supertest(app)
          .post("/api/auth/login")
          .send(users[0])
          .then((res2) => {
            authToken = res2.body.authToken;
          });
      });
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () =>
    db.raw("TRUNCATE users RESTART IDENTITY CASCADE")
  );

  afterEach("cleanup", () => db.raw("TRUNCATE users RESTART IDENTITY CASCADE"));

  describe(`GET /api/users`, () => {
    console.log("--- heard ---");
    // context(`Given there are users in db,`, () => {
    //   let users = makeusersArray();
    //   it(`responds with an array of users`, () => {
    //     return supertest(app)
    //       .get("/api/users")
    //       .set("Authorization", `Bearer ${authToken}`)
    //       .expect(users);
    //   });
    // });
  });
});
