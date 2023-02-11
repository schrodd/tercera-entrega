import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcrypt'
import UserModel from '../db/models/users.js'
import { users } from '../db/index.js'
import sendMail from '../lib/nodemailer/nodemailer.js'
import { userFormatter } from '../controllers/formatters.js'

const saltRounds = 10 // bcrypt rounds 

export const signupStrat = new LocalStrategy(
  {passReqToCallback: true}, // allows access to request from callback
  (req, username, password, done) => { 
      users.findOne({ username }, (err, user) => { 
          if (err) return done(err) 
          if (user) return done(null, false)
          if (!user) { // if it doesnt exist, creates it
              bcrypt.hash(password, saltRounds, function(err, hash) {
                  err && logger.error(err)
                  UserModel.create(userFormatter(username, hash, req.body), async (err, userCreated) => {
                      if (err) {
                          logger.error(err)
                          return done(err)
                      } else {
                          await sendMail.userCreated(userCreated) // send notification to user via email
                          return done(null, userCreated) // returns new user
                      }
                  })
              })
          }
      })           
  }
)

export const loginStrat = new LocalStrategy(
  (username, password, done) => {
      users.findOne({ username }, async (err, user) => {
          if (err) return done(err)
          else if (!user) {
              logger.error('User not found with username ' + username)
              return done(null, false, {message: 'No se ha encontrado el usuario'})
          } else if (!await bcrypt.compare(password, user.password)) {
              logger.error('Invalid Password')
              return done(null, false, {message: 'Contraseña incorrecta'})
          } else return done(null, user)
      })
  }
)