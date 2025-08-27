const express = require('express');
const { router: authRouter } = require('./auth.routes');
const messageRouter = require('./message.routes');
const responseService = require('../utils/handleResponse');

const router = express.Router();

router.use('/auth', authRouter);

router.use('/messages', messageRouter);

router.get('/health', (req, res) => {
  responseService.success(res, "Server is running", {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, 200);
});

module.exports = router;
