// server/src/controllers/publisherController.js

const PublisherService = require('../services/publisherService');
const activityService = require('../services/ActivityService');
const { sendSuccess, sendError, sendNotFound, handleSupabaseError, asyncHandler, HTTP_STATUS } = require('../utils/responseHelper');

class PublisherController {
    getPublishers = asyncHandler(async (req, res) => {
        const publishers = await PublisherService.getPublishers();
        sendSuccess(res, publishers, HTTP_STATUS.OK, 'Publishers retrieved successfully');
    });

    getPublisherById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const publisher = await PublisherService.getPublisherById(id);
            sendSuccess(res, publisher, HTTP_STATUS.OK, 'Publisher retrieved successfully');
        } catch (error) {
            if (error.message === 'Publisher not found') {
                return sendNotFound(res, 'Publisher not found');
            }
            throw error;
        }
    });

    createPublisher = asyncHandler(async (req, res) => {
        const publisherData = req.body;
        const newPublisher = await PublisherService.createPublisher(publisherData);
        // Log activity using ActivityService
        await activityService.logCreate('publisher', newPublisher);
        sendSuccess(res, newPublisher, HTTP_STATUS.CREATED, 'Publisher created successfully');
    });

    updatePublisher = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const publisherData = req.body;
        try {
            const updatedPublisher = await PublisherService.updatePublisher(id, publisherData);
            // Log activity using ActivityService
            await activityService.logUpdate('publisher', updatedPublisher);
            sendSuccess(res, updatedPublisher, HTTP_STATUS.OK, 'Publisher updated successfully');
        } catch (error) {
            if (error.message === 'Publisher not found') {
                return sendNotFound(res, 'Publisher not found');
            }
            throw error;
        }
    });

    deletePublisher = asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const deletedPublisher = await PublisherService.deletePublisher(id);
            // Log activity using ActivityService
            await activityService.logDelete('publisher', deletedPublisher);
            sendSuccess(res, null, HTTP_STATUS.NO_CONTENT, 'Publisher deleted successfully');
        } catch (error) {
            if (error.message === 'Publisher not found') {
                return sendNotFound(res, 'Publisher not found');
            }
            throw error;
        }
    });
    
    togglePublisherState = asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const updatedPublisher = await PublisherService.togglePublisherState(id);
            sendSuccess(res, updatedPublisher, HTTP_STATUS.OK, 'Publisher state toggled successfully');
        } catch (error) {
            if (error.message === 'Publisher not found') {
                return sendNotFound(res, 'Publisher not found');
            }
            throw error;
        }
    });
}

module.exports = new PublisherController();