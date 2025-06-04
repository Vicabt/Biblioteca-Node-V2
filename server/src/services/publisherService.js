const BaseService = require('./BaseService');
const { TABLE_NAME } = require('../models/Publisher');

class PublisherService extends BaseService {
    constructor() {
        super(TABLE_NAME);
    }

    // Wrapper methods to maintain existing API
    async createPublisher(data) {
        return this.create(data);
    }

    async getPublishers() {
        return this.getAll();
    }

    async getPublisherById(id) {
        return this.getById(id);
    }

    async updatePublisher(id, data) {
        return this.update(id, data);
    }

    async deletePublisher(id) {
        return this.delete(id);
    }
    
    async togglePublisherState(id) {
        return this.toggleState(id);
    }
}

module.exports = new PublisherService();