import dotenv from 'dotenv'
dotenv.config()

export const {
  MONGODB_URL, 
  NODEMAILER_EMAIL, 
  NODEMAILER_PASSWORD, 
  TWILIO_SID, 
  TWILIO_AUTHTOKEN,
  TWILIO_NUMBER,
  TWILIO_WSP_SENDER,
  TWILIO_WSP_ADMIN,
  MODE,
  PORT,
  DATABASE
} = process.env