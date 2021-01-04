const express = require("express");
const logger = require("../logger");
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { requireAuth } = require("../middleware/jwt-auth");

const emailsRouter = express.Router();

emailsRouter.route("/").post(requireAuth, (req, res, next) => {
  console.log(req.query);
  // Get variables from query string
  const { recipient, sender, senderName } = req.body;
  const url = "http://localhost:3000";

  const subject = senderName;
  //   + ` invited you to join Bookly!`;
  const text = `${senderName} wants to add you to their team on Bookly so you can view and join events. If you don't have an account, go ahead and click the link below to get signed up:`;
  console.log(recipient);
  //SendGrid data requirements
  const msg = {
    to: recipient,
    from: sender,
    subject: "sender",
    text: `Zachary wants to add you to their team on Bookly so you can view and join events. If you don't have an account, go ahead and click the link to get signed up: ${url}`,
  };

  //Send email
  sgMail
    .send(msg)
    .then((msg) => console.log(text))
    .catch();
});

module.exports = emailsRouter;
