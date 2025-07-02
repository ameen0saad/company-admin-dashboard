import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { __dirname } from './path.js';

export class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name;
    this.url = url;
    this.from = `Company <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV == 'production')
      return nodemailer.createTransport({
        host: process.env.TURBO_EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.TURBO_USERNAME,
          pass: process.env.TURBO_PASSWORD,
        },
      });

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const mailOption = {
      from: this.from,
      to: this.to,
      subject,
      html: template,
    };
    await this.newTransport().sendMail(mailOption);
  }
  async sendWelcome() {
    const templatePath = path.join(
      __dirname,
      '..',
      'public',
      'HTML',
      'welcomeTemplate.html'
    );
    const htmlTemplate = fs
      .readFileSync(templatePath, 'utf-8')
      .replace('{{name}}', this.name)
      .replace('{{loginUrl}}', this.url)
      .replace('{{year}}', new Date().getFullYear());
    await this.send(htmlTemplate, 'Welecome to our Company');
  }
  async sendOTP(otp) {
    const templatePath = path.join(
      __dirname,
      '..',
      'public',
      'HTML',
      'otpTemplate.html'
    );
    const htmlTemplate = fs
      .readFileSync(templatePath, 'utf-8')
      .replace('{{name}}', this.name)
      .replace('{{otp}}', otp)
      .replace('{{year}}', new Date().getFullYear());

    await this.send(
      htmlTemplate,
      'Your OTP to reset password (valid for only 10 minutes)'
    );
  }
}
