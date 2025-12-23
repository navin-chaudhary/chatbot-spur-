<script lang="ts">
  import { onMount } from 'svelte';
  import ChatWidget from '../lib/components/ChatWidget.svelte';

  type SessionId = string | null;
  let sessionId: SessionId = null;

  onMount(() => {
    // Try to load session from localStorage
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      sessionId = savedSessionId;
    }
  });

  function handleSessionChange(newSessionId: string) {
    sessionId = newSessionId;
    localStorage.setItem('chatSessionId', newSessionId);
  }
</script>

<svelte:head>
  <title>AI Support Chat - SpurMart</title>
</svelte:head>

<main>
  <div class="container">
    <header>
      <h1>Welcome to SpurMart</h1>
      <p>Chat with our AI support agent</p>
    </header>
    <ChatWidget {sessionId} on:sessionChange={(e) => handleSessionChange(e.detail)} />
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  header {
    text-align: center;
    color: white;
  }

  header h1 {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 700;
  }

  header p {
    margin: 0.5rem 0 0 0;
    font-size: 1.2rem;
    opacity: 0.9;
  }
</style>

