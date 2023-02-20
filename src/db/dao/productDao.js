import MongoManager from '../managers/mongoManager.js'
import joi from 'joi'

export class ProductDao extends MongoManager {
  constructor(model){
    super(model)
  }
  validate(data){
    const schema = joi.object({
      name: joi.string().required(),
      image: joi.string().required(),
      price: joi.number().required(),
    })
    return schema.validate(data)
  }
  // specific methods for user management
}