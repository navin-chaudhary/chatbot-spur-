# Chatbot Spur - AI Live Chat Agent

A full-stack AI-powered live chat application built with SvelteKit (frontend) and Express/TypeScript (backend), using Groq's LLM API for intelligent customer support conversations.

## 🌐 Production URLs

- **Frontend**: https://chatbot-spur-68it.vercel.app
- **Backend**: https://chatbot-spur.onrender.com/

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database (local or cloud)
- Groq API key ([Get one here](https://console.groq.com/))

### Step-by-Step Local Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd chatbot-spur-
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3001

# Groq LLM API Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
MAX_TOKENS=500

# Message & Conversation Limits
MAX_MESSAGE_LENGTH=5000
MAX_CONVERSATION_MESSAGES=50

# Database Configuration
# Option 1: Use individual connection parameters (recommended)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatbot
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Option 2: Use connection string (alternative)
# DATABASE_URL=postgresql://user:password@localhost:5432/chatbot
```

**Important**: Replace `your_groq_api_key_here` with your actual Groq API key from [Groq Console](https://console.groq.com/).

#### 4. Set Up Database

**Option A: Using PostgreSQL locally**

1. Install PostgreSQL if you haven't already
2. Create a database:
   ```bash
   createdb chatbot
   ```
3. Run migrations:
   ```bash
   npm run migrate
   ```

**Option B: Using a cloud database (e.g., Render, Supabase, Neon)**

1. Create a PostgreSQL database on your cloud provider
2. Update the `.env` file with your cloud database credentials
3. Run migrations:
   ```bash
   npm run migrate
   ```

The migration script will automatically:
- Create the `conversations` table
- Create the `messages` table
- Set up indexes for optimal query performance
- Enable UUID extension if needed

#### 5. Start Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The backend will be available at `http://localhost:3001`

#### 6. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

#### 7. Configure Frontend Environment Variables (Optional)

Create a `.env` file in the `frontend` directory (optional):

```env
# Backend API URL
# Leave empty to use defaults:
#   - Development: http://localhost:3001
#   - Production: https://chatbot-spur.onrender.com
# Or set a custom URL for both environments
VITE_API_URL=
```

**Note**: The frontend automatically detects the environment:
- **Development mode**: Uses `http://localhost:3001` by default
- **Production mode**: Uses `https://chatbot-spur.onrender.com` by default
- **Custom URL**: Set `VITE_API_URL` to override both defaults

#### 8. Start Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port Vite assigns)

---

## 🗄️ Database Setup

### Schema Overview

The application uses PostgreSQL with the following schema:

- **`conversations`**: Stores chat sessions
  - `id` (UUID, primary key)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- **`messages`**: Stores individual messages
  - `id` (UUID, primary key)
  - `conversation_id` (UUID, foreign key)
  - `sender` ('user' | 'ai')
  - `text` (message content)
  - `timestamp` (timestamp)

### Running Migrations

```bash
cd backend
npm run migrate
```

This will:
- Execute `src/db/schema.sql`
- Create tables if they don't exist
- Set up indexes for performance
- Handle errors gracefully (won't fail if tables already exist)

### Database Seeding

Currently, there's no seed data. Conversations and messages are created dynamically as users interact with the chat.

---

## ⚙️ Environment Variables

### Backend Environment Variables Template

Create a `.env` file in the `backend` directory with the following variables:

```env
# ============================================
# Server Configuration
# ============================================
PORT=3001

# ============================================
# Groq LLM API Configuration
# ============================================
# Required: Get your API key from https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# Optional: Model to use (default: llama-3.1-8b-instant)
# Available models: llama-3.1-8b-instant, llama-3.1-70b-versatile, mixtral-8x7b-32768
GROQ_MODEL=llama-3.1-8b-instant

# Optional: Maximum tokens per response (default: 500)
MAX_TOKENS=500

# ============================================
# Message & Conversation Limits
# ============================================
# Optional: Maximum message length in characters (default: 5000)
MAX_MESSAGE_LENGTH=5000

# Optional: Maximum conversation history messages to include in context (default: 50)
MAX_CONVERSATION_MESSAGES=50

# ============================================
# Database Configuration
# ============================================
# Option 1: Individual connection parameters (recommended for special characters in password)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatbot
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Option 2: Connection string (alternative)
# Make sure to URL-encode special characters in the password
# DATABASE_URL=postgresql://user:password@host:port/database
```

### Required vs Optional Variables

**Required:**
- `GROQ_API_KEY` - Must be set for the LLM to work

**Optional (with defaults):**
- `PORT` - Defaults to 3001
- `GROQ_MODEL` - Defaults to `llama-3.1-8b-instant`
- `MAX_TOKENS` - Defaults to 500
- `MAX_MESSAGE_LENGTH` - Defaults to 5000
- `MAX_CONVERSATION_MESSAGES` - Defaults to 50
- Database variables - Defaults to localhost PostgreSQL

### Getting Your Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it into your `.env` file

### Frontend Environment Variables Template

Create a `.env` file in the `frontend` directory (optional):

```env
# ============================================
# Backend API URL
# ============================================
# Optional: Backend API URL
# Leave empty to use defaults:
#   - Development: http://localhost:3001
#   - Production: https://chatbot-spur.onrender.com
# Or set a custom URL for both environments
VITE_API_URL=
```

**Note**: 
- In SvelteKit/Vite, environment variables must be prefixed with `VITE_` to be accessible in client-side code
- The frontend automatically detects the environment:
  - **Development mode** (`npm run dev`): Uses `http://localhost:3001` by default
  - **Production mode** (`npm run build`): Uses `https://chatbot-spur.onrender.com` by default
  - **Custom URL**: Set `VITE_API_URL` to override both defaults

---

## 🏗️ Architecture Overview

### Backend Structure

The backend follows a layered architecture pattern:

```
backend/
├── src/
│   ├── index.ts              # Express app setup, middleware, routes
│   ├── db/
│   │   ├── database.ts       # PostgreSQL connection pool & queries
│   │   ├── migrate.ts        # Database migration script
│   │   └── schema.sql        # SQL schema definitions
│   ├── routes/
│   │   └── chat.ts           # Chat API endpoints
│   ├── services/
│   │   ├── conversation.ts   # Conversation business logic
│   │   └── llm.ts            # LLM integration (Groq)
│   └── middleware/
│       └── validation.ts     # Request validation (Zod)
└── dist/                     # Compiled JavaScript (production)
```

#### Layers:

1. **Routes Layer** (`routes/`)
   - Handles HTTP requests/responses
   - Validates input via middleware
   - Delegates business logic to services

2. **Services Layer** (`services/`)
   - Business logic for conversations
   - LLM API integration
   - Message processing

3. **Data Layer** (`db/`)
   - PostgreSQL connection management
   - Database queries
   - Schema migrations

4. **Middleware Layer** (`middleware/`)
   - Request validation using Zod
   - Input sanitization

### Frontend Structure

```
frontend/
├── src/
│   ├── routes/
│   │   ├── +page.svelte      # Main page
│   │   └── +layout.svelte    # App layout
│   └── lib/
│       ├── api.ts             # Backend API client
│       └── components/
│           ├── ChatWidget.svelte      # Main chat container
│           ├── MessageList.svelte     # Message display
│           ├── MessageBubble.svelte   # Individual message
│           ├── MessageInput.svelte    # Input component
│           └── TypingIndicator.svelte # Loading indicator
```

### Design Decisions

1. **PostgreSQL over SQLite**: Chosen for production scalability and better concurrent access handling.

2. **UUID for IDs**: Using UUIDs instead of auto-incrementing integers for better distributed system support and security (no ID enumeration).

3. **Connection Pooling**: Using `pg.Pool` for efficient database connection management.

4. **TypeScript**: Full TypeScript implementation for type safety and better developer experience.

5. **Zod Validation**: Schema-based validation at the API boundary for type-safe request handling.

6. **Service Layer Pattern**: Separating routes from business logic for better testability and maintainability.

7. **Conversation History Limiting**: Limiting conversation history sent to LLM to manage token costs and context window.

8. **Error Handling**: Comprehensive error handling with user-friendly messages and detailed logging for debugging.

---

## 🤖 LLM Integration

### Provider: Groq

The application uses **Groq** as the LLM provider, which offers:
- Fast inference speeds
- Generous free tier
- Multiple model options (Llama, Mixtral)
- Simple API

### Prompting Strategy

The system uses a **system message** approach with domain knowledge:

1. **System Prompt**: Contains domain-specific knowledge about SpurMart (shipping, returns, support hours, products)
2. **Conversation History**: Recent messages (up to `MAX_CONVERSATION_MESSAGES`) are included for context
3. **User Message**: Current user input

**Example Prompt Structure:**
```
System: [Domain knowledge about SpurMart - shipping, returns, etc.]

User: What's your return policy?
Assistant: [Previous AI response if exists]

User: [Current user message]
```

### Model Configuration

- **Default Model**: `llama-3.1-8b-instant` (fast, cost-effective)
- **Alternative Models**: 
  - `llama-3.1-70b-versatile` (more capable, slower)
  - `mixtral-8x7b-32768` (longer context window)
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Max Tokens**: Configurable via `MAX_TOKENS` env var (default: 500)

### Domain Knowledge

The chatbot is pre-configured with knowledge about:
- Shipping policies (USA, Canada, UK, Australia)
- Return/refund policies (30-day window)
- Support hours (Monday-Friday 9 AM - 6 PM EST)
- Product information (electronics, home goods, accessories)
- Payment methods (credit cards, PayPal, Apple Pay)

This knowledge is embedded in the system prompt in `backend/src/services/llm.ts`.

---

## 🔄 API Endpoints

### `POST /chat/message`

Send a message to the AI agent.

**Request:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid-for-continuing-conversation"
}
```

**Response:**
```json
{
  "reply": "We offer a 30-day return policy...",
  "sessionId": "conversation-uuid"
}
```

### `GET /chat/history/:sessionId`

Retrieve conversation history for a session.

**Response:**
```json
{
  "sessionId": "uuid",
  "messages": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "sender": "user",
      "text": "Hello",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## 🛠️ Development

### Backend Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production build
npm run migrate  # Run database migrations
```

### Frontend Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel or your hosting provider
```

---

## 🚧 Trade-offs & "If I Had More Time..."

### Current Trade-offs

1. **No Authentication**: Sessions are identified only by UUIDs. No user accounts or authentication system.

2. **Simple Error Handling**: While comprehensive, error messages could be more user-friendly with retry mechanisms.

3. **No Rate Limiting**: The API doesn't implement rate limiting, which could be a concern in production.

4. **Fixed Domain Knowledge**: The domain knowledge is hardcoded in the LLM service. Changes require code deployment.

5. **No Analytics**: No tracking of conversation metrics, user satisfaction, or common questions.

6. **Limited Context Window**: Only recent messages (default 50) are sent to the LLM to manage costs.

### If I Had More Time...

1. **User Authentication & Profiles**
   - Implement user accounts with authentication
   - Store user preferences and conversation history
   - Multi-device conversation sync

2. **Admin Dashboard**
   - View all conversations
   - Analytics and insights
   - Ability to update domain knowledge without code changes
   - Manual intervention in conversations

3. **Enhanced LLM Features**
   - Support for multiple LLM providers (OpenAI, Anthropic) with fallback
   - Dynamic model selection based on query complexity
   - Streaming responses for better UX
   - Function calling for structured actions (e.g., order lookup)

4. **Improved Error Handling**
   - Retry logic with exponential backoff
   - Circuit breaker pattern for API failures
   - Graceful degradation when LLM is unavailable

5. **Rate Limiting & Security**
   - Implement rate limiting per IP/session
   - Input sanitization and XSS protection
   - API key rotation support
   - Request logging and monitoring

6. **Database Optimizations**
   - Implement message archiving for old conversations
   - Full-text search for conversation history
   - Database connection pooling tuning
   - Read replicas for scaling

7. **Testing**
   - Unit tests for services
   - Integration tests for API endpoints
   - E2E tests for chat flow
   - Load testing

8. **CI/CD**
   - Automated testing pipeline
   - Automated deployments
   - Environment-specific configurations

9. **Monitoring & Observability**
   - Application performance monitoring (APM)
   - Error tracking (e.g., Sentry)
   - Log aggregation
   - Health check dashboards

10. **Enhanced Features**
    - File upload support (images, documents)
    - Voice input/output
    - Multi-language support
    - Conversation export (PDF, JSON)
    - Search functionality within chat history

---

## 📝 License

ISC

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues or questions, please open an issue on the repository.
