import { Router } from 'express'
import ctrl from '../controllers/index.js'
import passport from 'passport'

const mainRouter = new Router()
const ppLoginFailedOptions = { failureRedirect: '/login-failed', failureMessage: true }
const ppRegisterFailedOptions = { failureRedirect: '/register-failed', failureMessage: true }

// check login (middlewares)
export const passIfLogged = (req, res, next) => req.isAuthenticated() ? next() : res.redirect('/login')
export const passIfNotLogged = (req, res, next) => req.isAuthenticated() ? res.redirect('/') : next()

mainRouter.get('/', passIfLogged, ctrl.productList)
mainRouter.get('/login', passIfNotLogged, (req, res) => { res.render('login') })
mainRouter.post('/login', passport.authenticate('login', ppLoginFailedOptions), (req, res) => { res.redirect('/') })
mainRouter.get('/login-failed', (req, res) => { res.render('login-failed', {message: req.session.messages.at(-1)}) })
mainRouter.get('/logout', passIfLogged, ctrl.logout)
mainRouter.get('/register', passIfNotLogged, (req, res) => { res.render('register') })
mainRouter.post('/register', passport.authenticate('signup', ppRegisterFailedOptions), (req, res) => { res.redirect('/') })
mainRouter.get('/register-failed', (req, res) => { res.render('register-failed', {message: req.session.messages.at(-1)}) })
mainRouter.get('/cart', passIfLogged, ctrl.cart)
mainRouter.get('/add-to-cart/:id', passIfLogged, ctrl.addToCart)
mainRouter.get('/added-to-cart', passIfLogged, ctrl.addedToCart)
mainRouter.get('/remove-from-cart/:id', passIfLogged, ctrl.removeFromCart)
mainRouter.get('/removed-from-cart', passIfLogged, ctrl.removedFromCart)
mainRouter.get('/place-order', passIfLogged, ctrl.placeOrder)

export default mainRouter