
import "dotenv/config";
import { io } from "socket.io-client";

const BASE_URL = "http://127.0.0.1:5000";
const CONVERSATION_ID = "6ad5bf1604b21353a520eb69";

const TOKEN_A = process.env.TEST_JWT;
const TOKEN_B = process.env.TEST_JWT_B;
const USER_B_ID = process.env.TEST_USER_B_ID;

if (!TOKEN_A || !TOKEN_B || !USER_B_ID) {
  console.error(
    "Missing TEST_JWT, TEST_JWT_B, or TEST_USER_B_ID in backend/.env"
  );
  process.exit(1);
}

const socketA = io(BASE_URL, {
  auth: { token: TOKEN_A },
  reconnection: false,
  timeout: 5000,
});

const socketB = io(BASE_URL, {
  auth: { token: TOKEN_B },
  reconnection: false,
  timeout: 5000,
});

let finished = false;
let aJoined = false;
let bJoined = false;
let messageId = null;
let originalReceived = false;
let translationReceived = false;
let acknowledgementReceived = false;

function finish(code) {
  if (finished) return;
  finished = true;
  clearTimeout(timer);
  socketA.disconnect();
  socketB.disconnect();
  process.exitCode = code;
}

const timer = setTimeout(() => {
  console.error("FAIL: Timed out waiting for expected events");
  console.error({
    originalReceived,
    acknowledgementReceived,
    translationReceived,
  });
  finish(1);
}, 15000);

socketA.on("connect_error", (error) => {
  console.error("Socket A connection failed:", error.message);
  finish(1);
});

socketB.on("connect_error", (error) => {
  console.error("Socket B connection failed:", error.message);
  finish(1);
});

// The sender must never receive a private translation.
socketA.on("message:translation", (translation) => {
  console.error(
    "FAIL: Sender received a private translation:",
    translation.messageId
  );
  finish(1);
});

// Confirm the recipient receives the original message.
socketB.on("message:new", (message) => {
  if (message.originalText !== "Hello, second participant!") return;

  messageId = message.id;
  originalReceived = true;

  console.log("PASS: Recipient received original message");
  console.log("Message ID:", message.id);
  maybeFinish();
});

// Confirm the recipient receives their translation.
socketB.on("message:translation", (translation) => {
  if (translation.recipientId !== USER_B_ID) {
    console.error("FAIL: Translation recipient ID mismatch");
    return finish(1);
  }

  if (
    translation.messageId !== messageId ||
    translation.translationStatus !== "completed" ||
    !translation.translatedText
  ) {
    console.error("FAIL: Translation missing or mismatched");
    return finish(1);
  }

  translationReceived = true;
  console.log("PASS: Recipient received private translation");
  console.log("Translated text:", translation.translatedText);
  maybeFinish();
});

function maybeFinish() {
  if (
    originalReceived &&
    acknowledgementReceived &&
    translationReceived
  ) {
    console.log("PASS: All expected events received");
    console.log("PASS: No private translation received by sender");
    finish(0);
  }
}

function maybeSend() {
  if (!aJoined || !bJoined || finished) return;

  socketA.emit(
    "message:send",
    {
      conversationId: CONVERSATION_ID,
      originalText: "Hello, second participant!",
      sourceLanguage: "en",
    },
    (result) => {
      if (!result?.ok) {
        console.error("Send failed:", result);
        return finish(1);
      }

      acknowledgementReceived = true;
      console.log("PASS: Sender received acknowledgement");
      maybeFinish();
    }
  );
}

function joinConversation(socket, label, onJoined) {
  socket.emit("conversation:join", CONVERSATION_ID, (result) => {
    if (!result?.ok) {
      console.error(`${label} could not join:`, result);
      return finish(1);
    }

    onJoined();
    maybeSend();
  });
}

socketA.on("connect", () => {
  joinConversation(socketA, "Socket A", () => {
    aJoined = true;
  });
});

socketB.on("connect", () => {
  joinConversation(socketB, "Socket B", () => {
    bJoined = true;
  });
});
