import twilio from 'twilio'
import {
  TWILIO_SID, 
  TWILIO_AUTHTOKEN,
  TWILIO_NUMBER,
  TWILIO_WSP_SENDER,
  TWILIO_WSP_ADMIN,
} from './env.js'

// init twilio
const twilioClient = twilio(TWILIO_SID, TWILIO_AUTHTOKEN)

const twilioSend = {
  admin: {
    async orderPlacedWsp(username){
      const message = await twilioClient.messages.create({
        body: `Tu tienda tiene un nuevo pedido de ${username}`,
        from: TWILIO_WSP_SENDER,
        to: TWILIO_WSP_ADMIN
      })
      return message
    }
  },
  user: {
    async orderPlacedSms(username, userPhone){
      const message = await twilioClient.messages.create({
        body: `Hola ${username}, gracias por tu compra!`,
        from: TWILIO_NUMBER,
        to: userPhone
      })
      return message
    }
  }
}

export default twilioSend