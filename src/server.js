import express from 'express'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import handlebars from 'express-handlebars'
import MongoStore from 'connect-mongo'
import session from 'express-session'
import cluster from 'cluster'
import os from 'os'
import mainRouter from './routers/index.js'
import { logger } from './lib/logger.js'
import { MODE, PORT, MONGODB_URL } from './config/config.js'
import passport from 'passport'
import { loginStrat, signupStrat } from './lib/passport.js'
import UserModel from './db/models/userModel.js'

// init app
export const app = express()


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

// configure session (keep this order, first config session then init passport)
app.use(session({
    store: MongoStore.create({
        mongoUrl: MONGODB_URL,
        mongoOptions: {useNewUrlParser: true, useUnifiedTopology: true}
    }),
    secret: 'clavesecreta',
    resave: false,
    saveUninitialized: false,
    rolling: true, // allows restarting maxAge with each request
    cookie: { maxAge: 600000 } // 10 min
}))
app.use(passport.initialize()) // passport - express
app.use(passport.session()) // passport - session

// create req.user (serialization)
passport.serializeUser((user, done) => done(null, user._id))
passport.deserializeUser((id, done) => UserModel.findById(id, done))

passport.use('login', loginStrat)
passport.use('signup', signupStrat)

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