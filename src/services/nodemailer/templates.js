export function userCreatedTemplate(userCreated){
  const emailOptions = {
      from: 'Server de NodeJS' ,
      to: process.env.NODEMAILER_EMAIL,
      subject: 'Se ha creado una cuenta',
      html: `¡Hola Administrador!
      ${userCreated.name} se ha creado una cuenta en el sitio web.
      Su usuario es ${userCreated.username}.`
  }
  return emailOptions
}