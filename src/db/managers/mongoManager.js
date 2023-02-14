function processMongoQuery(response) {
  const resUnparsed = JSON.stringify(response)
  return JSON.parse(resUnparsed)
}

class MongoManager {
  constructor (model) {
    this.model = model
  }
  find = async (filters) => {
    return processMongoQuery(await this.model.find(filters))
  }
  findOne = (filters, callback) => {
    return this.model.findOne(filters, callback)
  }
  create = async (element) => {
    const doc = new this.model(element)
    return await doc.save()
  }
  update = (id, element, callback) => {
    return this.model.updateOne(id, element, callback)
  }
  // delete is not neccesary right now
}

export default MongoManager