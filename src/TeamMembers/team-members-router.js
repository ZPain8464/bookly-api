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
    const { team_id, user_id, invite_date, accepted } = req.body;
    const newTeamMember = {
      team_id,
      user_id,
      invite_date,
      accepted,
    };
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
  });

module.exports = teamMembersRouter;
