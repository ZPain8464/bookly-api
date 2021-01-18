const express = require("express");
const UsersService = require("./users-service");
const xss = require("xss");
const { requireAuth } = require("../middleware/jwt-auth");

const usersRouter = express.Router();

const serializeUser = (user) => {
  return {
    id: user.id,
    email: xss(user.email),
    first_name: xss(user.first_name),
    last_name: xss(user.last_name),
    date_created: user.date_created,
    profile_image: xss(user.profile_image),
  };
};

const serializeTeam = (team) => {
  return {
    id: team.id,
    creator_id: team.creator_id,
    title: xss(team.creator_id),
  };
};

let knexInstance;

usersRouter
  .route("/")
  .all((req, res, next) => {
    knexInstance = req.app.get("db");
    next();
  })
  .get(requireAuth, (req, res) => {
    knexInstance = req.app.get("db");
    res.json(serializeUser(req.user));
  })
  .post((req, res) => {
    const {
      email,
      first_name,
      last_name,
      profile_image,
      phone_number,
      password,
      confirmPassword,
    } = req.body;

    const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

    for (const field of [
      "email",
      "password",
      "confirmPassword",
      "first_name",
      "last_name",
    ]) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing ${field}`,
        });
      }
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: `Passwords don't match`,
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: `Password must be 8 or more characters`,
      });
    }

    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return res.status(400).json({
        error: `Password must contain one uppercase character, one lowercase character, one special character, and one number`,
      });
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
        };

        return UsersService.insertUser(knexInstance, newUser).then((user) => {
          const creator_id = user.id;
          const title = user.email;
          const newTeam = { creator_id, title };
          // creates new team w/ new user
          UsersService.insertTeam(knexInstance, newTeam).then((team) => {
            const newUserObj = { user, team };
            res.status(201).json(newUserObj);
          });
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
      password,
      confirmPassword,
    };

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'email', 'first_name', 'last_name', 'profile_image', 'phone_number', or 'password'`,
        },
      });
    }

    UsersService.updateUser(req.app.get("db"), req.params.id, userToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });
usersRouter.route("/update-password/:id").patch((req, res, next) => {
  const { password, confirmPassword } = req.body;
  const id = req.params.id;
  const passwordToUpdate = { id, password, confirmPassword };
  const knexInstance = req.app.get("db");
  const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;
  if (password !== confirmPassword) {
    return res.status(400).json({
      error: `Passwords don't match`,
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: `Password must be 8 or more characters`,
    });
  }

  if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
    return res.status(400).json({
      error: `Password must contain one uppercase character, one lowercase character, one special character, and one number`,
    });
  }
  return UsersService.hashPassword(password).then((hashedPassword) => {
    const newPassword = {
      password: hashedPassword,
    };

    return UsersService.updateUsersPassword(knexInstance, id, newPassword)
      .then((user) => {
        res.status(204).end();
      })
      .catch(next);
  });
});
usersRouter.route("/unregistered-user/sign-up").get((req, res, next) => {
  const email = req.query.email;

  UsersService.getUnregisteredUser(req.app.get("db"), email).then((user) => {
    res.status(201).json(user);
  });
});

module.exports = usersRouter;
