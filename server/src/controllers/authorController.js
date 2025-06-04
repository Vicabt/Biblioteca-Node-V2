// server/src/controllers/authorController.js

const authorService = require('../services/authorService');
const activityService = require('../services/ActivityService');
const { sendSuccess, sendError, sendNotFound, handleSupabaseError, asyncHandler, HTTP_STATUS } = require('../utils/responseHelper');

const getAllAuthors = asyncHandler(async (req, res) => {
    const authors = await authorService.getAuthors();
    sendSuccess(res, authors, HTTP_STATUS.OK, 'Authors retrieved successfully');
});

const getAuthorById = asyncHandler(async (req, res) => {
    try {
        const author = await authorService.getAuthorById(req.params.id);
        sendSuccess(res, author, HTTP_STATUS.OK, 'Author retrieved successfully');
    } catch (error) {
        if (error.message.includes('not found')) {
            return sendNotFound(res, 'Author not found');
        }
        throw error;
    }
});

const createAuthor = asyncHandler(async (req, res) => {
    const newAuthor = await authorService.createAuthor(req.body);
    // Log activity using ActivityService
    await activityService.logCreate('author', newAuthor);
    sendSuccess(res, newAuthor, HTTP_STATUS.CREATED, 'Author created successfully');
});

const updateAuthor = asyncHandler(async (req, res) => {
    try {
        const updatedAuthor = await authorService.updateAuthor(req.params.id, req.body);
        // Log activity using ActivityService
        await activityService.logUpdate('author', updatedAuthor);
        sendSuccess(res, updatedAuthor, HTTP_STATUS.OK, 'Author updated successfully');
    } catch (error) {
        if (error.message.includes('not found')) {
            return sendNotFound(res, 'Author not found');
        }
        throw error;
    }
});

const deleteAuthor = asyncHandler(async (req, res) => {
    try {
        const deletedAuthor = await authorService.deleteAuthor(req.params.id);
        // Log activity using ActivityService
        await activityService.logDelete('author', deletedAuthor);
        sendSuccess(res, null, HTTP_STATUS.NO_CONTENT, 'Author deleted successfully');
    } catch (error) {
        if (error.message.includes('not found')) {
            return sendNotFound(res, 'Author not found');
        }
        throw error;
    }
});

const toggleAuthorState = asyncHandler(async (req, res) => {
    try {
        const updatedAuthor = await authorService.toggleAuthorState(req.params.id);
        // Log activity using ActivityService
        await activityService.logStateToggle('author', updatedAuthor, updatedAuthor.state);
        sendSuccess(res, updatedAuthor, HTTP_STATUS.OK, 'Author state toggled successfully');
    } catch (error) {
        if (error.message.includes('not found')) {
            return sendNotFound(res, 'Author not found');
        }
        throw error;
    }
});

module.exports = {
    getAllAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor,
    toggleAuthorState
};