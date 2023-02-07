import OrderModel from './models/orders.js'
import ProductModel from './models/products.js'
import UserModel from './models/users.js'
import MongoModel from './manager/index.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const orders = new MongoModel(OrderModel)
export const products = new MongoModel(ProductModel)
export const users = new MongoModel(UserModel)

const mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true}
mongoose.set('strictQuery', true)
mongoose.connect(process.env.MONGODB_URL, mongoOptions, e => {
    e && logger.error('Hubo un error conectandose a la BDD')
})