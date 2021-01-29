const express = require("express");
const logger = require("../logger");
require("dotenv").config();
const EmailsService = require("./emails-service");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { requireAuth } = require("../middleware/jwt-auth");

const emailsRouter = express.Router();
emailsRouter
  .route("/")
  .post(requireAuth, (req, res, next) => {
    // Get variables from query string
    const { recipient, sender, name, url } = req.body;
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

    EmailsService.getUrl(req.app.get("db"), url)
      .then((userData) => {
        res.status(201).json(userData[0]);
      })
      .catch(next);
  });

emailsRouter
  .route("/event-invite")
  .post(requireAuth, (req, res, next) => {
    const { recipient, sender, sender_name, event, url, parameter } = req.body;

    const event_id = event.id;
    const eventInviteObject = { url, recipient, event_id, parameter };

    const subject = `${sender_name} invited you to an event!`;
    const text = `${sender_name} wants to invite you to join their event ${event.title} on ${event.date} at ${event.location} from ${event.time_start} — ${event.time_end}. Click the link to confirm: ${url} `;
    const msg = {
      to: recipient,
      from: sender,
      subject: subject,
      text: text,
    };

    sgMail
      .send(msg)
      .then((response) => {
        EmailsService.insertInvite(req.app.get("db"), eventInviteObject);
        res.status(201).json("email successfully sent");
      })
      .catch(next);
  })
  .get((req, res, next) => {
    const url = req.query.url;
    EmailsService.getUrl(req.app.get("db"), url).then((param) => {
      res.json(param);
    });
  });

module.exports = emailsRouter;
