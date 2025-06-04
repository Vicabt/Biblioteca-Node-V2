const BaseService = require('./BaseService');
const { TABLE_NAME } = require('../models/Author');

class AuthorService extends BaseService {
    constructor() {
        super(TABLE_NAME);
    }

    // Wrapper methods to maintain existing API
    async createAuthor(data) {
        return this.create(data);
    }

    async getAuthors() {
        return this.getAll();
    }

    async getAuthorById(id) {
        return this.getById(id);
    }

    async updateAuthor(id, data) {
        return this.update(id, data);
    }

    async deleteAuthor(id) {
        return this.delete(id);
    }
    
    async toggleAuthorState(id) {
        return this.toggleState(id);
    }
}

module.exports = new AuthorService();