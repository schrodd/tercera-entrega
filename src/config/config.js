import dotenv from 'dotenv'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

const args = yargs(hideBin(process.argv)).argv
dotenv.config()

export const { 
  NODEMAILER_EMAIL, 
  NODEMAILER_PASSWORD, 
  TWILIO_SID, 
  TWILIO_AUTHTOKEN,
  TWILIO_NUMBER,
  TWILIO_WSP_SENDER,
  TWILIO_WSP_ADMIN,
  MODE,
  DATABASE
} = process.env

export const PORT = args.port ? args.port : process.env.PORT
export const MONGODB_URL = args.prod ? process.env.MONGODB_URL : process.env.MONGODB_URL_TEST