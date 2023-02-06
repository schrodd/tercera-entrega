import twilio from 'twilio'

const {
  TWILIO_SID, 
  TWILIO_AUTHTOKEN,
  TWILIO_NUMBER,
  TWILIO_WSP_SENDER,
  TWILIO_WSP_ADMIN,
} = process.env

// init twilio
const twilioClient = twilio(TWILIO_SID, TWILIO_AUTHTOKEN)

export const twilioSend = {
  admin: {
    async orderPlaced(username){
      const message = await twilioClient.messages.create({
        body: `Tu tienda tiene un nuevo pedido de ${username}`,
        from: TWILIO_WSP_SENDER,
        to: TWILIO_WSP_ADMIN
      })
      return message
    }
  },
  user: {
    async orderPlaced(username, userPhone){
      const message = await twilioClient.messages.create({
        body: `Hola ${username}, gracias por tu compra!`,
        from: TWILIO_NUMBER,
        to: userPhone
      })
    }
  }
}

// Usage examples: twilioSend.admin.orderPlaced(...), twilioSend.user.orderPlaced(...)