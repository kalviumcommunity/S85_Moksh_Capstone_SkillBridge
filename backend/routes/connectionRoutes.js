const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getConnections,
  getConnectionRequests,
  sendConnectionRequest,
  updateConnectionRequest,
  getSuggestions,
  getConnectionStatus
} = require('../controllers/connectionController');

// All routes require authentication
router.use(auth);

// @route GET /api/connections/status/:userId
router.get('/status/:userId', getConnectionStatus);

// @route GET /api/connections
router.get('/', getConnections);

// @route GET /api/connections/requests
router.get('/requests', getConnectionRequests);

// @route GET /api/connections/suggestions
router.get('/suggestions', getSuggestions);

// @route POST /api/connections/request
router.post('/request', sendConnectionRequest);

// @route PUT /api/connections/:id
router.put('/:id', updateConnectionRequest);

module.exports = router;