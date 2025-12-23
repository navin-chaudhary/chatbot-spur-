<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  export let message: {
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
  };

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  // Configure marked options once
  marked.setOptions({
    breaks: true, // Convert line breaks to <br>
    gfm: true, // GitHub Flavored Markdown
  });

  // Reactive statement to render markdown when message changes
  $: htmlContent = message.sender === 'ai' 
    ? DOMPurify.sanitize(marked.parse(message.text), {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'hr'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      })
    : DOMPurify.sanitize(message.text, { ALLOWED_TAGS: [] });
</script>

<div class="message-bubble" class:user={message.sender === 'user'} class:ai={message.sender === 'ai'}>
  <div class="message-content">
    {#if message.sender === 'ai'}
      <div class="markdown-content">
        {@html htmlContent}
      </div>
    {:else}
      <p>{message.text}</p>
    {/if}
    <span class="timestamp">{formatTime(message.timestamp)}</span>
  </div>
</div>

<style>
  .message-bubble {
    display: flex;
    margin-bottom: 0.5rem;
  }

  .message-bubble.user {
    justify-content: flex-end;
  }

  .message-bubble.ai {
    justify-content: flex-start;
  }

  .message-content {
    max-width: 70%;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    word-wrap: break-word;
  }

  .message-bubble.user .message-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message-bubble.ai .message-content {
    background: #f3f4f6;
    color: #1f2937;
    border-bottom-left-radius: 4px;
  }

  .message-content p {
    margin: 0 0 0.25rem 0;
    line-height: 1.5;
  }

  .markdown-content {
    line-height: 1.6;
  }

  .markdown-content :global(p) {
    margin: 0 0 0.75rem 0;
  }

  .markdown-content :global(p:last-child) {
    margin-bottom: 0;
  }

  .markdown-content :global(strong) {
    font-weight: 600;
  }

  .markdown-content :global(em) {
    font-style: italic;
  }

  .markdown-content :global(ul),
  .markdown-content :global(ol) {
    margin: 0.5rem 0 0.5rem 1.5rem;
    padding-left: 1rem;
  }

  .markdown-content :global(li) {
    margin: 0.25rem 0;
  }

  .markdown-content :global(h1),
  .markdown-content :global(h2),
  .markdown-content :global(h3),
  .markdown-content :global(h4),
  .markdown-content :global(h5),
  .markdown-content :global(h6) {
    margin: 0.75rem 0 0.5rem 0;
    font-weight: 600;
  }

  .markdown-content :global(h1) {
    font-size: 1.5rem;
  }

  .markdown-content :global(h2) {
    font-size: 1.25rem;
  }

  .markdown-content :global(h3) {
    font-size: 1.1rem;
  }

  .markdown-content :global(code) {
    background: rgba(0, 0, 0, 0.1);
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-size: 0.9em;
    font-family: 'Courier New', monospace;
  }

  .markdown-content :global(pre) {
    background: rgba(0, 0, 0, 0.1);
    padding: 0.75rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0.5rem 0;
  }

  .markdown-content :global(pre code) {
    background: none;
    padding: 0;
  }

  .markdown-content :global(a) {
    color: inherit;
    text-decoration: underline;
    opacity: 0.9;
  }

  .markdown-content :global(a:hover) {
    opacity: 1;
  }

  .markdown-content :global(blockquote) {
    border-left: 3px solid rgba(0, 0, 0, 0.2);
    padding-left: 1rem;
    margin: 0.5rem 0;
    font-style: italic;
  }

  .message-bubble.user .markdown-content :global(code),
  .message-bubble.user .markdown-content :global(pre) {
    background: rgba(255, 255, 255, 0.2);
  }

  .message-bubble.ai .markdown-content :global(code),
  .message-bubble.ai .markdown-content :global(pre) {
    background: rgba(0, 0, 0, 0.1);
  }

  .timestamp {
    font-size: 0.75rem;
    opacity: 0.7;
    display: block;
    margin-top: 0.25rem;
  }

  .message-bubble.user .timestamp {
    color: rgba(255, 255, 255, 0.8);
  }

  .message-bubble.ai .timestamp {
    color: #6b7280;
  }
</style>

