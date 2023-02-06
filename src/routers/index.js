import { Router } from 'express'
import { passIfLogged, passIfNotLogged } from '../services/passport.js'
import { productList } from '../controllers/index.js'

const mainRouter = new Router()

mainRouter.get('/productos', passIfLogged, productList)

export default mainRouter

// routes
/* app.get('/', passIfLogged, async (req, res) => {
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
}) */