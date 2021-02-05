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

  afterEach("cleanup", () =>
    db.raw("TRUNCATE users, teams RESTART IDENTITY CASCADE")
  );

  describe(`GET /api/teams`, () => {
    context(`Given there are teams in the database`, () => {
      let teams = makeTeamsArray();
      it(`responds with a list of teams`, () => {
        return supertest(app)
          .get("/api/teams")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(teams);
      });
    });
  });

  describe(`POST /api/teams`, () => {
    const testUser = [
      {
        email: "user@example.com",
        first_name: "John",
        last_name: "Doe",
        password: "Password#3",
        profile_image: "",
        phone_number: "",
      },
    ];
    beforeEach("insert team", () => {
      return db.into("users").insert(testUser);
    });
    it(`creates a team, responds with the new team`, () => {
      const newTeam = {
        id: 2,
        creator_id: 1,
        title: "user@example.com",
      };
      return supertest(app)
        .post("/api/teams")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newTeam)
        .expect((res) => {
          expect(res.body.creator_id).to.eql(newTeam.creator_id);
          expect(res.body.id).to.eql(newTeam.id);
          expect(res.body.title).to.eql(newTeam.title);
        })
        .then((res) =>
          supertest(app)
            .get(`/api/teams/${res.body.id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(res.body)
        );
    });
  });
  describe(`GET /api/teams/:id`, () => {
    context(`Given no teams`, () => {
      it(`responds with 404`, () => {
        const teamId = 123456;
        return supertest(app)
          .get(`/api/teams/${teamId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: `Team doesn't exist` } });
      });
    });
    context(`Given there are teams in the database`, () => {
      const testUser = [
        {
          email: "user@example.com",
          first_name: "John",
          last_name: "Doe",
          password: "Password#3",
          profile_image: "",
          phone_number: "",
        },
      ];
      const testTeam = [
        {
          creator_id: 1,
          title: "user@example.com",
        },
      ];
      beforeEach("insert team", () => {
        return db
          .into("users")
          .insert(testUser)
          .then(() => {
            return db.into("teams").insert(testTeam);
          });
      });
      it(`responds with the specified team`, () => {
        const expectedTeam = {
          id: 2,
          creator_id: 1,
          title: "user@example.com",
        };
        console.log(expectedTeam);
        return supertest(app)
          .get(`/api/teams/${expectedTeam.id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, expectedTeam);
      });
    });
  });
});
