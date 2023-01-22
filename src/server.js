import express from 'express'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import handlebars from 'express-handlebars'
import MongoStore from 'connect-mongo'
import mongoose from 'mongoose'
import session from 'express-session'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import User from './users.js'
import Products from './products.js'
import winston from 'winston'
import bcrypt from 'bcrypt'

// init app
const app = express()

// constants
const port = 8080
const mongoUrl = 'mongodb+srv://andres:coder@sessionmongoatlas.egjegti.mongodb.net/sessionMongoAtlas?retryWrites=true&w=majority'
const saltRounds = 10

// functions
function passIfLogged(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/login')
    }
}
function passIfNotLogged(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/')
    } else {
        next()
    }
}

// setup logger
const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({level: 'info'}),
        new winston.transports.File({filename: 'warn.log', level: 'warn'}),
        new winston.transports.File({filename: 'error.log', level: 'error'}),
    ]
})

// compress all responses 
app.use(compression())

// allow JSON handling as objects
app.use(express.json())

// allow cookie handling
app.use(cookieParser())

// allow URL handling as objects
app.use(express.urlencoded({extended: true}))

// serve static files
app.use(express.static('./public'))

// configure handlebars
app.engine('hbs', handlebars.engine({defaultLayout: 'main', extname: '.hbs'}))
app.set('views')
app.set('view engine', 'hbs')

// configure mongoose
const mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true}
mongoose.set('strictQuery', true)
mongoose.connect(mongoUrl, mongoOptions, e => {
    e && logger.error('Hubo un error conectandose a la BDD')
})

// configure session
app.use(session({
    store: MongoStore.create({
        mongoUrl: mongoUrl,
        mongoOptions: mongoOptions
    }),
    secret: 'clavesecreta',
    resave: false,
    saveUninitialized: false,
    rolling: true, // allows restarting maxAge with each request
    cookie: {
        maxAge: 600000 // 10 min
    }
}))

// configure passport
app.use(passport.initialize()) // passport - express
app.use(passport.session()) // passport - session
passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, done);
})

// config LocalStrategy (login)
passport.use('login', new LocalStrategy(
    // {passReqToCallback: true} // allows access to request from callback
    (/* req, */ username, password, done) => {
        // to find an user inside db
        User.findOne({ username }, async (err, user) => {
            if (err) return done(err)
            if (!user) {
                logger.error('User not found with username ' + username);
                return done(null, false, {message: 'No se ha encontrado el usuario'});
            }
            if (! await bcrypt.compare(password, user.password)) {
                logger.error('Invalid Password');
                return done(null, false, {message: 'Contraseña incorrecta'});
            }
            return done(null, user);
        })           
    }
))

// config LocalStrategy (sign up)
passport.use('signup', new LocalStrategy(
    {passReqToCallback: true}, // allows access to request from callback
    (req, username, password, done) => { 
        // to find an user inside db
        User.findOne({ username }, async (err, user) => { 
            if (err) return done(err) 
            if (user) return done(null, false) // if exists, returns it 
            if (!user) { // if it doesnt, creates it
                await bcrypt.hash(password, saltRounds, function(err, hash) {
                    err && logger.error(err)
                    const newUser = {
                        username, 
                        password: hash,
                        name: req.body.name,
                        email: req.body.email,
                        address: req.body.address,
                        age: req.body.age,
                        phone: req.body.phone,
                        photo: req.body.photo,
                    }
                    User.create(newUser, (e, userCreated) => {
                        err && logger.error(err)
                        return done(null, userCreated) // returns new user
                    })
                });                
                
            }
        })           
    }
))

// start server
app.listen(port, () => {
    logger.info('Server listening on port ' + port)
})

// routes
app.get('/', passIfLogged, (req, res) => {
    res.render('products', req.user)
})

app.get('/login', passIfNotLogged, (req, res) => {
    res.render('login')
})

app.post('/login', passport.authenticate('login', {
    failureRedirect: '/login-failed',
    failureMessage: true
}), (req, res) => {
    res.redirect('/')
})

app.get('/login-failed', (req, res) => {
    res.render('login-failed', {message: req.session.messages.at(-1)})
})

app.get('/logout', passIfLogged, (req, res) => {
    const user = req.user.username
    req.session.destroy(e => {
        if (e) logger.error(e)
    })
    res.render('logout', {loggedOutUser: user})
})

app.get('/register', passIfNotLogged, (req, res) => {
    res.render('register')
})

app.post('/register', passport.authenticate('signup', {
    failureRedirect: '/register-failed',
    failureMessage: true
}), (req, res) => {
    res.redirect('/')
})

app.get('/register-failed', (req, res) => {
    res.render('register-failed', {message: req.session.messages.at(-1)})
})

app.get('/cart', passIfLogged, (req, res) => {
    res.render('cart', req.user)
})