const express = require("express");
const xss = require("xss");
const knex = require("knex");
const EventsService = require("./events-service");
const logger = require("../logger");

const teamMembersRouter = express.Router();

module.exports = teamMembersRouter;
