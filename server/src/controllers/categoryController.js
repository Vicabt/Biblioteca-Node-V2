const categoryService = require('../services/categoryService');
const activityService = require('../services/ActivityService');
const { sendSuccess, sendError, sendNotFound, handleSupabaseError, asyncHandler, HTTP_STATUS } = require('../utils/responseHelper');

class CategoryController {
    getAllCategories = asyncHandler(async (req, res) => {
        const categories = await categoryService.getCategories();
        sendSuccess(res, categories, HTTP_STATUS.OK, 'Categories retrieved successfully');
    });

    getCategoryById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const category = await categoryService.getCategoryById(id);
            sendSuccess(res, category, HTTP_STATUS.OK, 'Category retrieved successfully');
        } catch (error) {
            if (error.message.includes('not found')) {
                return sendNotFound(res, 'Category not found');
            }
            throw error;
        }
    });

    createCategory = asyncHandler(async (req, res) => {
        const categoryData = req.body;
        const newCategory = await categoryService.createCategory(categoryData);
        // Log activity using ActivityService
        await activityService.logCreate('category', newCategory);
        sendSuccess(res, newCategory, HTTP_STATUS.CREATED, 'Category created successfully');
    });

    updateCategory = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const categoryData = req.body;
        try {
            const updatedCategory = await categoryService.updateCategory(id, categoryData);
            // Log activity using ActivityService
            await activityService.logUpdate('category', updatedCategory);
            sendSuccess(res, updatedCategory, HTTP_STATUS.OK, 'Category updated successfully');
        } catch (error) {
            if (error.message.includes('not found')) {
                return sendNotFound(res, 'Category not found');
            }
            throw error;
        }
    });

    deleteCategory = asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const deletedCategory = await categoryService.deleteCategory(id);
            // Log activity using ActivityService
            await activityService.logDelete('category', deletedCategory);
            sendSuccess(res, null, HTTP_STATUS.NO_CONTENT, 'Category deleted successfully');
        } catch (error) {
            if (error.message.includes('not found')) {
                return sendNotFound(res, 'Category not found');
            }
            throw error;
        }
    });
    
    toggleCategoryState = asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const updatedCategory = await categoryService.toggleCategoryState(id);
            sendSuccess(res, updatedCategory, HTTP_STATUS.OK, 'Category state toggled successfully');
        } catch (error) {
            if (error.message.includes('not found')) {
                return sendNotFound(res, 'Category not found');
            }
            throw error;
        }
    });
}

module.exports = new CategoryController();