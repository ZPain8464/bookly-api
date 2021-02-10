const EventsService = {
  getAllEvents(knex) {
    return knex.select("*").from("events");
  },

  getTeamIdByUserId(knex, user_id) {
    return knex.select("*").from("team_members").where({ user_id });
  },

  getEventsByTeamId(knex, team_id) {
    return knex.select("*").from("events").where("team_id", team_id);
  },

  getTeamIdByCreator(knex, creator_id) {
    return knex.select("id").from("teams").where("creator_id", creator_id);
  },

  getTeamIdByTeamMember(knex, user_id) {
    return knex
      .select("team_id")
      .from("team_members")
      .where("user_id", user_id);
  },

  getEventsByTeamId(knex, team_id) {
    return knex.select("*").from("events").where("team_id", team_id);
  },

  getById(knex, id) {
    return knex.select("*").from("events").where("id", id).first();
  },

  insertEvent(knex, newEvent) {
    return knex
      .insert(newEvent)
      .into("events")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  deleteEvent(knex, id) {
    return knex("events").where({ id }).delete();
  },

  updateEvent(knex, id, newEventFields) {
    return knex("events").where({ id }).update(newEventFields);
  },
};

module.exports = EventsService;
