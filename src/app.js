require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const eventsRouter = require("./Events/events-router");
const teamsRouter = require("./Teams/teams-router");
const usersRouter = require("./Users/users-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/events", eventsRouter);
app.use("/api/teams", teamsRouter);

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
