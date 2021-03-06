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

  getUrl(knex, url) {
    return knex.from("invitation_urls").select("*").where({ url });
  },
};
module.exports = EmailsService;
