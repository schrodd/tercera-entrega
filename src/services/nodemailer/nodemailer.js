import { createTransport } from 'nodemailer'
import { userCreatedTemplate } from './templates.js'

const emailTransporter = createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD
  }
})

export async function sendMailUserCreated(userCreated){
  try {
      await emailTransporter.sendMail(userCreatedTemplate(userCreated))
  } catch (error) {
      logger.error(error)
  }
}