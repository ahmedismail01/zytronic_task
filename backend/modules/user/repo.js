const User = require("./model");
class UserRepo {
  constructor() {
    this.model = User;
  }
  async create(user) {
    return await this.model.create(user);
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findOne(query) {
    return await this.model.findOne(query);
  }

  async update(id, user) {
    return await this.model.findByIdAndUpdate(id, user);
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }
  async findAll() {
    return await this.model.find();
  }
}

module.exports = new UserRepo();
