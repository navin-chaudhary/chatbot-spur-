<div class="typing-indicator">
  <div class="dots">
    <span></span>
    <span></span>
    <span></span>
  </div>
  <span class="text">Agent is typing...</span>
</div>

<style>
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .dots {
    display: flex;
    gap: 0.25rem;
  }

  .dots span {
    width: 6px;
    height: 6px;
    background: #9ca3af;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .dots span:nth-child(1) {
    animation-delay: -0.32s;
  }

  .dots span:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  .text {
    font-style: italic;
  }
</style>

