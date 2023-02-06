import express from 'express'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import handlebars from 'express-handlebars'
import MongoStore from 'connect-mongo'
import session from 'express-session'
import dotenv from 'dotenv'
import cluster from 'cluster'
import os from 'os'
import mainRouter from './routers/index.js'
import { logger } from './services/logger.js'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcrypt'
import { users } from './db/index.js'
import { sendMailUserCreated } from './services/nodemailer/nodemailer.js'

dotenv.config()
export const app = express() // init app

// constants
const { MODE, PORT } = process.env

// cluster setup
if (cluster.isPrimary && MODE == 'CLUSTER') {
    logger.info(`Master ${process.pid} is running`)
    os.cpus().forEach(() => cluster.fork())
    cluster.on('exit', (worker) => {
        logger.error(`Worker ${worker.process.pid} died`)
        cluster.fork()
    })
} else {
    app.listen(PORT, () => logger.info('Server listening on port ' + PORT)) // start server
}

app.use(compression()) // compress all responses
app.use(express.json()) // allow JSON handling as objects
app.use(cookieParser()) // allow cookie handling
app.use(express.urlencoded({extended: true})) // allow URL handling as objects
app.use(express.static('./public')) // serve static files

// configure session
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
        mongoOptions: {useNewUrlParser: true, useUnifiedTopology: true}
    }),
    secret: 'clavesecreta',
    resave: false,
    saveUninitialized: false,
    rolling: true, // allows restarting maxAge with each request
    cookie: { maxAge: 600000 } // 10 min
}))

// configure passport
app.use(passport.initialize()) // passport - express
app.use(passport.session()) // passport - session

const saltRounds = 10 // bcrypt rounds 

// check login (middlewares)
export const passIfLogged = () => req.isAuthenticated() ? next() : res.redirect('/login')
export const passIfNotLogged = () => req.isAuthenticated() ? res.redirect('/') : next()

// create req.user (serialization)
passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser((id, done) => {
  users.find({_id: id}, done);
})

// user formatter
function userFormatter(username, password, body) {
    return { username, password, name: body.name, email: body.email, address: body.address,
    age: body.age, phone: body.phone, photo: body.photo, cart: [] }}
  
// config LocalStrategy
passport.use('login', new LocalStrategy(
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
))

passport.use('signup', new LocalStrategy(
    {passReqToCallback: true}, // allows access to request from callback
    (req, username, password, done) => { 
        users.findOne({ username }, (err, user) => { 
            if (err) return done(err) 
            if (user) return done(null, false)
            if (!user) { // if it doesnt exist, creates it
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

// configure handlebars
const handlebarsOptions = {
    defaultLayout: 'main',
    extname: '.hbs'
}
app.engine('hbs', handlebars.engine(handlebarsOptions))
app.set('views')
app.set('view engine', 'hbs')

// configure routes
app.use('/', mainRouter)