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
    const newTeamMember = {
      team_id,
      user_id,
      invite_date,
    };
    console.log(newTeamMember);
    for (const [key, value] of Object.entries(newTeamMember))
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    TeamMembersService.insertTeamMember(req.app.get("db"), newTeamMember)
      .then((tmemb) => {
        res.json(tmemb);
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

module.exports = teamMembersRouter;
