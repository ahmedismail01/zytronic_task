const express = require("express");
const multer = require("multer");
const path = require("path");
const { authenticateToken } = require("./auth.routes.js");
const responseService = require("../utils/handleResponse.js");
const upload = require("../config/multer.js");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return responseService.failure(res, "No file uploaded", null, 400);
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      responseService.success(
        res,
        "File uploaded successfully",
        { url: imageUrl },
        201
      );
    } catch (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return responseService.failure(
            res,
            "File size must be less than 5MB",
            null,
            400
          );
        }
      }
      responseService.failure(res, "Failed to upload file", error.message, 500);
    }
  }
);

router.post(
  "/voice",
  authenticateToken,
  upload.single("audio"),
  async (req, res) => {
    try {
      if (!req.file) {
        return responseService.failure(res, "No voice note uploaded", null, 400);
      }

      const audioUrl = `/uploads/${req.file.filename}`;
      responseService.success(
        res,
        "Voice note uploaded",
        { url: audioUrl },
        201
      );
    } catch (err) {
      responseService.failure(
        res,
        "Failed to upload voice note",
        err.message,
        500
      );
    }
  }
);

module.exports = router;
