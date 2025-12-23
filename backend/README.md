# Backend - AI Chat Agent

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and add your API key:
```bash
cp .env.example .env
# Edit .env and add OPENAI_API_KEY=your_key_here
```

3. Initialize database:
```bash
npm run migrate
```

4. Start development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## Environment Variables

See `.env.example` for all available configuration options.

## API Endpoints

- `POST /chat/message` - Send a message to the AI agent
- `GET /chat/history/:sessionId` - Get conversation history
- `GET /health` - Health check

