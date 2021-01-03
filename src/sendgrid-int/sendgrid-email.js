require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  to: "z.painter45@gmail.com", // Change to your recipient
  from: "z.painter45@gmail.com", // Change to your verified sender
  subject: "Test email from SendGrid",
  text: "Test email for Zach Painter",
  html: "<strong>Test email for Zach Painter</strong>",
};
sgMail
  .send(msg)
  .then(() => {
    console.log("Email sent");
  })
  .catch((error) => {
    console.error(error);
  });
