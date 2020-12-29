const TeamMembersService = {
  getAllTeamMembers(knex) {
    return knex.from("team_members").select("*");
  },

  getTeamId(knex, creator_id) {
    return knex.select("id").from("teams").where("creator_id", creator_id);
  },

  getTeamMembersByTeamId(knex, team_id) {
    return knex.select("*").from("team_members").where("team_id", team_id);
  },

  insertTeamMember(knex, newTeamMember) {
    return knex
      .insert(newTeamMember)
      .into("team_members")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  getTeamMemberByUserId(knex, user_id) {
    return knex.from("team_members").select("*").where("user_id", user_id);
  },

  deleteTeamMember(knex, user_id) {
    return knex("team_members").where({ user_id }).delete();
  },
};

module.exports = TeamMembersService;
