const express = require("express");
const UsersService = require("./users-service");

const usersRouter = express.Router();

const serializeUser = (user) => {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    date_created: user.date_created,
    profile_image: user.profile_image,
    user_type: user.user_type,
  };
};

let knexInstance;

usersRouter
  .route("/")
  .all((req, res, next) => {
    knexInstance = req.app.get("db");
    next();
  })
  .get((req, res) => {
    knexInstance = req.app.get("db");
    UsersService.getAllUsers(knexInstance).then((users) => {
      res.json(users);
    });
  })
  .post((req, res) => {
    const {
      email,
      first_name,
      last_name,
      user_type,
      profile_image,
      phone_number,
      password,
    } = req.body;

    for (const field of ["email", "password", "first_name", "last_name"]) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing ${field}`,
        });
      }
    }

    UsersService.hasUserWithEmail(knexInstance, email).then((hasUser) => {
      if (hasUser) {
        return res.status(400).json({
          error: `Email already in use`,
        });
      }

      return UsersService.hashPassword(password).then((hashedPassword) => {
        const newUser = {
          email,
          first_name,
          last_name,
          password: hashedPassword,
          user_type,
        };

        return UsersService.insertUser(knexInstance, newUser).then((user) => {
          res.status(201).json(serializeUser(user));
        });
      });
    });
  });

usersRouter
  .route("/:id")
  .all((req, res, next) => {
    UsersService.getById(req.app.get("db"), req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` },
          });
        }
        res.user = user;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(res.user);
  })
  .patch((req, res, next) => {
    const {
      email,
      first_name,
      last_name,
      profile_image,
      phone_number,
    } = req.body;
    const userToUpdate = {
      email,
      first_name,
      last_name,
      profile_image,
      phone_number,
    };

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'email', 'first_name', 'last_name', 'profile_image', or 'phone_number'`,
        },
      });
    }
    UsersService.updateUser(req.app.get("db"), req.params.id, userToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = usersRouter;
