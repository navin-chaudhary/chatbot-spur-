<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  export let isLoading = false;

  const dispatch = createEventDispatcher();

  let input: HTMLTextAreaElement;
  let message = '';

  onMount(() => {
    // Listen for suggestion clicks
    window.addEventListener('suggestion', handleSuggestion);
    return () => {
      window.removeEventListener('suggestion', handleSuggestion);
    };
  });

  function handleSuggestion(event: any) {
    message = event.detail;
    send();
  }

  function send() {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    dispatch('send', trimmed);
    message = '';
    if (input) {
      input.focus();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }
</script>

<div class="message-input-container">
  <textarea
    bind:this={input}
    bind:value={message}
    on:keydown={handleKeydown}
    placeholder="Type your message..."
    rows="1"
    disabled={isLoading}
    class="message-input"
  />
  <button
    on:click={send}
    disabled={isLoading || !message.trim()}
    class="send-button"
    aria-label="Send message"
  >
    {#if isLoading}
      <svg
        class="spinner"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    {:else}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    {/if}
  </button>
</div>

<style>
  .message-input-container {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    align-items: flex-end;
  }

  .message-input {
    flex: 1;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.9375rem;
    font-family: inherit;
    resize: none;
    min-height: 44px;
    max-height: 120px;
    transition: border-color 0.2s;
  }

  .message-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .message-input:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  .send-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .send-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .send-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>

