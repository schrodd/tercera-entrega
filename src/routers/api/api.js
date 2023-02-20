import { Router } from 'express'
import controllers from '../../controllers/index.js'

const apiRouter = new Router()

apiRouter.get('/users', controllers.getUserListApiCtrl)
apiRouter.get('/orders', controllers.getOrderListApiCtrl)

// Products CRUD
apiRouter.get('/products', controllers.getProductListApiCtrl) 
apiRouter.get('/products/:id', controllers.getProductListApiCtrl)
apiRouter.post('/products', controllers.postProductApiCtrl) // body: receives an object with 3 props: name (string), image (string), and price (number)
apiRouter.put('/products/:id', controllers.updateProductApiCtrl) // body: receives an object with 3 props: name (string), image (string), and price (number)
apiRouter.delete('/products/:id', controllers.deleteProductApiCtrl) // params: receives id of target product 

export default apiRouter