const EventsService = {
  getAllEvents(knex) {
    return knex.from("events").select("*");
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
