import { products, users, orders } from '../db/index.js'
import { prodIdsFormatter, prodInCartFormatter } from '../controllers/formatters.js'
import { logger } from '../lib/logger.js'
import sendMail from '../lib/nodemailer/nodemailer.js'
import twilioSend from '../lib/twilio.js'

export async function getProductList(req){
  const allProducts = await products.find()
  return ({ username: req.user.name, photo: req.user.photo, cartLength: req.user.cart.length, allProducts })
}

export function endSession(req){
  const user = req.user.username
  req.session.destroy(e => e && logger.error(e))
  return ({ loggedOutUser: user })
}

export async function getCartItems(req){
  let productData = null
  if (req.user.cart.length > 0) {
    try {
      productData = await products.find({ $or: prodIdsFormatter(req.user.cart) })
    } catch (error) {
      logger.error(error)
    }
  }
  return ({ 
    username: req.user.name, 
    photo: req.user.photo, 
    cartLength: req.user.cart.length,
    prodsInCart: prodInCartFormatter(req.user.cart, productData)
  })
}

export function addItemToCart(req){
  const isInCart = req.user.cart.find(e => e.id == req.params.id) // find product in cart
  isInCart ? isInCart.qty++ : req.user.cart.push({id: req.params.id, qty: 1}) // add prod to cart
  logger.info(req.user.cart)
  try {
    users.update({_id: req.user.id}, {cart: req.user.cart}, e => e && logger.error(e))
  } catch (error) {
    logger.error(error)
  }
}

export function removeItemFromCart(req){
  const idx = req.user.cart.findIndex(e => e.id == req.params.id)
  idx != -1 && req.user.cart.splice(idx, 1)
  try {
    users.update({_id: req.user.id}, {cart: req.user.cart}, e => e && logger.error(e))
  } catch (error) {
    logger.error(error)
  }
}

export async function processOrder(req){
  try {
    await orders.create({userid: req.user.id, products: req.user.cart})
    users.update({_id: req.user.id}, {cart: []}, e => e && logger.error(e)) // clear cart
    await sendMail.orderPlaced(req.user) // mail to admin
    await twilioSend.admin.orderPlacedWsp(req.user.username) // wsp to admin
    await twilioSend.user.orderPlacedSms(req.user.username, req.user.phone) // sms to user
  } catch (err) {
    console.log(err)
  }
}