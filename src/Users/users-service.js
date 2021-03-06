const knex = require("knex");
const bcrypt = require("bcryptjs");

const UsersService = {
  getAllUsers(knex) {
    return knex.from("users").select("*");
  },

  getById(knex, id) {
    return knex.select("*").from("users").where("id", id).first();
  },

  getUnregisteredUser(knex, email) {
    return knex.select("*").from("users").where("email", email);
  },

  hasUserWithEmail(knex, email) {
    return knex("users")
      .where({ email })
      .first()
      .then((user) => !!user);
  },

  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into("users")
      .returning("*")
      .then((rows) => rows[0]);
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

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  updateUser(knex, id, newUserFields) {
    return knex("users").where({ id }).update(newUserFields);
  },

  updateUsersPassword(knex, id, newPassField) {
    return knex("users").where({ id }).update(newPassField);
  },

  getUserByEmail(knex, email) {
    return knex.select("id").from("users").where({ email });
  },
};

module.exports = UsersService;
