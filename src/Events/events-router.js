const express = require("express");
const xss = require("xss");
const knex = require("knex");
const EventsService = require("./events-service");
const logger = require("../logger");
const { requireAuth } = require("../middleware/jwt-auth");

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
  // Get events for teams you manage
  .get(requireAuth, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const creator_id = req.user.id;
    EventsService.getTeamIdByCreator(knexInstance, creator_id)
      .then((teamId) => {
        const team_id = teamId[0].id;
        EventsService.getEventsByTeamId(knexInstance, team_id)
          .then((events) => {
            res.status(201).json(events);
          })
          .catch(next);
      })
      .catch(next);

    // EventsService.getEventsByTeamandMemberId(knexInstance, creator_id, user_id)
    //   .then((data) => {
    //     const filterId = data.filter((tid) => tid.id === tid.team_id);
    //     const findTeamId = filterId.map((t) => t.team_id);
    //     const team_id = findTeamId[0];
    //     EventsService.getEventsByTeamId(knexInstance, team_id)
    //       .then((events) => {
    //         res.json(events);
    //       })
    //       .catch(next);
    //   })
    //   .catch(next);
  })
  .post(requireAuth, (req, res, next) => {
    const {
      time_start,
      time_end,
      location,
      description,
      date,
      title,
      team_id,
    } = req.body;
    const newEvent = {
      time_start,
      time_end,
      location,
      description,
      date,
      title,
      team_id,
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
  .delete(requireAuth, (req, res, next) => {
    EventsService.deleteEvent(req.app.get("db"), req.params.id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(requireAuth, (req, res, next) => {
    const {
      id,
      title,
      description,
      location,
      date,
      time_start,
      time_end,
      team_id,
    } = req.body;
    const eventToUpdate = {
      id,
      title,
      description,
      location,
      date,
      time_start,
      time_end,
      team_id,
    };

    const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must contain team_id and either 'description', 'title', location, date, time_start or time_end`,
        },
      });
    }

    EventsService.updateEvent(req.app.get("db"), req.params.id, eventToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });
eventsRouter
  .route("/team-members/events")
  .get(requireAuth, (req, res, next) => {
    const user_id = req.user.id;
    EventsService.getTeamIdByTeamMember(req.app.get("db"), user_id)
      .then((teamId) => {
        console.log(teamId);
        const team_id = teamId[0].team_id;
        EventsService.getEventsByTeamId(req.app.get("db"), team_id)
          .then((events) => {
            res.status(201).json(events);
          })
          .catch(next);
      })
      .catch(next);
  });

module.exports = eventsRouter;
