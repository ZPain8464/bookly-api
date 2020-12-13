const express = require("express");
const xss = require("xss");
const knex = require("knex");
const TeamsService = require("./teams-service");
const logger = require("../logger");

const teamsRouter = express.Router();

teamsRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    TeamsService.getAllTeams(knexInstance)
      .then((teams) => {
        res.json(teams);
      })
      .catch(next);
  })
  .post((req, res, next) => {
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

module.exports = teamsRouter;
