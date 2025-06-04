const supabase = require('../config/supabase');

/**
 * Activity Service - Centralized activity logging
 * Eliminates duplicated activity logging code across controllers
 */
class ActivityService {
    /**
     * Log an activity to the database
     * @param {string} type - Type of activity (create, update, delete, activate, deactivate, etc.)
     * @param {string} entity - Entity type (author, category, publisher, book, etc.)
     * @param {string|number} entityId - ID of the entity
     * @param {string} description - Human-readable description of the activity
     * @param {Object} additionalData - Optional additional data to log
     */
    async logActivity(type, entity, entityId, description, additionalData = {}) {
        try {
            const activityData = {
                type,
                entity,
                entity_id: entityId,
                description,
                created_at: new Date().toISOString(),
                ...additionalData
            };

            const { data, error } = await supabase
                .from('activities')
                .insert(activityData)
                .select()
                .single();

            if (error) {
                console.error('Error logging activity:', error);
                // Don't throw error to avoid breaking main operations
            }

            return data;
        } catch (error) {
            console.error('Error in ActivityService.logActivity:', error);
            // Don't throw error to avoid breaking main operations
        }
    }

    /**
     * Log creation activity
     * @param {string} entity - Entity type
     * @param {Object} item - Created item object
     * @param {string} nameField - Field name to use for the item name (default: 'name')
     */
    async logCreate(entity, item, nameField = 'name') {
        const itemName = item[nameField] || item.title || item.id;
        const description = `Se creó ${this.getEntityArticle(entity)} ${entity} "${itemName}"`;
        return this.logActivity('create', entity, item.id, description);
    }

    /**
     * Log update activity
     * @param {string} entity - Entity type
     * @param {Object} item - Updated item object
     * @param {string} nameField - Field name to use for the item name (default: 'name')
     */
    async logUpdate(entity, item, nameField = 'name') {
        const itemName = item[nameField] || item.title || item.id;
        const description = `Se actualizó ${this.getEntityArticle(entity)} ${entity} "${itemName}"`;
        return this.logActivity('update', entity, item.id, description);
    }

    /**
     * Log delete activity
     * @param {string} entity - Entity type
     * @param {Object} item - Deleted item object
     * @param {string} nameField - Field name to use for the item name (default: 'name')
     */
    async logDelete(entity, item, nameField = 'name') {
        const itemName = item[nameField] || item.title || item.id;
        const description = `Se eliminó ${this.getEntityArticle(entity)} ${entity} "${itemName}"`;
        return this.logActivity('delete', entity, item.id, description);
    }

    /**
     * Log deactivate activity
     * @param {string} entity - Entity type
     * @param {Object} item - Deactivated item object
     * @param {string} nameField - Field name to use for the item name (default: 'name')
     */
    async logDeactivate(entity, item, nameField = 'name') {
        const itemName = item[nameField] || item.title || item.id;
        const description = `Se desactivó ${this.getEntityArticle(entity)} ${entity} "${itemName}"`;
        return this.logActivity('deactivate', entity, item.id, description);
    }

    /**
     * Log activate/reactivate activity
     * @param {string} entity - Entity type
     * @param {Object} item - Activated item object
     * @param {string} nameField - Field name to use for the item name (default: 'name')
     */
    async logReactivate(entity, item, nameField = 'name') {
        const itemName = item[nameField] || item.title || item.id;
        const description = `Se reactivó ${this.getEntityArticle(entity)} ${entity} "${itemName}"`;
        return this.logActivity('reactivate', entity, item.id, description);
    }

    /**
     * Get appropriate Spanish article for entity
     * @param {string} entity - Entity type
     * @returns {string} - Appropriate article (el/la)
     */
    getEntityArticle(entity) {
        const femaleEntities = ['category', 'categoría', 'editorial', 'publisher'];
        return femaleEntities.includes(entity.toLowerCase()) ? 'la' : 'el';
    }

    /**
     * Convenient method for state toggle logging
     * @param {string} entity - Entity type
     * @param {Object} item - Item object
     * @param {boolean|number} newState - New state (1/true for active, 0/false for inactive)
     * @param {string} nameField - Field name to use for the item name (default: 'name')
     */
    async logStateToggle(entity, item, newState, nameField = 'name') {
        const isActive = newState === 1 || newState === true;
        if (isActive) {
            return this.logReactivate(entity, item, nameField);
        } else {
            return this.logDeactivate(entity, item, nameField);
        }
    }
}

module.exports = new ActivityService();
