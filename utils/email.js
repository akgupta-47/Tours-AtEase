const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.firstname = user.name.split(' ')[0];
    this.emailFrom = `Akshat Gupta ${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Activate in gmail "less secure option"
    });
  }

  async send(template, subject) {
    // Render the html from the pug template
    const filePath = path.join(
      __dirname,
      '..',
      'views',
      'emails',
      `${template}.pug`
    );
    const html = pug.renderFile(filePath, {
      firstname: this.firstname,
      url: this.url,
      subject,
    });

    //Define mailOptions
    const mailOptions = {
      from: this.emailFrom,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    this.send('welcome', 'Welcome to the natours!!');
  }
  async sendPasswordReset() {
    this.send(
      'passwordReset',
      'Your password reset token (valid only for 10 min)'
    );
  }
};
