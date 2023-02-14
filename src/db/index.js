// factory  
import UserModel from './models/userModel.js'
import ProductModel from './models/productModel.js'
import OrderModel from './models/orderModel.js'
import ClientMongo from './clients/clientMongo.js'

export async function createFactory(DATABASE){
  let userDaoContainer
  let productDaoContainer
  let orderDaoContainer
  switch (DATABASE) {
    case 'MONGODB':
      console.log('before')
      const {UserDao} = await import('./dao/userDao.js')
      const {ProductDao} = await import('./dao/productDao.js')
      const {OrderDao} = await import('./dao/orderDao.js')
      console.log('after')
      const client = new ClientMongo()
      await client.connect()
      userDaoContainer = new UserDao(UserModel)
      productDaoContainer = new ProductDao(ProductModel)
      orderDaoContainer = new OrderDao(OrderModel)
      break
    default:
      break
  }
  return {userDaoContainer, productDaoContainer, orderDaoContainer}
}