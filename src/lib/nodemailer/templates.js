import { NODEMAILER_EMAIL } from '../../config/config.js'

export function userCreatedTemplate(userCreated){
  const emailOptions = {
      from: 'Server de NodeJS' ,
      to: NODEMAILER_EMAIL,
      subject: 'Se ha creado una cuenta',
      html: `¡Hola Administrador!
      ${userCreated.name} se ha creado una cuenta en el sitio web.
      Su usuario es ${userCreated.username}.`
  }
  return emailOptions
}

export function orderPlacedTemplate(userCreated){
        const emailOptions = {
            from: 'Server de NodeJS' ,
            to: NODEMAILER_EMAIL,
            subject: `Tu tienda tiene un nuevo pedido de ${userCreated.username}`,
            html: `¡Hola Administrador!
            Ha ingresado un nuevo pedido de ${userCreated.name} (${userCreated.username}).`
        }
  return emailOptions
}