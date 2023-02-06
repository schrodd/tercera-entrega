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
import Product from './products.js'
import Order from './orders.js'
import winston from 'winston'
import bcrypt from 'bcrypt'
import {createTransport} from 'nodemailer'
import twilio from 'twilio'
import dotenv from 'dotenv'
import cluster from 'cluster'
import os from 'os'

dotenv.config()

// init app
const app = express()

// constants
const availableCpus = os.cpus().length
const {
    MONGODB_URL, 
    NODEMAILER_EMAIL, 
    NODEMAILER_PASSWORD, 
    TWILIO_SID, 
    TWILIO_AUTHTOKEN,
    TWILIO_NUMBER,
    TWILIO_WSP_SENDER,
    TWILIO_WSP_ADMIN,
    MODE,
    PORT
} = process.env
const saltRounds = 10
const emailTransporter = createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: NODEMAILER_EMAIL,
        pass: NODEMAILER_PASSWORD
    },
})

// setup logger
const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({level: 'info'}),
        new winston.transports.File({filename: 'error.log', level: 'error'}),
    ]
})

// cluster setup
if (cluster.isPrimary && MODE == 'CLUSTER') {
    logger.info(`Master ${process.pid} is running`)
    for (let i = 0; i < availableCpus; i++){
        cluster.fork()
    }
    cluster.on('exit', (worker, code, signal) => {
        logger.error(`Worker ${worker.process.pid} died`)
        cluster.fork()
    })
} else {
    // start server
    app.listen(PORT, () => {
        logger.info('Server listening on port ' + PORT)
    })
}

// init twilio
const twilioClient = twilio(TWILIO_SID, TWILIO_AUTHTOKEN)

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
const handlebarsOptions = {
    defaultLayout: 'main',
    extname: '.hbs'
}
app.engine('hbs', handlebars.engine(handlebarsOptions))
app.set('views')
app.set('view engine', 'hbs')

// configure mongoose
const mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true}
mongoose.set('strictQuery', true)
mongoose.connect(MONGODB_URL, mongoOptions, e => {
    e && logger.error('Hubo un error conectandose a la BDD')
})

// configure session
app.use(session({
    store: MongoStore.create({
        mongoUrl: MONGODB_URL,
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
// create req.user (serialization)
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
                        cart: []
                    }
                    User.create(newUser, async (err, userCreated) => {
                        if (err) {
                            logger.error(err)
                            return done(err)
                        } else {
                            // send notification to user via email
                            const emailBody = `¡Hola Administrador!
                            ${userCreated.name} se ha creado una cuenta en el sitio web.
                            Su usuario es ${userCreated.username}.`
                            const emailOptions = {
                                from: 'Server de NodeJS' ,
                                to: NODEMAILER_EMAIL,
                                subject: 'Se ha creado una cuenta',
                                html: emailBody,
                            }
                            try {
                                await emailTransporter.sendMail(emailOptions)
                            } catch (error) {
                                logger.error(error)
                            }
                            // returns new user
                            return done(null, userCreated) 
                        }
                    })
                });                
                
            }
        })           
    }
))

// routes
app.get('/', passIfLogged, async (req, res) => {
    const products = JSON.stringify(await Product.find())
    const productsParsed = JSON.parse(products)
    const data = {
        productsParsed,
        username: req.user.name,
        photo: req.user.photo,
        cartLength: req.user.cart.length
    }
    res.render('products', data)
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

app.get('/cart', passIfLogged, async(req, res) => {
    function prodIds(cart) {
        const arr = []
        cart.forEach(e => {
            arr.push({_id: e.id})
        })
        return arr
    }
    function prodInCartFormatter(cart, products){
        const arr = []
        cart.forEach(e => {
            const prod = products.find(f => e.id == f._id)
            arr.push({qty: e.qty, ...prod})
        })
        return arr
    }
    let productsRaw = []
    let productsParsed = []
    if (req.user.cart.length > 0) {
        productsRaw = JSON.stringify(await Product.find({$or:prodIds(req.user.cart)}))
        productsParsed = JSON.parse(productsRaw)
    }
    const data = {
        prodsInCart: prodInCartFormatter(req.user.cart, productsParsed),
        username: req.user.name,
        photo: req.user.photo,
        cartLength: req.user.cart.length
    }
    data.prodsInCart.length == 0 ? res.render('empty-cart', data) : res.render('cart', data)
})

app.get('/add-to-cart/:id', passIfLogged, (req, res) => {
    const isInCart = req.user.cart.find(e => e.id == req.params.id)
    if (isInCart) {
        isInCart.qty++
    } else {
        req.user.cart.push({id: req.params.id, qty: 1})
    }
    logger.info(req.user.cart)
    try {
        User.updateOne({_id: req.user.id}, {cart: req.user.cart}, e => e && logger.error(e))
    } catch (e) {
        logger.error(e)
    }
    res.redirect('/added-to-cart')
})

app.get('/added-to-cart', passIfLogged, (req, res) => {
    const data = {
        username: req.user.name,
        photo: req.user.photo,
        cartLength: req.user.cart.length
    }
    res.render('added-to-cart', data)
})

app.get('/remove-from-cart/:id', passIfLogged, (req, res) => {
    const idx = req.user.cart.findIndex(e => e.id == req.params.id)
    idx != -1 && req.user.cart.splice(idx, 1)
    try {
        User.updateOne({_id: req.user.id}, {cart: req.user.cart}, e => e && logger.error(e))
    } catch (e) {
        logger.error(e)
    }
    res.redirect('/removed-from-cart')
})

app.get('/removed-from-cart', passIfLogged, (req, res) => {
    const data = {
        username: req.user.name,
        photo: req.user.photo,
        cartLength: req.user.cart.length
    }
    res.render('removed-from-cart', data)
})

app.get('/place-order', passIfLogged, async (req, res) => {
    try {
        // Add record on DB 'Orders' collection
        const doc = new Order({userid: req.user.id, products: req.user.cart})
        await doc.save()
        // Clear cart
        User.updateOne({_id: req.user.id}, {cart: []}, e => e && logger.error(e))
        // Send notification to admin via mail
        const emailBody = `¡Hola Administrador!
        Ha ingresado un nuevo pedido de ${req.user.name} (${req.user.username}).`
        const emailOptions = {
            from: 'Server de NodeJS' ,
            to: NODEMAILER_EMAIL,
            subject: `Tu tienda tiene un nuevo pedido de ${req.user.username}`,
            html: emailBody,
        }
        try {
            await emailTransporter.sendMail(emailOptions)
        } catch (error) {
            logger.error(error)
        }
        // Send notification to admin via whatsapp
        try {
            const message = await twilioClient.messages.create({
            body: `Tu tienda tiene un nuevo pedido de ${req.user.username}`,
            from: TWILIO_WSP_SENDER,
            to: TWILIO_WSP_ADMIN
            })
            logger.info(message)
        } catch (error) {
            logger.error(error)
        }
        // Send notification to user via SMS
        try {
            const message = await twilioClient.messages.create({
            body: `Hola ${req.user.username}, gracias por tu compra!`,
            from: TWILIO_NUMBER,
            to: req.user.phone
            })
            logger.info(message)
        } catch (error) {
            logger.error(error)
        }
    } catch (err) {
        logger.error(err)
    }
    // Redirect to template informing what happened
    const data = {
        username: req.user.name,
        photo: req.user.photo,
        cartLength: 0
    }
    res.render('order-placed', data)
})