function processMongoQuery(response) {
  const resUnparsed = JSON.stringify(response)
  return JSON.parse(resUnparsed)
}

class MongoCRUD {
  constructor (model) {
    this.model = model
  }
  find = async (filters) => {
    return processMongoQuery(await this.model.find(filters))
  }
  findOne = async (filters, callback) => {
    return processMongoQuery(await this.model.findOne(filters, callback))
  }
  create = async (element, callback) => {
    return await this.model.save(element, callback)
  }
  update = async (id, element) => {
    return await this.model.updateOne(id, element)
  }
  // delete is not neccesary right now
}

export default MongoCRUD