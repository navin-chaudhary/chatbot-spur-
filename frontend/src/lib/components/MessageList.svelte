<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import MessageBubble from './MessageBubble.svelte';

  export let messages: Array<{
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
  }>;

  let messagesEnd: HTMLDivElement;

  function scrollToBottom() {
    if (messagesEnd) {
      messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onMount(() => {
    scrollToBottom();
  });

  afterUpdate(() => {
    scrollToBottom();
  });
</script>

<div class="message-list">
  {#if messages.length === 0}
    <div class="empty-state">
      <p>👋 Hi! I'm your AI support agent. How can I help you today?</p>
      <div class="suggestions">
        <button
          type="button"
          on:click={() => {
            const event = new CustomEvent('suggestion', { detail: "What's your return policy?" });
            window.dispatchEvent(event);
          }}
        >
          What's your return policy?
        </button>
        <button
          type="button"
          on:click={() => {
            const event = new CustomEvent('suggestion', { detail: "Do you ship to USA?" });
            window.dispatchEvent(event);
          }}
        >
          Do you ship to USA?
        </button>
        <button
          type="button"
          on:click={() => {
            const event = new CustomEvent('suggestion', { detail: "What are your support hours?" });
            window.dispatchEvent(event);
          }}
        >
          What are your support hours?
        </button>
      </div>
    </div>
  {:else}
    {#each messages as message (message.id)}
      <MessageBubble {message} />
    {/each}
  {/if}
  <div bind:this={messagesEnd}></div>
</div>

<style>
  .message-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.5rem 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-align: center;
    color: #6b7280;
    padding: 2rem;
  }

  .empty-state p {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
  }

  .suggestions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    max-width: 300px;
  }

  .suggestions button {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
    color: #374151;
  }

  .suggestions button:hover {
    background: #e5e7eb;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }
</style>

