const express = require("express");
const xss = require("xss");
const knex = require("knex");
const TeamsService = require("./teams-service");
const { requireAuth } = require("../middleware/jwt-auth");
const logger = require("../logger");

const teamsRouter = express.Router();

teamsRouter
  .route("/")
  .get(requireAuth, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const creator_id = req.user.id;
    TeamsService.getAllTeams(knexInstance, creator_id)
      .then((teams) => {
        res.json(teams);
      })
      .catch(next);
  })
  .post(requireAuth, (req, res, next) => {
    const { creator_id, title } = req.body;
    const newTeam = { creator_id, title };
    console.log(newTeam);

    for (const [key, value] of Object.entries(newTeam))
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }

    TeamsService.insertTeam(req.app.get("db"), newTeam)
      .then((team) => {
        res.json(team);
      })
      .catch(next);
  });

teamsRouter
  .route("/:id")
  .all((req, res, next) => {
    TeamsService.getById(req.app.get("db"), req.params.id)
      .then((team) => {
        if (!team) {
          return res.status(404).json({
            error: { message: `Team doesn't exist` },
          });
        }
        res.team = team;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(res.team);
  })
  .delete((req, res, next) => {
    TeamsService.deleteTeam(req.app.get("db"), req.params.id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch((req, res, next) => {
    const { title } = req.body;
    const teamToUpdate = { title };

    const numberOfValues = Object.values(teamToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title'`,
        },
      });
    }

    TeamsService.updateTeam(req.app.get("db"), req.params.id, teamToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = teamsRouter;
