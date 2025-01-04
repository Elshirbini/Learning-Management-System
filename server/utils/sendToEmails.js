import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";
configDotenv();


export const sendToEmail = (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ahmedalshirbini33@gmail.com",
      pass: process.env.PASS_GMAIL_SERVICE,
    },
  });

  const mailOptions = {
    from: "ahmedalshirbini33@gmail.com",
    to: email,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
