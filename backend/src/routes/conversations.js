
import { Router } from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";
import requireAuth from "../middleware/requireAuth.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const router = Router();

// GET /api/conversations
// Return conversations belonging to the authenticated user.
router.get("/", requireAuth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    })
      .sort({ updatedAt: -1, _id: -1 })
      .lean();

    const otherUserIds = conversations
      .map((conversation) =>
        conversation.participants.find(
          (id) => id.toString() !== req.userId
        )
      )
      .filter(Boolean);

    const users = await User.find({
      _id: { $in: otherUserIds },
    })
      .select("_id username email preferredLanguage")
      .lean();

    const usersById = new Map(
      users.map((user) => [user._id.toString(), user])
    );

    const conversationIds = conversations.map((c) => c._id);

    const messages = await Message.find({
      conversationId: { $in: conversationIds },
    })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    const latestMessageByConversation = new Map();

    for (const message of messages) {
      const conversationId = message.conversationId.toString();

      if (!latestMessageByConversation.has(conversationId)) {
        latestMessageByConversation.set(conversationId, message);
      }
    }

    return res.status(200).json({
      conversations: conversations.map((conversation) => {
        const id = conversation._id.toString();
        const otherUserId = conversation.participants.find(
          (participantId) =>
            participantId.toString() !== req.userId
        );
        const participant = otherUserId
          ? usersById.get(otherUserId.toString())
          : null;
        const lastMessage = latestMessageByConversation.get(id);

        return {
          id,
          participants: conversation.participants,
          createdBy: conversation.createdBy,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          participant: participant
            ? {
                id: participant._id.toString(),
                username: participant.username,
                email: participant.email,
                preferredLanguage: participant.preferredLanguage || "en",
              }
            : null,
          lastMessage: lastMessage
            ? {
                id: lastMessage._id.toString(),
                text: lastMessage.originalText,
                originalText: lastMessage.originalText,
                sourceLanguage: lastMessage.sourceLanguage,
                senderId: lastMessage.senderId.toString(),
                createdAt: lastMessage.createdAt,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("Conversation retrieval failed:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve conversations",
    });
  }
});

// POST /api/conversations
router.post(
  "/",
  requireAuth,
  body("participantId")
    .isString()
    .withMessage("Participant ID must be a string")
    .bail()
    .custom((id) => mongoose.isValidObjectId(id))
    .withMessage("Invalid participant ID"),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const currentUserId = req.userId;
      const participantId = req.body.participantId;

      if (currentUserId === participantId) {
        return res.status(400).json({
          message: "You cannot create a conversation with yourself",
        });
      }

      const participant = await User.findById(participantId).select("_id");

      if (!participant) {
        return res.status(404).json({
          message: "Participant not found",
        });
      }

      let conversation = await Conversation.findOne({
        participants: { $all: [currentUserId, participantId], $size: 2 },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [currentUserId, participantId],
          createdBy: currentUserId,
        });
      }

      return res.status(200).json({
        conversation: {
          id: conversation._id,
          participants: conversation.participants,
          createdBy: conversation.createdBy,
          createdAt: conversation.createdAt,
        },
      });
    } catch (error) {
      console.error("Conversation creation failed:", error.message);

      return res.status(500).json({
        message: "Unable to create conversation",
      });
    }
  }
);

export default router;
