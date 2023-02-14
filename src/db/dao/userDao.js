import MongoManager from '../managers/mongoManager.js'

export class UserDao extends MongoManager {
  constructor(model){
    super(model)
  }
  // specific methods for user management
}