require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const eventsRouter = require("./Events/events-router");
const teamsRouter = require("./Teams/teams-router");
const usersRouter = require("./Users/users-router");
const teamMembersRouter = require("./TeamMembers/team-members-router");
const authRouter = require("./Auth/auth-router");
const emailsRouter = require("./Emails/email-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/events", eventsRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/team-members", teamMembersRouter);
app.use("/api/emails", emailsRouter);

app.get("/api/bookly", (req, res) => {
  res.send("Hello, bookly!");
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
