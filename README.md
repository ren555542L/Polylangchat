Polyglot Chat
Polyglot Chat is a multilingual messaging application designed to let people communicate in the language they are comfortable writing in, while allowing the recipient to read the message in their preferred language.

The project is currently being developed and tested locally. Its current focus is real-time messaging, user language preferences, and integrating a self-hosted translation service.
Project status: In development. Login, signup, the chat window, and language preference functionality are implemented. The chat list and profile settings are still incomplete. English ↔ Hindi translation has been tested, but translation quality and behaviour still need improvement.

Features implemented so far
- Authentication: Login and signup flows are implemented.
- Language preferences: Users can select a preferred language.
- Chat window: The messaging interface is implemented.
- Real-time messaging: The backend uses Socket.IO for message delivery between users.
- Message persistence: Messages are stored in MongoDB.
- Message acknowledgements: The sender receives a server acknowledgement, and optimistic messages are reconciled with server-confirmed messages.
- Duplicate/echo handling: Client-side message handling and server-side broadcasting have been adjusted to avoid treating a sender's own message as a new incoming message.
- Connection recovery work: Socket reconnection status and conversation-room rejoining have been addressed in the current implementation.
- Translation service: A separate FastAPI service is used for translation. English-to-Hindi and Hindi-to-English have been tested successfully.
The latest debugging report records the connection-recovery and message-delivery regression checks as passing. Re-run the checks below against the current code whenever the socket or messaging flow changes.
Current limitations and unfinished work
- The chat list is not yet complete.
- Profile settings are not yet implemented.
- Translation needs further improvement. Successful English ↔ Hindi tests do not imply that every translation is accurate or that all listed languages are supported end to end.
- The app is currently being run locally; a deployed environment has not been documented here.
- Screenshots are not included yet.
- A project license has not been selected yet.
Technology stack
Area	Technology
Frontend	React, Vite
Backend	Node.js, Express
Real-time communication	Socket.IO
Database	MongoDB Atlas, Mongoose
Translation API	Python, FastAPI
Translation model work	AI4Bharat IndicTrans2


The translation service is maintained separately from the Node.js backend.
Project structure
The local project is organised into three main application directories:
ProjectReal/
├── frontend/       # React + Vite application
├── backend/        # Node.js + Express + Socket.IO server
└── translator/     # Python + FastAPI translation service
Local development
From the ProjectReal repository root, run each service in a separate terminal. The commands below reflect the current local development setup. They assume the project dependencies and the translator virtual environment have already been installed.
1. Backend
cd .\backend
node src/server.js
The backend uses port 5000 in the current local configuration.
2. Frontend
cd .\frontend
npm run dev
The current frontend origin used by the backend is http://localhost:5173.
3. Translation service
cd .\translator
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 127.0.0.1 --port 8001
The translation API is available locally at http://127.0.0.1:8001 when the service starts successfully.
- Health endpoint: http://127.0.0.1:8001/health
- Interactive API documentation: http://127.0.0.1:8001/docs
Environment configuration
The backend uses environment variables for its local configuration. Create a backend .env file and provide your own values for the secrets and database connection string.
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_token_expiry_setting

# Test tokens, if required by your local test setup
TEST_JWT=your_test_token
TEST_JWT_B=your_second_test_token
Do not commit .env files, database credentials, JWT secrets, or test tokens. Keep real values in your local environment and provide a sanitized example file when sharing configuration.
Messaging and connection behaviour
The current real-time messaging flow is:
1. The user submits a message from the frontend.
2. The frontend displays an optimistic message while the send operation is pending.
3. The client emits message:send through Socket.IO.
4. The backend validates and persists the message.
5. The backend acknowledges the sender and broadcasts message:new to the other members of the conversation room.
6. The frontend reconciles the optimistic message with the server-confirmed message.
7. Translation is handled separately and delivered through the translation event flow.
The application does not currently implement offline message queuing. A send attempted while the socket is disconnected should be treated as failed rather than silently shown as delivered. A user can deliberately retry a failed message.

On reconnection, the client needs to restore its conversation-room membership. This is important because a newly established server-side Socket.IO connection does not retain the room memberships of the previous connection.
Development regression checks
Run these checks after making changes to Socket.IO, the chat context, message persistence, or connection handling:
- Send a message from Admin to Aryan and verify it appears exactly once.
- Send a message from Aryan to Admin and verify it appears exactly once.
- Send the same text twice and verify that they remain two distinct messages.
- Send several messages quickly and verify their order.
- Disconnect one browser session and verify that its status changes to reconnecting/offline as appropriate.
- Restore its network and verify automatic reconnection and conversation-room rejoining.
- Send a message after reconnection and verify exactly one delivery, with no automatic reply.
- Attempt to send while disconnected and verify that the message is not falsely marked as sent.
For clearer isolation, use two separate browser profiles or separate devices for the two test accounts. A single browser profile can share application state between tabs, so it is less suitable for testing independent user sessions.
Translation status
English-to-Hindi and Hindi-to-English translation have been tested successfully through the current translation work. Translation still needs improvement, and no claim is made here that all Indian languages or Hinglish are fully supported end to end.

The translation service uses a separate FastAPI application, with AI4Bharat IndicTrans2 involved in the current model setup.
License
No license has been selected for this project yet. Until a license is added to the repository, do not assume that the source code is available for reuse, redistribution, or modification by others.
