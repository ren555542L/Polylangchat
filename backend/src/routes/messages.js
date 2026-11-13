
import { Router } from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";
import requireAuth from "../middleware/requireAuth.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import MessageTranslation from "../models/MessageTranslation.js";

const router = Router();

const supportedLanguages = [
  "en", "hi", "bn", "ta", "te",
  "mr", "gu", "kn", "ml", "pa",
  "hi-Latn",
];


router.get(
  "/:conversationId",
  requireAuth,
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    try {
      const conversation = await Conversation.findOne({
        _id: req.params.conversationId,
        participants: req.userId,
      }).select("_id");

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found",
        });
      }

      const messages = await Message.find({
        conversationId: conversation._id,
      })
        .sort({ createdAt: 1, _id: 1 })
        .limit(100)
        .lean();

      const messageIds = messages.map((message) => message._id);

      const translations = await MessageTranslation.find({
        messageId: { $in: messageIds },
        recipientId: req.userId,
      })
        .select("messageId targetLanguage translatedText translationStatus modelName")
        .lean();

      const translationsByMessageId = new Map(
        translations.map((translation) => [
          translation.messageId.toString(),
          {
            targetLanguage: translation.targetLanguage,
            translatedText: translation.translatedText,
            translationStatus: translation.translationStatus,
            modelName: translation.modelName,
          },
        ])
      );

      const messagesWithTranslations = messages.map((message) => ({
        ...message,
        translation:
          translationsByMessageId.get(message._id.toString()) ?? null,
      }));

      return res.status(200).json({
        messages: messagesWithTranslations,
      });
    } catch (error) {
      console.error("Message retrieval failed:", error.message);

      return res.status(500).json({
        message: "Unable to retrieve messages",
      });
    }
  }
);

router.post(
  "/:conversationId",
  requireAuth,
  body("originalText")
    .isString()
    .withMessage("Message text must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Message text cannot be empty")
    .bail()
    .isLength({ max: 5000 })
    .withMessage("Message cannot exceed 5000 characters"),
  body("sourceLanguage")
    .isString()
    .withMessage("Source language must be a string")
    .bail()
    .isIn(supportedLanguages)
    .withMessage("Unsupported source language"),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    try {
      const conversation = await Conversation.findOne({
        _id: req.params.conversationId,
        participants: req.userId,
      }).select("_id");

      if (!conversation) {
        // Do not reveal whether another user's conversation exists.
        return res.status(404).json({
          message: "Conversation not found",
        });
      }

      const message = await Message.create({
        conversationId: conversation._id,
        senderId: req.userId,
        originalText: req.body.originalText.trim(),
        sourceLanguage: req.body.sourceLanguage,
      });

      return res.status(201).json({
        message: {
          id: message._id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          originalText: message.originalText,
          sourceLanguage: message.sourceLanguage,
          createdAt: message.createdAt,
        },
      });
    } catch (error) {
      console.error("Message creation failed:", error.message);

      return res.status(500).json({
        message: "Unable to send message",
      });
    }
  }
);

export default router;
