Polyglot Chat
Real-time multilingual messaging with language-aware translation.

Polyglot Chat is a multilingual messaging application designed to reduce language barriers in one-to-one communication. Users can choose a preferred language and communicate with people who use another language.

The application is being developed with a separate frontend, backend, and translation service. Its translation approach uses self-hosted, open-source models rather than depending on a hosted translation API.
Development status: This project is under active development and currently runs locally. English-to-Hindi and Hindi-to-English translation have been successfully tested; the translation service still needs improvement.

Core idea
A sender writes a message in their language, and the recipient should be able to receive it in their preferred language.

The initial language focus is English, Hindi, Hinglish, and selected Indian languages. Language support should be considered available only where it has been implemented and tested.
Current implementation status
Component / feature	Status
User login	Implemented
User signup	Implemented
Chat window	Implemented
Language preference	Implemented
Chat list	Not implemented
Profile settings	Not implemented
English → Hindi translation	Successfully tested; needs improvement
Hindi → English translation	Successfully tested; needs improvement
Local development	Current setup


Technology stack
Layer	Technologies
Frontend	React
Backend	Node.js, Express.js
Database	MongoDB
Real-time communication	Socket.IO
Translation service	Python, FastAPI
Translation model	AI4Bharat IndicTrans2 (English-to-Indic model)


Architecture
The project is organized into three services:
- Frontend: React application for user interaction and the chat interface.
- Backend: Node.js and Express.js application using MongoDB for persistence and Socket.IO for real-time communication.
- Translator: Separate Python/FastAPI service for translation using self-hosted models.
Keeping translation in a separate service allows it to be developed and tested independently from the messaging backend.
Project structure
The repository is organized into the following top-level services:
ProjectReal/
├── frontend/
├── backend/
├── translator/
└── .gitignore
Each service has its own dependencies and development workflow.
Local development
The application is currently intended for local development. The configuration below documents the known backend environment variables; it does not assume frontend or translator commands that have not yet been confirmed.
Backend environment variables
Create a .env file in the backend directory and configure:
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_token_expiry
The following variables have also been used for testing:
TEST_JWT=your_test_token
TEST_JWT_B=your_second_test_token
Use test tokens only in the appropriate local testing environment. Do not commit .env files, real credentials, JWTs, or database connection strings.
Running the services
Install and run each service using its own project configuration and scripts. Exact commands for the frontend, backend, and translator will be added once the current package.json scripts and Python dependency setup have been confirmed.
Translation
The translation service is built separately from the Node.js backend using Python and FastAPI.

The current model work includes AI4Bharat's IndicTrans2 English-to-Indic model. English-to-Hindi and Hindi-to-English translation have both been successfully tested. Translation quality and service integration are still being improved.
Development notes
- The project prioritizes self-hosted, open-source translation models.
- The frontend, backend, and translator are maintained as separate components.
- Implemented features are distinguished from planned or unfinished work in this README.
License
No license has been selected yet. Until a license is added to the repository, all rights are reserved by default; do not assume the project is available for reuse under an open-source license.
