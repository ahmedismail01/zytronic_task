const Message = require("./model");

class messageRepo {
  constructor() {
    this.model = Message;
  }

  async create(message) {
    return await this.model.create(message);
  }
  async findAll() {
    return await this.model.find();
  }
  async findById(id) {
    return await this.model.findById(id);
  }
  async update(id, message) {
    return await this.model.findByIdAndUpdate(id, message);
  }
  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }
  async findMany(query) {
    return await this.model.find(query);
  }
}

module.exports = new messageRepo();
