const express = require("express");
const xss = require("xss");
const knex = require("knex");
const EventsService = require("./events-service");
const logger = require("../logger");

const eventsRouter = express.Router();

const serializeEvent = (event) => {
  return {
    id: event.id,
    description: xss(event.description),
    location: event.location,
    date: event.date,
    team_id: event.team_id,
    time_start: event.time_start,
    time_end: event.time_end,
    title: xss(event.title),
  };
};

eventsRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    EventsService.getAllEvents(knexInstance)
      .then((events) => {
        res.json(events);
      })
      .catch(next);
  })
  .post((req, res, next) => {
    const {
      time_start,
      time_end,
      location,
      description,
      date,
      title,
    } = req.body;
    const newEvent = {
      time_start,
      time_end,
      location,
      description,
      date,
      title,
    };

    for (const [key, value] of Object.entries(newEvent))
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    EventsService.insertEvent(req.app.get("db"), newEvent)
      .then((event) => {
        res.json(event);
      })
      .catch(next);
  });

eventsRouter
  .route("/:id")
  .all((req, res, next) => {
    EventsService.getById(req.app.get("db"), req.params.id)
      .then((event) => {
        if (!event) {
          return res.status(404).json({
            error: { message: `Event doesn't exist` },
          });
        }
        res.event = event;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(res.event);
  })
  .delete((req, res, next) => {
    EventsService.deleteEvent(req.app.get("db"), req.params.id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch((req, res, next) => {
    const {
      id,
      title,
      description,
      location,
      date,
      time_start,
      time_end,
    } = req.body;
    const eventToUpdate = {
      id,
      title,
      description,
      location,
      date,
      time_start,
      time_end,
    };

    const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'description', 'title', location, date, time_start or time_end`,
        },
      });
    }

    EventsService.updateEvent(req.app.get("db"), req.params.id, eventToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = eventsRouter;
