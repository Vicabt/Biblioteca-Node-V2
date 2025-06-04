const BaseService = require('./BaseService');
const { TABLE_NAME } = require('../models/Copy');
const supabase = require('../config/supabase');

class CopyService extends BaseService {
    constructor() {
        super(TABLE_NAME);
    }

    // Wrapper methods to maintain existing API
    async createCopy(data) {
        return this.create(data);
    }

    async getCopies() {
        return this.getAll();
    }

    async getCopyById(id) {
        return this.getById(id);
    }

    async updateCopy(id, data) {
        return this.update(id, data);
    }

    async deleteCopy(id) {
        return this.delete(id);
    }
    
    // Copy-specific methods
    async getCopiesByBook(bookId) {
        try {
            const { data: copies, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('book_id', bookId)
                .order('code', { ascending: true });
                
            if (error) throw new Error(error.message);
            return copies;
        } catch (error) {
            throw new Error(`Error fetching copies by book: ${error.message}`);
        }
    }

    async changeState(id, state) {
        try {
            const { data: copy, error } = await supabase
                .from(this.tableName)
                .update({ state })
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw new Error(error.message);
            if (!copy) throw new Error('Copy not found');
            
            return copy;
        } catch (error) {
            throw new Error(`Error changing copy state: ${error.message}`);
        }
    }
}

module.exports = new CopyService();
