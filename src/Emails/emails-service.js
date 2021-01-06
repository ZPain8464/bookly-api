const EmailsService = {
  insertInvite(knex, inviteUrl) {
    return knex
      .insert(inviteUrl)
      .into("invitation_urls")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getUser(knex, url) {
    return knex("invitation_urls").select("*").where({ url });
  },
};
module.exports = EmailsService;
