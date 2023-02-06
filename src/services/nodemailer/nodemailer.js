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

const sendMail = {
  async userCreated(user){
    try {
      await emailTransporter.sendMail(userCreatedTemplate(user))
    } catch (error) {
      logger.error(error)
    }
  },
  async orderPlaced(user){
    try {
      await emailTransporter.sendMail(user)
    } catch (error) {
      logger.error(error)
    }
  }
}

export default sendMail