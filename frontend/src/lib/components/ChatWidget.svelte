<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import MessageList from './MessageList.svelte';
  import MessageInput from './MessageInput.svelte';
  import TypingIndicator from './TypingIndicator.svelte';
  import { sendMessage as apiSendMessage, getHistory } from '../api';

  export let sessionId: string | null = null;

  const dispatch = createEventDispatcher();

  interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
  }

  let messages: Message[] = [];
  let isLoading = false;
  let isTyping = false;
  let error: string | null = null;

  onMount(async () => {
    if (sessionId) {
      await loadHistory();
    }
  });

  async function loadHistory() {
    if (!sessionId) return;

    try {
      const data = await getHistory(sessionId);
      messages = (data.messages || []).map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp,
      }));
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }

  async function handleSendMessage(messageText: string) {
    if (!messageText.trim() || isLoading) return;

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
    };
    messages = [...messages, userMessage];
    isLoading = true;
    isTyping = true;
    error = null;

    try {
      const data = await apiSendMessage(messageText, sessionId || undefined);

      // Update session ID if it's a new conversation
      if (data.sessionId && data.sessionId !== sessionId) {
        sessionId = data.sessionId;
        dispatch('sessionChange', sessionId);
      }

      // Add AI response
      if (data.reply) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toISOString(),
        };
        messages = [...messages, aiMessage];
        
        // If it's an error response, also set the error flag
        if (data.error) {
          error = data.reply;
        }
      } else if (data.error) {
        error = 'An error occurred';
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      error = err.message || 'Failed to send message. Please try again.';
      
      // Show error as AI message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Sorry, I encountered an error: ${error}`,
        timestamp: new Date().toISOString(),
      };
      messages = [...messages, errorMessage];
    } finally {
      isLoading = false;
      isTyping = false;
    }
  }

  function clearError() {
    error = null;
  }
</script>

<div class="chat-widget">
  <div class="chat-header">
    <h2>AI Support Agent</h2>
  </div>

  <div class="chat-body">
    <MessageList {messages} />
    {#if isTyping}
      <TypingIndicator />
    {/if}
  </div>

  {#if error}
    <div class="error-banner" role="alert">
      <span>{error}</span>
      <button on:click={clearError} aria-label="Dismiss error">×</button>
    </div>
  {/if}

  <MessageInput on:send={(e) => handleSendMessage(e.detail)} {isLoading} />
</div>

<style>
  .chat-widget {
    width: 100%;
    max-width: 800px;
    height: 600px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .chat-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chat-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .error-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    border-top: 1px solid #fecaca;
  }

  .error-banner button {
    background: none;
    border: none;
    color: #991b1b;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .error-banner button:hover {
    background: rgba(153, 27, 27, 0.1);
  }
</style>

