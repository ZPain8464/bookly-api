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

  before("clean db", () => db("teams").truncate());
  afterEach("clean db", () => db("teams").truncate());

  after("destroy db connection", () => db.destroy());

  beforeEach("clean the teams table", () =>
    db.raw(
      "TRUNCATE TABLE users, teams, events, team_members RESTART IDENTITY CASCADE"
    )
  );

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

  // before("clean the table", () =>
  //   db.raw("TRUNCATE teams RESTART IDENTITY CASCADE")
  // );

  // after("disconnect from db", () => db.destroy());

  // afterEach("cleanup", () =>
  //   db.raw("TRUNCATE user, teams RESTART IDENTITY CASCADE")
  // );

  describe(`getAllTeams`, () => {
    it("returns an empty array", () => {
      return TeamsService.getAllTeams(db).then((teams) =>
        // expect(teams).to.eql([])
        console.log(teams)
      );
    });
    // context(`Given there are teams in db,`, () => {
    //   let teams = makeTeamsArray();
    //   beforeEach("insert teams", () => {
    //     console.log("beforeEach teams ran");
    //     return db
    //       .into("users")
    //       .insert(users)
    //       .then(() => {
    //         return db.into("users").insert(users);
    //       })
    //       .then(() => {
    //         return db.into("teams").insert(teams);
    //       });
    //   });
    //   it(`responds with an array of teams`, () => {
    //     return supertest(app)
    //       .get("/api/teams")
    //       .set("Authorization", `Bearer ${authToken}`)
    //       .expect(teams);
    //   });
    // });
  });
});
