import { products } from '../db/index.js'

export async function productList(req, res) {
    const allProducts = await products.find()
    const data = {
        allProducts,
        username: req.user && req.user.name,
        photo: req.user && req.user.photo,
        cartLength: req.user && req.user.cart.length
    }
  res.render('products', data)
}