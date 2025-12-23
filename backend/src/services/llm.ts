import Groq from 'groq-sdk';
import { Message } from '../db/database';

// Domain knowledge / FAQ data
const DOMAIN_KNOWLEDGE = `
You are a helpful support agent for a small e-commerce store called "SpurMart". Answer clearly and concisely.

Here's important information about our store:

SHIPPING POLICY:
- We ship to USA, Canada, UK, and Australia
- Standard shipping: 5-7 business days ($5.99)
- Express shipping: 2-3 business days ($12.99)
- Free shipping on orders over $50
- International shipping available (7-14 business days, $15.99)

RETURN/REFUND POLICY:
- 30-day return policy for unused items in original packaging
- Full refunds processed within 5-7 business days
- Items must be in original condition
- Return shipping is free for defective items
- Store credit available for items returned after 30 days (within 60 days)

SUPPORT HOURS:
- Monday-Friday: 9 AM - 6 PM EST
- Saturday: 10 AM - 4 PM EST
- Sunday: Closed
- Email support: support@spurmart.com
- Average response time: 2-4 hours during business hours

PRODUCT INFORMATION:
- We sell electronics, home goods, and accessories
- All products come with a 1-year warranty
- We accept major credit cards, PayPal, and Apple Pay

Be friendly, professional, and helpful. If you don't know something specific, acknowledge it and offer to help them find the answer.
`;

interface LLMResponse {
  reply: string;
  error?: string;
}

export async function generateReply(
  conversationHistory: Message[],
  userMessage: string
): Promise<LLMResponse> {
  try {
    // Build conversation context
    const messages = conversationHistory.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    return await generateGroqReply(messages);
  } catch (error: any) {
    console.error('LLM Error:', error);
    console.error('Error details:', {
      code: error.code,
      status: error.status,
      message: error.message,
      type: error.type,
    });
    
    // Handle specific error types
    if (error.code === 'insufficient_quota' || error.status === 429) {
      return {
        reply: '',
        error: "I'm currently experiencing high demand. Please try again in a moment. (Rate limit or quota exceeded)",
      };
    }
    
    if (error.status === 401 || error.message?.includes('API key') || error.message?.includes('Invalid API key')) {
      return {
        reply: '',
        error: "Configuration error: Invalid or missing Groq API key. Please check your .env file.",
      };
    }

    if (error.code === 'timeout' || error.message?.includes('timeout')) {
      return {
        reply: '',
        error: "The request took too long. Please try again.",
      };
    }

    // Provide more detailed error message for debugging
    const errorMessage = error.message || 'Unknown error';
    return {
      reply: '',
      error: `I'm having trouble processing your request: ${errorMessage}. Please check your Groq API key and account status.`,
    };
  }
}

async function generateGroqReply(messages: any[]): Promise<LLMResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is not set. Please configure your API key in the .env file.');
  }

  const groq = new Groq({ apiKey });

  const systemMessage = {
    role: 'system' as const,
    content: DOMAIN_KNOWLEDGE,
  };

  const maxTokens = parseInt(process.env.MAX_TOKENS || '500', 10);
  // Groq supports models like: llama-3.1-8b-instant, llama-3.1-70b-versatile, mixtral-8x7b-32768
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  try {
    console.log(`Calling Groq API with model: ${model}, max_tokens: ${maxTokens}`);
    const response = await groq.chat.completions.create({
      model,
      messages: [systemMessage, ...messages],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || '';
    
    if (!reply) {
      throw new Error('Empty response from Groq');
    }

    console.log('Groq API call successful');
    return { reply };
  } catch (error: any) {
    // Log detailed error information
    console.error('❌ Groq API Error Details:');
    console.error('   Code:', error.code);
    console.error('   Status:', error.status);
    console.error('   Status Text:', error.statusText);
    console.error('   Message:', error.message);
    console.error('   Type:', error.type);
    
    // Log Groq-specific error details
    if (error.response) {
      console.error('   Response Status:', error.response.status);
      console.error('   Response Data:', JSON.stringify(error.response.data || error.response, null, 2));
    }
    
    // Check for specific error types
    if (error.status === 429) {
      console.error('🚨 RATE LIMIT ERROR (429)');
      console.error('   This means you have exceeded the rate limit for your Groq API key.');
      console.error('   Solutions:');
      console.error('   1. Wait a few minutes and try again');
      console.error('   2. Check your usage at: https://console.groq.com/usage');
      console.error('   3. Groq has generous free tier limits, but rate limits may apply');
    }
    
    if (error.code === 'insufficient_quota' || error.message?.includes('quota')) {
      console.error('🚨 INSUFFICIENT QUOTA ERROR');
      console.error('   This means you have exceeded your Groq quota.');
      console.error('   Solutions:');
      console.error('   1. Check your usage at: https://console.groq.com/usage');
      console.error('   2. Groq offers free tier with generous limits');
    }
    
    // Re-throw to be caught by outer try-catch
    throw error;
  }
}

