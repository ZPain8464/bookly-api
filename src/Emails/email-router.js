const express = require("express");
const logger = require("../logger");
require("dotenv").config();
const EmailsService = require("./emails-service");
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { requireAuth } = require("../middleware/jwt-auth");

const emailsRouter = express.Router();
emailsRouter
  .route("/")
  .post(requireAuth, (req, res, next) => {
    // Get variables from query string
    const { recipient, sender, name } = req.body;
    const url = "http://localhost:3000/invite-page/" + uuidv4();

    // Variables for invite_urls table
    const userInviteObject = { url, recipient };

    const subject = `${name} invited you to join Bookly!`;
    const text = `${name} wants to add you to their team on Bookly so you can view and join events. If you don't have an account, go ahead and click the link below to get signed up:${url}`;
    //SendGrid data requirements
    const msg = {
      to: recipient,
      from: sender,
      subject: subject,
      text: `${name} wants to add you to their team on Bookly so you can view and join events. If you don't have an account, go ahead and click the link to get signed up: ${url}`,
    };

    //Send email; stores userInviteObject in invite_urls table
    sgMail
      .send(msg)
      .then((msg) => {
        EmailsService.insertInvite(req.app.get("db"), userInviteObject).then(
          () => {
            return res.status(201).json("email successfully sent");
          }
        );
      })
      .catch(next);
  })
  .get((req, res, next) => {
    const url = req.query.url;
    console.log(url);
    EmailsService.getUser(req.app.get("db"), url)
      .then((userData) => {
        res.status(201).json(userData[0].recipient);
      })
      .catch(next);
  });

module.exports = emailsRouter;
