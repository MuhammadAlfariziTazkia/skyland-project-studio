import { useEffect, useState } from 'preact/hooks';

export function Loading({ messages }: { messages: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => Math.min(n + 1, messages.length - 1)), 3500);
    return () => clearInterval(id);
  }, [messages]);
  return (
    <div class="cs-loading" role="status" aria-live="polite">
      <div class="orb" aria-hidden="true">
        <span>✦</span>
      </div>
      <p>{messages[i]}</p>
      <div class="bar" aria-hidden="true">
        <i />
      </div>
    </div>
  );
}
