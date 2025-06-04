/**
 * Database utility functions to eliminate duplication in database operations
 * Provides common patterns for Supabase operations
 */

const supabase = require('../config/supabase');

/**
 * Generic function to get all records from a table with optional filtering
 * @param {string} tableName - Table name
 * @param {string} selectFields - Fields to select (default: '*')
 * @param {Object} filters - Optional filters { column: value }
 * @param {string} orderBy - Order by column (default: 'created_at')
 * @param {boolean} ascending - Sort order (default: false)
 * @returns {Promise<Object>} { data, error }
 */
const getAllRecords = async (tableName, selectFields = '*', filters = null, orderBy = 'created_at', ascending = false) => {
    try {
        let query = supabase.from(tableName).select(selectFields);
        
        // Apply filters if provided
        if (filters) {
            Object.entries(filters).forEach(([column, value]) => {
                if (value !== undefined && value !== null) {
                    query = query.eq(column, value);
                }
            });
        }
        
        // Apply ordering
        query = query.order(orderBy, { ascending });
        
        const { data, error } = await query;
        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Generic function to get a single record by ID
 * @param {string} tableName - Table name
 * @param {string|number} id - Record ID
 * @param {string} selectFields - Fields to select (default: '*')
 * @param {string} idColumn - ID column name (default: 'id')
 * @returns {Promise<Object>} { data, error }
 */
const getRecordById = async (tableName, id, selectFields = '*', idColumn = 'id') => {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select(selectFields)
            .eq(idColumn, id)
            .single();
        
        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Generic function to create a new record
 * @param {string} tableName - Table name
 * @param {Object} recordData - Data to insert
 * @param {string} selectFields - Fields to select after insert (default: '*')
 * @returns {Promise<Object>} { data, error }
 */
const createRecord = async (tableName, recordData, selectFields = '*') => {
    try {
        const dataWithTimestamp = {
            ...recordData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from(tableName)
            .insert(dataWithTimestamp)
            .select(selectFields)
            .single();
        
        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Generic function to update a record by ID
 * @param {string} tableName - Table name
 * @param {string|number} id - Record ID
 * @param {Object} updateData - Data to update
 * @param {string} selectFields - Fields to select after update (default: '*')
 * @param {string} idColumn - ID column name (default: 'id')
 * @returns {Promise<Object>} { data, error }
 */
const updateRecord = async (tableName, id, updateData, selectFields = '*', idColumn = 'id') => {
    try {
        const dataWithTimestamp = {
            ...updateData,
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from(tableName)
            .update(dataWithTimestamp)
            .eq(idColumn, id)
            .select(selectFields)
            .single();
        
        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Generic function to delete a record by ID (soft delete by setting state to 0)
 * @param {string} tableName - Table name
 * @param {string|number} id - Record ID
 * @param {boolean} hardDelete - If true, permanently delete; if false, soft delete (default: false)
 * @param {string} idColumn - ID column name (default: 'id')
 * @returns {Promise<Object>} { data, error }
 */
const deleteRecord = async (tableName, id, hardDelete = false, idColumn = 'id') => {
    try {
        if (hardDelete) {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq(idColumn, id);
            
            return { data: null, error };
        } else {
            // Soft delete - set state to 0
            const { data, error } = await updateRecord(tableName, id, { state: 0 });
            return { data, error };
        }
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Generic function to toggle a boolean field (typically 'state' or 'active')
 * @param {string} tableName - Table name
 * @param {string|number} id - Record ID
 * @param {string} field - Field to toggle (default: 'state')
 * @param {string} selectFields - Fields to select after update (default: '*')
 * @param {string} idColumn - ID column name (default: 'id')
 * @returns {Promise<Object>} { data, error }
 */
const toggleField = async (tableName, id, field = 'state', selectFields = '*', idColumn = 'id') => {
    try {
        // First get current value
        const { data: currentRecord, error: getError } = await getRecordById(tableName, id, field, idColumn);
        
        if (getError || !currentRecord) {
            return { data: null, error: getError || new Error('Record not found') };
        }
        
        // Toggle the field value (assumes 0/1 or true/false)
        const currentValue = currentRecord[field];
        const newValue = currentValue === 1 || currentValue === true ? 0 : 1;
        
        // Update with new value
        const { data, error } = await updateRecord(tableName, id, { [field]: newValue }, selectFields, idColumn);
        
        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Check if a record exists
 * @param {string} tableName - Table name
 * @param {Object} conditions - Conditions to check { column: value }
 * @returns {Promise<boolean>} True if record exists
 */
const recordExists = async (tableName, conditions) => {
    try {
        let query = supabase.from(tableName).select('id');
        
        Object.entries(conditions).forEach(([column, value]) => {
            query = query.eq(column, value);
        });
        
        const { data, error } = await query.single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
            throw error;
        }
        
        return !!data;
    } catch (error) {
        return false;
    }
};

/**
 * Get records with pagination
 * @param {string} tableName - Table name
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Records per page
 * @param {string} selectFields - Fields to select (default: '*')
 * @param {Object} filters - Optional filters { column: value }
 * @param {string} orderBy - Order by column (default: 'created_at')
 * @param {boolean} ascending - Sort order (default: false)
 * @returns {Promise<Object>} { data, error, count, totalPages }
 */
const getPaginatedRecords = async (tableName, page = 1, limit = 10, selectFields = '*', filters = null, orderBy = 'created_at', ascending = false) => {
    try {
        const offset = (page - 1) * limit;
        
        // Get total count
        let countQuery = supabase.from(tableName).select('*', { count: 'exact', head: true });
        
        // Apply filters to count query
        if (filters) {
            Object.entries(filters).forEach(([column, value]) => {
                if (value !== undefined && value !== null) {
                    countQuery = countQuery.eq(column, value);
                }
            });
        }
        
        const { count, error: countError } = await countQuery;
        
        if (countError) {
            return { data: null, error: countError, count: 0, totalPages: 0 };
        }
        
        // Get paginated data
        let dataQuery = supabase
            .from(tableName)
            .select(selectFields)
            .range(offset, offset + limit - 1)
            .order(orderBy, { ascending });
        
        // Apply filters to data query
        if (filters) {
            Object.entries(filters).forEach(([column, value]) => {
                if (value !== undefined && value !== null) {
                    dataQuery = dataQuery.eq(column, value);
                }
            });
        }
        
        const { data, error } = await dataQuery;
        
        const totalPages = Math.ceil(count / limit);
        
        return { data, error, count, totalPages };
    } catch (error) {
        return { data: null, error, count: 0, totalPages: 0 };
    }
};

/**
 * Batch update multiple records
 * @param {string} tableName - Table name
 * @param {Array} updates - Array of { id, data } objects
 * @param {string} idColumn - ID column name (default: 'id')
 * @returns {Promise<Object>} { success: boolean, results: Array, errors: Array }
 */
const batchUpdateRecords = async (tableName, updates, idColumn = 'id') => {
    const results = [];
    const errors = [];
    
    for (const update of updates) {
        try {
            const { data, error } = await updateRecord(tableName, update.id, update.data, '*', idColumn);
            
            if (error) {
                errors.push({ id: update.id, error });
            } else {
                results.push(data);
            }
        } catch (error) {
            errors.push({ id: update.id, error });
        }
    }
    
    return {
        success: errors.length === 0,
        results,
        errors
    };
};

module.exports = {
    getAllRecords,
    getRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
    toggleField,
    recordExists,
    getPaginatedRecords,
    batchUpdateRecords
};
