const EventsService = {
  getEventsByTeamandMemberId(knex, creator_id, user_id) {
    return knex
      .select("*")
      .from(["teams", "team_members"])
      .where({ creator_id })
      .orWhere({ user_id });
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
