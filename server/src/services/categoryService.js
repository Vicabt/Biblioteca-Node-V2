const BaseService = require('./BaseService');
const { TABLE_NAME } = require('../models/Category');

class CategoryService extends BaseService {
    constructor() {
        super(TABLE_NAME);
    }

    // Wrapper methods to maintain existing API
    async createCategory(data) {
        return this.create(data);
    }

    async getCategories() {
        return this.getAll();
    }

    async getCategoryById(id) {
        return this.getById(id);
    }

    async updateCategory(id, data) {
        return this.update(id, data);
    }

    async deleteCategory(id) {
        return this.delete(id);
    }
    
    async toggleCategoryState(id) {
        return this.toggleState(id);
    }
}

module.exports = new CategoryService();