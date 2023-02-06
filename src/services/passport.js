import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcrypt'
import { users } from '../db/index.js'
import { sendMailUserCreated } from './nodemailer/nodemailer.js'
import { logger } from './logger.js'

// bcrypt rounds 
const saltRounds = 10

// check login (middlewares)
export function passIfLogged(req, res, next) {
  req.isAuthenticated() ? next() : res.redirect('/login')
}

export function passIfNotLogged(req, res, next) {
  req.isAuthenticated() ? res.redirect('/') : next()
}

// create req.user (serialization)
passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser((id, done) => {
  users.find({_id: id}, done);
})

// user formatter
function userFormatter(username, password, body) {
  return { username, password, name: body.name, email: body.email,
    address: body.address, age: body.age, phone: body.phone,
    photo: body.photo, cart: [] }
}

// config LocalStrategy
passport.use('login', new LocalStrategy(
    (username, password, done) => {
      users.findOne({ username }, async (err, user) => {
        if (err) {
          return done(err)
        } else if (!user) {
          logger.error('User not found with username ' + username)
          return done(null, false, {message: 'No se ha encontrado el usuario'})
        } else if (!await bcrypt.compare(password, user.password)) {
          logger.error('Invalid Password')
          return done(null, false, {message: 'Contraseña incorrecta'})
        } else {
          return done(null, user)
        }
      })    
    }
))

passport.use('signup', new LocalStrategy(
  {passReqToCallback: true}, // allows access to request from callback
  (req, username, password, done) => { 
    users.findOne({ username }, (err, user) => { 
      if (err) return done(err) 
      if (user) return done(null, false) // if exists, returns it 
      if (!user) { // if it doesnt, creates it
        bcrypt.hash(password, saltRounds, function(err, hash) {
          err && logger.error(err)
          users.create(userFormatter(username, hash, req.body), async (err, userCreated) => {
            if (err) {
              logger.error(err)
              return done(err)
            } else {
              await sendMailUserCreated(userCreated) // send notification to user via email
              return done(null, userCreated) // returns new user
            }
          })
        })
      }
    })           
  }
))