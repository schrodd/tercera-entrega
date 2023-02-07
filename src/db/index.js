import OrderModel from './models/orders.js'
import ProductModel from './models/products.js'
import UserModel from './models/users.js'
import MongoModel from './manager/index.js'
import mongoose from 'mongoose'
import { logger } from '../services/logger.js'
import { MONGODB_URL } from '../services/env.js'

export const orders = new MongoModel(OrderModel)
export const products = new MongoModel(ProductModel)
export const users = new MongoModel(UserModel)

mongoose.set('strictQuery', true)
mongoose.connect(
    MONGODB_URL,
    {useNewUrlParser: true, useUnifiedTopology: true},
    (e) => e && logger.error('Hubo un error conectandose a la BDD')
)