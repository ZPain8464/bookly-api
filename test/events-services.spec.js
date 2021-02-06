const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeUsersArray } = require("./users.fixtures");

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
    db.raw(
      "TRUNCATE users, teams, team_members, events RESTART IDENTITY CASCADE"
    )
  );

  afterEach("cleanup", () =>
    db.raw(
      "TRUNCATE users, teams, team_members, events RESTART IDENTITY CASCADE"
    )
  );

  describe(`GET /api/events`, () => {
    const event = [
      {
        description: "test event descr",
        location: "example blvd",
        date: "2021-02-22",
        time_start: "15:22:00",
        time_end: "16:22:00",
        title: "test event",
        team_id: 1,
      },
    ];
    const users = [
      {
        email: "user2@example.com",
        first_name: "Jane",
        last_name: "Doe",
        date_created: "2021-02-06T01:58:16.614Z",
        password: "Password#4",
        profile_image: "",
        phone_number: "",
      },
    ];
    beforeEach("insert events", () => {
      return db
        .select("*")
        .from("teams")
        .returning("*")
        .then((data) => {
          return db.into("events").insert(event);
        });
    });
    context("Given there are events in the db", () => {
      const expectedEvent = [
        {
          title: "test event",
          date: "2021-02-22T06:00:00.000Z",
          description: "test event descr",
          id: 1,
          location: "example blvd",
          team_id: 1,
          time_end: "16:22:00",
          time_start: "15:22:00",
        },
      ];
      it(`responds with the expected event`, () => {
        return supertest(app)
          .get(`/api/events`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(201, expectedEvent);
      });
    });
  });
});
