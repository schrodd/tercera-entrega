import supertest from 'supertest'
import {expect} from 'chai'
import {app} from '../server.js'

const request = supertest(app)

const testProduct = {
  name: 'testProductMocha',
  image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToBlpAmy4uFTA3eKRGtRcurd25BndL03QJ8TTfyvc&s',
  price: 500
}

const testProductUpdated = {
  name: 'testProductMochaUpdated',
  image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToBlpAmy4uFTA3eKRGtRcurd25BndL03QJ8TTfyvc&s',
  price: 600
}

describe('Product API tests', () => {
  let productId
  it('POST /products', async() => {
    const res = await request.post('/api/products').send(testProduct)
    productId = res.body.product._id
    console.log(productId)
    expect(res.status).to.equal(200)
  })
  it('GET /products (all products)', async () => {
    const res = await request.get('/api/products')
    expect(res.body).to.have.lengthOf.above(2)
  })
  it('GET /products/id (one product)', async () => {
    const res = await request.get(`/api/products/${productId}`)
    expect(res.body).to.have.lengthOf(1)
  })
  it('PUT /products/id', async() => {
    const res = await request.put(`/api/products/${productId}`).send(testProductUpdated)
    expect(res.status).to.equal(200)
  })
  it('DELETE /products/id', async() => {
    const res = await request.delete(`/api/products/${productId}`)
    expect(res.status).to.equal(200)
  })
})