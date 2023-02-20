// The following http client will test only /products api route
// As its neccesary to pass an existing product ID to Yargs, i've decided not to create any custom script in Package.json
// Instead, please use 'node httpclient --action {PUT/DELETE} --id {product id}' when trying to update or delete any product
// Also the --action flag is needed, possible values are GET, POST, UPDATE, DELETE
// If none is passed, GET will be executed by default
// GET can be used with or without --id flag (single product or every one respectively)

import express from 'express'
import axios from 'axios'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

const args = yargs(hideBin(process.argv)).argv
console.log(args)
const app = express()
const baseRoute = 'http://localhost:8080'

app.use(express.json()) // allow JSON handling as objects
app.use(express.urlencoded({extended: true})) // allow URL handling as objects

app.listen(8081, () => {
  console.log('http client is on')
})

// Test products

const testProduct = {
  name: 'testProductAxios',
  image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToBlpAmy4uFTA3eKRGtRcurd25BndL03QJ8TTfyvc&s',
  price: 500
}

const testProductUpdated = {
  name: 'testProductAxiosUpdated',
  image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToBlpAmy4uFTA3eKRGtRcurd25BndL03QJ8TTfyvc&s',
  price: 600
}

// Actions
const getProducts = async (id) => {
  try {
    const response = id ? await axios.get(`${baseRoute}/api/products/${id}`) : await axios.get(`${baseRoute}/api/products`)
    console.log(response.data)
  } catch (error) {
    console.log(error)
  }
}

const postProduct = async (prod) => {
  try {
    const response = await axios.post(`${baseRoute}/api/products`, prod)
    console.log(response.data)
  } catch (error) {
    console.log(error)
  }
}

const updateProduct = async (id, prod) => {
  try {
    const response = await axios.put(`${baseRoute}/api/products/${id}`, prod)
    console.log(response.data)
  } catch (error) {
    console.log(error)
  }
} 

const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${baseRoute}/api/products/${id}`)
    console.log(response.data)
  } catch (error) {
    console.log(error)
  }
} 

switch (args.action) {
  case 'GET':
    await getProducts(args.id)
    break
  case 'POST':
    await postProduct(testProduct)
    break
  case 'PUT':
    args.id ? await updateProduct(args.id, testProductUpdated) : console.log('Please pass the id on exec using --id flag')
    break
  case 'DELETE':
    args.id ? await deleteProduct(args.id) : console.log('Please pass the id on exec using --id flag')
    break
  default:
    await getProducts(args.id)
    break
}

process.exit()