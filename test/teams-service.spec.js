const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeUsersArray } = require("./users.fixtures");

const TeamsService = require("../src/Teams/teams-service");

describe(`Teams service object`, function () {
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

  function makeTeamsArray() {
    return [
      {
        id: 1,
        creator_id: 1,
        title: "user@example.com",
      },
    ];
  }

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
    db.raw("TRUNCATE users, teams RESTART IDENTITY CASCADE")
  );

  describe(`GET /api/teams`, () => {
    context(`Given not teams`, () => {
      it(`responds with an empty list`, () => {
        return supertest(app)
          .get("/api/teams")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, []);
      });
    });
  });
});
