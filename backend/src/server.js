import "./config/dns.js";
import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import socketAuth from "./middleware/socketAuth.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";
import mongoose from "mongoose";
import User from "./models/User.js";
import MessageTranslation from "./models/MessageTranslation.js";
import { translateText } from "./services/translationService.js";

const port = Number(process.env.PORT || 5000);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.use(socketAuth);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.join(`user:${socket.data.userId}`);

  socket.on("message:send", async (data, callback) => {
    const respond = (result) => {
      if (typeof callback === "function") callback(result);
    };

    // ── DIAGNOSTIC LOG ────────────────────────────────────────────────
    console.log("[message:send] RECEIVED", {
      socketId: socket.id,
      userId: socket.data.userId,
      conversationId: data?.conversationId,
      text: data?.originalText,
      sourceLanguage: data?.sourceLanguage,
      timestamp: new Date().toISOString(),
    });
    // ──────────────────────────────────────────────────────────────────

    try {
      const supportedLanguages = [
        "en",
        "hi",
        "bn",
        "ta",
        "te",
        "mr",
        "gu",
        "kn",
        "ml",
        "pa",
        "hi-Latn",
      ];

      if (
        !data ||
        typeof data.conversationId !== "string" ||
        !mongoose.isValidObjectId(data.conversationId) ||
        typeof data.originalText !== "string" ||
        !data.originalText.trim() ||
        data.originalText.trim().length > 5000 ||
        !supportedLanguages.includes(data.sourceLanguage)
      ) {
        return respond({ ok: false, error: "Invalid message data" });
      }

      const conversation = await Conversation.findOne({
        _id: data.conversationId,
        participants: socket.data.userId,
      }).select("_id participants");

      if (!conversation) {
        return respond({
          ok: false,
          error: "Conversation not found or access denied",
        });
      }

      const message = await Message.create({
        conversationId: conversation._id,
        senderId: socket.data.userId,
        originalText: data.originalText.trim(),
        sourceLanguage: data.sourceLanguage,
      });

      const payload = {
        id: message._id.toString(),
        conversationId: message.conversationId.toString(),
        senderId: message.senderId.toString(),
        originalText: message.originalText,
        sourceLanguage: message.sourceLanguage,
        createdAt: message.createdAt,
      };

      // Broadcast to every socket in the room EXCEPT the sender.
      // The sender already receives the full confirmed message via the
      // acknowledgement callback (respond below), so broadcasting back to
      // them is redundant and forces the frontend to filter its own echoes.
      // ── DIAGNOSTIC LOG ────────────────────────────────────────────────
      const roomName = `conversation:${data.conversationId}`;
      const roomSockets = io.sockets.adapter.rooms.get(roomName);
      console.log("[message:send] Broadcasting message:new", {
        messageId: payload.id,
        senderId: payload.senderId,
        room: roomName,
        socketsInRoom: roomSockets ? [...roomSockets] : [],
        senderSocketId: socket.id,
      });
      // ──────────────────────────────────────────────────────────────────
      socket.to(`conversation:${data.conversationId}`).emit("message:new", payload);
      respond({ ok: true, message: payload });

      // Continue translation without delaying the original delivery.
      void (async () => {
        try {
          const recipientId = conversation.participants.find(
            (id) => id.toString() !== socket.data.userId,
          );

          if (!recipientId) return;

          const recipient = await User.findById(recipientId)
            .select("preferredLanguage")
            .lean();

          if (!recipient) return;

          const languageCodes = {
            en: "eng_Latn",
            hi: "hin_Deva",
            bn: "ben_Beng",
            ta: "tam_Taml",
            te: "tel_Telu",
            mr: "mar_Deva",
            gu: "guj_Gujr",
            kn: "kan_Knda",
            ml: "mal_Mlym",
            pa: "pan_Guru",
            "hi-Latn": "hin_Latn",
          };

          const sourceLanguage = languageCodes[message.sourceLanguage];
          const targetLanguage = languageCodes[recipient.preferredLanguage];

          if (!sourceLanguage || !targetLanguage) return;

          // Avoid unnecessary translation when both languages are identical.
          if (sourceLanguage === targetLanguage) {
            const translation = await MessageTranslation.findOneAndUpdate(
              {
                messageId: message._id,
                recipientId,
                targetLanguage: recipient.preferredLanguage,
              },
              {
                $set: {
                  translatedText: message.originalText,
                  translationStatus: "completed",
                  modelName: "identity",
                },
              },
              { upsert: true, new: true, runValidators: true },
            );

            io.to(`user:${recipientId}`).emit("message:translation", {
              messageId: message._id.toString(),
              recipientId: recipientId.toString(),
              targetLanguage: recipient.preferredLanguage,
              translatedText: translation.translatedText,
              translationStatus: "completed",
            });

            return;
          }

          const result = await translateText({
            text: message.originalText,
            sourceLanguage,
            targetLanguage,
          });

          const translation = await MessageTranslation.findOneAndUpdate(
            {
              messageId: message._id,
              recipientId,
              targetLanguage: recipient.preferredLanguage,
            },
            {
              $set: {
                translatedText: result.translated_text,
                translationStatus: "completed",
                modelName: "ai4bharat/indictrans2-en-indic-dist-200M",
              },
            },
            { upsert: true, new: true, runValidators: true },
          );

          io.to(`user:${recipientId}`).emit("message:translation", {
            messageId: message._id.toString(),
            recipientId: recipientId.toString(),
            targetLanguage: recipient.preferredLanguage,
            translatedText: translation.translatedText,
            translationStatus: "completed",
          });
        } catch (error) {
          console.error(
            "Background message translation failed:",
            error?.message || error,
          );
        }
      })();
    } catch (error) {
      console.error("Socket message send failed:", error.message);
      respond({ ok: false, error: "Unable to send message" });
    }
  });

  socket.on("conversation:join", async (conversationId, callback) => {
    try {
      if (typeof conversationId !== "string") {
        return callback?.({ ok: false, error: "Invalid conversation ID" });
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.data.userId,
      }).select("_id");

      if (!conversation) {
        return callback?.({
          ok: false,
          error: "Conversation not found or access denied",
        });
      }

      socket.join(`conversation:${conversationId}`);

      callback?.({ ok: true, conversationId });
    } catch {
      callback?.({ ok: false, error: "Unable to join conversation" });
    }
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

try {
  await connectDB();
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} catch (error) {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
}
