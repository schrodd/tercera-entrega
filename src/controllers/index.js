import { templateDataFormatter } from './formatters.js'
import { getProductList, endSession, getCartItems, addItemToCart, removeItemFromCart, 
processOrder, getUserListApi, getProductListApi, getOrderListApi, postProductApi, 
updateProductApi, deleteProductApi } from '../service/index.js'

async function productList(req, res) {
  res.render('products', await getProductList(req))
}

function logout(req, res) {
  res.render('logout', endSession(req))
}

async function cart(req, res) {
  const cartItems = await getCartItems(req)
  cartItems.prodsInCart.length == 0
  ? res.render('empty-cart', templateDataFormatter(req, cartItems.prodsInCart))
  : res.render('cart', cartItems)
}

function addToCart(req, res) {
  addItemToCart(req)
  res.redirect('/added-to-cart')
}

function addedToCart(req, res) {
  res.render('added-to-cart', templateDataFormatter(req))
}

function removeFromCart(req, res) {
  removeItemFromCart(req)
  res.redirect('/removed-from-cart')
}

function removedFromCart(req, res) {
  res.render('removed-from-cart', templateDataFormatter(req))
}

async function placeOrder(req, res) {
  await processOrder(req)
  res.render('order-placed', templateDataFormatter(req))
}

function renderLogin(req, res) {
  res.render('login')
}

function renderRegister(req, res) {
  res.render('register')
}

function redirectRoot(req, res) {
  res.redirect('/')
}

function loginFailed(req, res) {
  res.render('login-failed', {message: req.session.messages.at(-1)})
}

function registerFailed(req, res) {
  res.render('register-failed', {message: req.session.messages.at(-1)})
}

// API 

async function getUserListApiCtrl(req, res) {
  res.status(200).json(await getUserListApi())
}

async function getOrderListApiCtrl(req, res) {
  res.status(200).json(await getOrderListApi())
}

async function getProductListApiCtrl(req, res) {
  res.status(200).json(await getProductListApi(req))
}

async function postProductApiCtrl(req, res) {
  res.status(200).json(await postProductApi(req))
}

async function updateProductApiCtrl(req, res) {
  res.status(200).json(await updateProductApi(req))
}

async function deleteProductApiCtrl(req, res) {
  res.status(200).json(await deleteProductApi(req))
}

const controllers = {
  productList, logout, cart, addToCart, addedToCart, removeFromCart, removedFromCart,
  placeOrder, renderLogin, renderRegister, redirectRoot, loginFailed, registerFailed,
  getUserListApiCtrl, getProductListApiCtrl, getOrderListApiCtrl, postProductApiCtrl,
  updateProductApiCtrl, deleteProductApiCtrl
}

export default controllers