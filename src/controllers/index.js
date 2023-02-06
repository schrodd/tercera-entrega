import { products, users, orders } from '../db/index.js'
import sendMail from '../services/nodemailer/nodemailer.js'
import twilioSend from '../services/twilio.js'

// helper functions (mostly formatters) //

function prodIdsFormatter(cart) {
  return cart.map(e => ({_id: e.id}))
}
function prodInCartFormatter(cart, products){
  const arr = []
  cart.forEach(e => {
    const prod = products.find(f => e.id == f._id)
    arr.push({qty: e.qty, ...prod})
  })
  return arr
}

function templateDataFormatter(req, additionalData, cartLength) {
  return ({ username: req.user.name, photo: req.user.photo, cartLength: req.user.cart.length, additionalData })
}

// end helper functions //

async function productList(req, res) {
  const allProducts = await products.find()
  const data = {
    username: req.user.name, photo: req.user.photo, cartLength: req.user.cart.length, allProducts
  }
  res.render('products', data)
}

function logout(req, res) {
  const user = req.user.username
  req.session.destroy(e => e && logger.error(e))
  res.render('logout', {loggedOutUser: user})
}

async function cart(req, res) {
  const productData = null
  if (req.user.cart.length > 0) productData = await products.find({$or:prodIdsFormatter(req.user.cart)})
  const prodsInCart = prodInCartFormatter(req.user.cart, productData)
  prodsInCart.length == 0
  ? res.render('empty-cart', templateDataFormatter(req, prodsInCart))
  : res.render('cart', data)
}

async function addToCart(req, res) {
  const isInCart = req.user.cart.find(e => e.id == req.params.id) // find product in cart
  isInCart ? isInCart.qty++ : req.user.cart.push({id: req.params.id, qty: 1}) // add prod to cart
  logger.info(req.user.cart)
  await users.updateOne({_id: req.user.id}, {cart: req.user.cart}, e => e && logger.error(e))
  res.redirect('/added-to-cart')
}

function addedToCart(req, res) {
  res.render('added-to-cart', templateData(req))
}

async function removeFromCart(req, res) {
  const idx = req.user.cart.findIndex(e => e.id == req.params.id)
  idx != -1 && req.user.cart.splice(idx, 1)
  await users.update({_id: req.user.id}, {cart: req.user.cart}, e => e && logger.error(e))
  res.redirect('/removed-from-cart')
}

function removedFromCart(req, res) {
  res.render('removed-from-cart', templateDataFormatter(req))
}

async function placeOrder(req, res) {
  try {
    const doc = new orders({userid: req.user.id, products: req.user.cart})
    await doc.save()
    await users.update({_id: req.user.id}, {cart: []}, e => e && logger.error(e)) // clear cart
    await sendMail.orderPlaced(req.user) // mail to admin
    await twilioSend.admin.orderPlacedWsp(req.user.username) // wsp to admin
    await twilioSend.user.orderPlacedSms(req.user.username, req.user.phone) // sms to user
  } catch (err) {
    logger.error(err)
  }
  res.render('order-placed', templateDataFormatter(req))
}

const controllers = {
  productList, logout, cart, addToCart, addedToCart, removeFromCart, removedFromCart, placeOrder
}

export default controllers