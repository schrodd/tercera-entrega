import mongoose from "mongoose";
import { logger } from "../../lib/logger.js";
import { MONGODB_URL } from "../../config/config.js"

export default class ClientMongo {
  constructor() {
    this.client = mongoose;
  }
  async connect() {
    try {
      this.client.set("strictQuery", true);
      await this.client.connect(
        MONGODB_URL,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (e) => e && logger.error("Hubo un error conectandose a la BDD")
      )
    } catch (error) {
      logger.error(error)
    }
  }
}
