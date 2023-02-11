import { Router } from 'express'
import controllers from '../controllers/index.js'
import passport from 'passport'
import { passIfLogged, passIfNotLogged } from './middlewares.js'

const mainRouter = new Router()
const ppLoginFailedOptions = { failureRedirect: '/login-failed', failureMessage: true }
const ppRegisterFailedOptions = { failureRedirect: '/register-failed', failureMessage: true }

mainRouter.get('/', passIfLogged, controllers.productList)
mainRouter.get('/login', passIfNotLogged, controllers.renderLogin )
mainRouter.post('/login', passport.authenticate('login', ppLoginFailedOptions), controllers.redirectRoot )
mainRouter.get('/login-failed', controllers.loginFailed)
mainRouter.get('/logout', passIfLogged, controllers.logout)
mainRouter.get('/register', passIfNotLogged, controllers.renderRegister)
mainRouter.post('/register', passport.authenticate('signup', ppRegisterFailedOptions), controllers.redirectRoot)
mainRouter.get('/register-failed', controllers.registerFailed)
mainRouter.get('/cart', passIfLogged, controllers.cart)
mainRouter.get('/add-to-cart/:id', passIfLogged, controllers.addToCart)
mainRouter.get('/added-to-cart', passIfLogged, controllers.addedToCart)
mainRouter.get('/remove-from-cart/:id', passIfLogged, controllers.removeFromCart)
mainRouter.get('/removed-from-cart', passIfLogged, controllers.removedFromCart)
mainRouter.get('/place-order', passIfLogged, controllers.placeOrder)

export default mainRouter