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
    db.raw("TRUNCATE users, teams, team_members RESTART IDENTITY CASCADE")
  );

  afterEach("cleanup", () =>
    db.raw("TRUNCATE users, teams, team_members RESTART IDENTITY CASCADE")
  );

  describe(`GET /api/team-members`, () => {
    context(`Given there are no team members`, () => {
      it(`responds with an empty object`, () => {
        return supertest(app)
          .get("/api/team-members")
          .set("Authorization", `Bearer ${authToken}`)
          .expect({ teamMemberData: [], teamMembers: [] });
      });
    });
    context(`Given there are team members`, () => {
      const users = [
        {
          email: "user@example.com",
          first_name: "John",
          last_name: "Doe",
          date_created: "2021-02-06T01:58:16.614Z",
          password: "Password#3",
          profile_image: "",
          phone_number: "",
        },
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

      let teamMember;
      const teamMemberObject = {
        teamMemberData: [
          {
            id: 3,
            email: "user2@example.com",
            first_name: "Jane",
            last_name: "Doe",
            password: "Password#4",
            date_created: "2021-02-06T01:58:16.614Z",
            profile_image: "",
            phone_number: "",
          },
        ],
        teamMembers: [
          {
            team_id: 1,
            user_id: 3,
            invite_date: "2021-02-06T01:58:16.614Z",
            accepted: true,
            id: 1,
            event_id: null,
          },
        ],
      };

      beforeEach("insert user", () => {
        return db
          .into("users")
          .insert(users)
          .returning("*")
          .then((currUser) => {
            const creator_id = currUser[0].id;
            const title = currUser[0].email;
            const newTeam = { creator_id, title };
            // team member's user id
            const user_id = currUser[1].id;
            return db
              .select("*")
              .from("teams")
              .returning("*")
              .then((team) => {
                const team_id = team[0].id;
                const invite_date = "2021-02-06T01:58:16.614Z";
                const accepted = true;
                const event_id = null;
                teamMember = [
                  { user_id, team_id, invite_date, accepted, event_id },
                ];
                return db
                  .into("team_members")
                  .insert(teamMember)
                  .returning("*");
              });
          });
      });
      it(`responds with a list of team members`, () => {
        return supertest(app)
          .get("/api/team-members")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, teamMemberObject);
      });
    });
  });
  describe(`POST /api/team-members`, () => {
    let newTeamMember;
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
    beforeEach(`insert team member`, () => {
      return db
        .into("users")
        .insert(users)
        .then(() => {
          return db
            .select("*")
            .from("users")
            .returning("*")
            .then((data) => {
              const user_id = data[1].id;
              const creator_id = data[0].id;
              const title = data[0].email;
              const newTeam = { creator_id, title };
              return db.into("teams").insert(newTeam).returning("*");
            });
        });
    });
    it(`creates a new team member`, () => {
      const newTeamMember = {
        user_id: 2,
        team_id: 2,
        invite_date: "2021-02-06T01:58:16.614Z",
      };
      return supertest(app)
        .post("/api/team-members")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newTeamMember)
        .expect(201);
    });
  });
  describe(`GET /api/team-members/:user_id`, () => {
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
    const newTeamMember = [
      {
        user_id: 2,
        team_id: 1,
        invite_date: "2021-02-06T01:58:16.614Z",
        accepted: false,
        event_id: null,
        id: 1,
      },
    ];
    beforeEach(`insert team member`, () => {
      return db
        .into("users")
        .insert(users)
        .returning("*")
        .then((user) => {
          const user_id = user[0].id;
          const team_id = 1;
          const invite_date = "2021-02-06T01:58:16.614Z";
          const newTm = { user_id, team_id, invite_date };
          return db.into("team_members").insert(newTm);
        });
    });
    it(`returns the specified team member`, () => {
      const userId = 2;
      const expectedTm = newTeamMember;
      return supertest(app)
        .get(`/api/team-members/${userId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(expectedTm);
    });
  });

  describe(`PATCH /api/team-members/:user_id`, () => {
    context(`Given no tms`, () => {
      it(`responds with 400`, () => {
        const testId = 123456;
        return supertest(app)
          .patch(`/api/team-members/${testId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(400);
      });
    });
    context(`Given there are tms in db`, () => {
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
      beforeEach("insert team member", () => {
        return db
          .into("users")
          .insert(users)
          .returning("*")
          .then((user) => {
            const user_id = user[0].id;
            const team_id = 1;
            const invite_date = "2021-02-06T01:58:16.614Z";
            const newTm = { user_id, team_id, invite_date };
            return db.into("team_members").insert(newTm);
          });
      });
      it(`responds with 204 and updates tm accepted to true`, () => {
        const idToUpdate = 2;
        const updateTm = {
          user_id: 2,
          accepted: true,
        };
        const expectedRes = [
          {
            team_id: 1,
            user_id: 2,
            invite_date: "2021-02-06T01:58:16.614Z",
            accepted: true,
            id: 1,
            event_id: null,
          },
        ];
        return supertest(app)
          .patch(`/api/team-members/${idToUpdate}`)
          .send({ ...updateTm })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/team-members/${idToUpdate}`)
              .expect(200, expectedRes)
          );
      });
    });
  });
  describe(`PATCH /api/team-members/join-event/:user_id`, () => {
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

    beforeEach("insert team member", () => {
      return db
        .into("events")
        .insert(event)
        .returning("*")
        .then((e) => {
          const event_id = e[0].id;
          return db
            .into("users")
            .insert(users)
            .returning("*")
            .then((user) => {
              const team_id = 1;
              const user_id = user[0].id;
              const accepted = false;
              const invite_date = "2021-02-06T01:58:16.614Z";
              const teamMember = {
                user_id,
                event_id,
                accepted,
                invite_date,
                team_id,
              };
              return db.into("team_members").insert(teamMember);
            });
        });
    });
    it(`changes team member accepted = true w/ event_id`, () => {
      const idToUpdate = 2;
      const updateTm = {
        event_id: 1,
        accepted: true,
      };
      const expectedRes = [
        {
          team_id: 1,
          user_id: 2,
          invite_date: "2021-02-06T01:58:16.614Z",
          accepted: true,
          id: 1,
          event_id: 1,
        },
      ];
      return supertest(app)
        .patch(`/api/team-members/join-event/${idToUpdate}`)
        .send({ ...updateTm })
        .then((res) =>
          supertest(app)
            .get(`/api/team-members/${idToUpdate}`)
            .expect(200, expectedRes)
        );
    });
  });
  describe(`GET /api/team-members/team-members-events/get-users/:event_id`, () => {
    context(`Given there are team members in the db`, () => {
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
      const teamMember = [
        {
          accepted: true,
          event_id: 1,
          invite_date: "2021-02-06T01:58:16.614Z",
          user_id: 2,
          team_id: 1,
        },
      ];
      beforeEach("insert team members", () => {
        return db
          .into("users")
          .insert(users)
          .then(() => {
            return db
              .into("events")
              .insert(event)
              .then(() => {
                return db.into("team_members").insert(teamMember);
              });
          });
      });
      it(`Returns tms that have joined event by event id`, () => {
        const eventId = 1;
        const expectedRes = [
          {
            id: 2,
            email: "user2@example.com",
            first_name: "Jane",
            last_name: "Doe",
            password: "Password#4",
            date_created: "2021-02-06T01:58:16.614Z",
            profile_image: "",
            phone_number: "",
          },
        ];
        return supertest(app)
          .get(`/api/team-members/team-members-events/get-users/${eventId}`)
          .expect(200, expectedRes);
      });
    });
  });
});
