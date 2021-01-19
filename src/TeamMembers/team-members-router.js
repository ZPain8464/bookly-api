const express = require("express");
const knex = require("knex");
const TeamMembersService = require("./team-members-service");
const { requireAuth } = require("../middleware/jwt-auth");
const logger = require("../logger");

const teamMembersRouter = express.Router();

teamMembersRouter
  .route("/")
  .get(requireAuth, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const creator_id = req.user.id;
    TeamMembersService.getTeamId(knexInstance, creator_id)
      .then((tid) => {
        const team_id = tid[0].id;
        TeamMembersService.getTeamMembersByTeamId(knexInstance, team_id)
          .then((teamMembers) => {
            const users = teamMembers.map((t) => t.user_id);
            TeamMembersService.getUsersByTeamMemberId(knexInstance, users)
              .then((teamMemberData) => {
                const newTeamMemberObject = { teamMemberData, teamMembers };

                res.json(newTeamMemberObject);
              })
              .catch(next);
          })
          .catch(next);
      })
      .catch(next);
  })
  .post(requireAuth, (req, res, next) => {
    const { team_id, user_id, invite_date } = req.body;
    let newTeamMember = {
      team_id,
      user_id,
      invite_date,
    };

    for (const [key, value] of Object.entries(newTeamMember))
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    const event_id = req.body.event_id;
    newTeamMember = { team_id, user_id, invite_date, event_id };

    TeamMembersService.insertTeamMember(req.app.get("db"), newTeamMember)
      .then((tmemb) => {
        res.status(201).json("team_member created");
      })
      .catch(next);
  });
teamMembersRouter
  .route("/:user_id")
  .all((req, res, next) => {
    TeamMembersService.getTeamMemberByUserId(
      req.app.get("db"),
      req.params.user_id
    )
      .then((user) => {
        if (!user) {
          return res.status(400).json({
            error: { message: `User doesn't exist` },
          });
        }
        res.user = user;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(res.user);
  })
  .delete(requireAuth, (req, res, next) => {
    TeamMembersService.deleteTeamMember(req.app.get("db"), req.params.user_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch((req, res, next) => {
    const { user_id, accepted } = req.body;
    const newMember = { user_id, accepted };
    const numberOfValues = Object.values(newMember).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must contain both 'user_id' and 'accepted'`,
        },
      });
    }

    TeamMembersService.updateAccepted(req.app.get("db"), user_id, accepted)
      .then((numRowsAffected) => {
        res.status(204).json("PATCH a success");
      })
      .catch(next);
  });
teamMembersRouter.route("/join-event/:user_id").patch((req, res, next) => {
  const id = req.params.user_id;
  const user_id = Number(id);
  const { event_id, accepted } = req.body;

  const joinEvent = { event_id, user_id, accepted };

  const numberOfValues = Object.values(joinEvent).filter(Boolean).length;
  if (numberOfValues === 0) {
    logger.error(`Invalid update without required fields`);
    return res.status(400).json({
      error: {
        message: `Request body must contain both 'user_id', 'event_id' and 'accepted'`,
      },
    });
  }

  TeamMembersService.updateJoinEvent(
    req.app.get("db"),
    event_id,
    user_id,
    accepted
  )
    .then((numRowsAffected) => {
      res.status(204).json("Event successfully joined");
    })
    .catch(next);
});

teamMembersRouter
  .route("/team-members-events/get-users/:event_id")
  .get((req, res, next) => {
    const eventId = req.params.event_id;
    TeamMembersService.getTeamMembersByEventId(req.app.get("db"), eventId).then(
      (users) => {
        const usersIds = users.map((u) => u.user_id);
        TeamMembersService.getUsersById(req.app.get("db"), usersIds).then(
          (users) => {
            console.log(users);
            res.json(users);
          }
        );
      }
    );
  });

module.exports = teamMembersRouter;
