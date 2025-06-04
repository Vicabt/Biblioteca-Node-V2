const supabase = require('../config/supabase');

/**
 * Base service class that provides common CRUD operations for Supabase tables
 * Eliminates code duplication across AuthorService, CategoryService, and PublisherService
 */
class BaseService {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async getAll() {
        try {
            const { data: items, error } = await supabase
                .from(this.tableName)
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw new Error(error.message);
            return items;
        } catch (error) {
            throw new Error(`Error fetching ${this.tableName}: ${error.message}`);
        }
    }

    async getById(id) {
        try {
            const { data: item, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();
                
            if (error) throw new Error(error.message);
            if (!item) throw new Error(`${this.tableName.slice(0, -1)} not found`);
            
            return item;
        } catch (error) {
            throw new Error(`Error fetching ${this.tableName.slice(0, -1)}: ${error.message}`);
        }
    }

    async create(data) {
        try {
            // Add timestamps
            const itemData = {
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data: item, error } = await supabase
                .from(this.tableName)
                .insert(itemData)
                .select()
                .single();
                
            if (error) throw new Error(error.message);
            return item;
        } catch (error) {
            throw new Error(`Error creating ${this.tableName.slice(0, -1)}: ${error.message}`);
        }
    }

    async update(id, data) {
        try {
            // Add updated timestamp
            const itemData = {
                ...data,
                updated_at: new Date().toISOString()
            };
            
            const { data: item, error } = await supabase
                .from(this.tableName)
                .update(itemData)
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw new Error(error.message);
            if (!item) throw new Error(`${this.tableName.slice(0, -1)} not found`);
            
            return item;
        } catch (error) {
            throw new Error(`Error updating ${this.tableName.slice(0, -1)}: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const { data: item, error } = await supabase
                .from(this.tableName)
                .delete()
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw new Error(error.message);
            if (!item) throw new Error(`${this.tableName.slice(0, -1)} not found`);
            
            return item;
        } catch (error) {
            throw new Error(`Error deleting ${this.tableName.slice(0, -1)}: ${error.message}`);
        }
    }

    async toggleState(id) {
        try {
            // First get the current item
            const { data: item, error: fetchError } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();
                
            if (fetchError) throw new Error(fetchError.message);
            if (!item) throw new Error(`${this.tableName.slice(0, -1)} not found`);
            
            // Toggle the state
            const newState = item.state === 1 ? 0 : 1;
            
            // Update the item
            const { data: updatedItem, error: updateError } = await supabase
                .from(this.tableName)
                .update({ 
                    state: newState,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();
                
            if (updateError) throw new Error(updateError.message);
            
            return updatedItem;
        } catch (error) {
            throw new Error(`Error toggling ${this.tableName.slice(0, -1)} state: ${error.message}`);
        }
    }
}

module.exports = BaseService;
