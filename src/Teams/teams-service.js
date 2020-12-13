const TeamsService = {
  getAllTeams(knex) {
    return knex.from("teams").select("*");
  },

  insertTeam(knex, newTeam) {
    return knex
      .insert(newTeam)
      .into("teams")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = TeamsService;
