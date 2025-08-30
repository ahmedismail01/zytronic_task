class ResponseService {
  success = (res, message, data, status) => {
    return res.status(status).json({ success: true, message, data });
  };

  failure = (res, message, errors, status) => {
    return res.status(status).json({ success: false, message, errors });
  };
}

module.exports = new ResponseService();
