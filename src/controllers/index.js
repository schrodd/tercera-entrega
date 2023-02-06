import { products, users } from '../db/index.js'

// helper functions //

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

// end helper functions //

async function productList(req, res) {
  const allProducts = await products.find()
  const data = {
    allProducts,
    username: req.user && req.user.name,
    photo: req.user && req.user.photo,
    cartLength: req.user && req.user.cart.length
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
  if (req.user.cart.length > 0) {
    productData = await products.find({$or:prodIdsFormatter(req.user.cart)})
  }
  const data = {
    prodsInCart: prodInCartFormatter(req.user.cart, productData),
    username: req.user.name,
    photo: req.user.photo,
    cartLength: req.user.cart.length
  }
  data.prodsInCart.length == 0 ? res.render('empty-cart', data) : res.render('cart', data)
}

async function addToCart(req, res) {
  const isInCart = req.user.cart.find(e => e.id == req.params.id) // find product in cart
  isInCart ? isInCart.qty++ : req.user.cart.push({id: req.params.id, qty: 1}) // add prod to cart
  logger.info(req.user.cart)
  await users.updateOne({_id: req.user.id}, {cart: req.user.cart}, e => e && logger.error(e))
  res.redirect('/added-to-cart')
}

const controllers = {
  productList, logout, cart, addToCart
}

export default controllers