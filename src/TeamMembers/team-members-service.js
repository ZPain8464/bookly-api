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

  getUsersByTeamMemberId(knex, id) {
    return knex.select("*").from("users").whereIn("id", id);
  },

  insertInvite(knex, inviteUrl) {
    return knex
      .insert(inviteUrl)
      .into("invitation_urls")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
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

  getTeamMembersByEventId(knex, event_id) {
    return knex
      .from("team_members")
      .select("user_id")
      .where("event_id", event_id)
      .andWhere("accepted", true);
  },

  getUsersById(knex, id) {
    return knex.select("*").from("users").whereIn("id", id);
  },

  getTeamMemberByUserId(knex, user_id) {
    return knex.from("team_members").select("*").where("user_id", user_id);
  },

  updateAccepted(knex, user_id, accepted) {
    return knex("team_members")
      .where("user_id", user_id)
      .update("accepted", accepted);
  },

  updateJoinEvent(knex, event_id, user_id, accepted) {
    return knex("team_members")
      .where("event_id", event_id)
      .andWhere("user_id", user_id)
      .update("accepted", accepted);
  },

  deleteTeamMember(knex, user_id) {
    return knex("team_members").where({ user_id }).delete();
  },
};

module.exports = TeamMembersService;
