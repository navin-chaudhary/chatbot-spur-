import { Router, Request, Response } from 'express';
import { validateChatMessage } from '../middleware/validation';
import {
  createConversation,
  getConversation,
  createMessage,
  getConversationMessages,
} from '../services/conversation';
import { generateReply } from '../services/llm';

const router = Router();

router.post('/message', validateChatMessage, async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    // Get or create conversation
    let conversationId: string;
    if (sessionId) {
      const conversation = await getConversation(sessionId);
      if (!conversation) {
        // If sessionId provided but conversation doesn't exist, create a new one
        // This handles cases where the database was reset or sessionId is invalid
        console.log(`Session ${sessionId} not found, creating new conversation`);
        const newConversation = await createConversation();
        conversationId = newConversation.id;
      } else {
        conversationId = sessionId;
      }
    } else {
      const conversation = await createConversation();
      conversationId = conversation.id;
    }

    // Save user message
    await createMessage(conversationId, 'user', message);

    // Get conversation history (limit to recent messages for context)
    const allMessages = await getConversationMessages(conversationId);
    const maxHistoryMessages = parseInt(
      process.env.MAX_CONVERSATION_MESSAGES || '50',
      10
    );
    const recentMessages = allMessages.slice(-maxHistoryMessages);

    // Generate AI reply
    const llmResponse = await generateReply(recentMessages, message);

    if (llmResponse.error) {
      // Save error message as AI response
      const errorMessage = `Sorry, I encountered an error: ${llmResponse.error}`;
      await createMessage(conversationId, 'ai', errorMessage);
      
      // Return error response but with 200 status so frontend can display it
      // Frontend will check for error: true to show it as an error message
      return res.status(200).json({
        reply: errorMessage,
        sessionId: conversationId,
        error: true,
      });
    }

    // Save AI reply
    await createMessage(conversationId, 'ai', llmResponse.reply);

    return res.json({
      reply: llmResponse.reply,
      sessionId: conversationId,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    console.error('Error stack:', error.stack);
    
    // Ensure we always send a valid JSON response
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred. Please try again.',
      });
    }
  }
});

router.get('/history/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const conversation = await getConversation(sessionId);
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
      });
    }

    const messages = await getConversationMessages(sessionId);
    res.json({
      sessionId,
      messages,
    });
  } catch (error: any) {
    console.error('History endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export default router;

