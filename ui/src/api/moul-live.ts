export interface MoulSSEEvent<T = any> {
  action: string;
  moul: string;
  record?: T;
  oldRecord?: T;
  timestamp?: string;
  raw?: string;
}

export interface SubscribeOptions {
  url: string;
  token?: string | null;
  adminKey?: string | null;
  ticket?: string | null;
  onConnected?: (info: { clientId: string; moul: string; status: string }) => void;
  onMessage?: (event: MoulSSEEvent) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
  reconnect?: boolean;
  reconnectIntervalMs?: number;
}

/**
 * Creates an authenticated realtime ticket via POST /api/realtime/ticket.
 */
export async function createRealtimeTicket(options?: {
  token?: string | null;
  adminKey?: string | null;
}): Promise<{ ticket: string; expiresAt: string; expiresIn: number }> {
  const headers: Record<string, string> = {};
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  if (options?.adminKey) {
    headers['X-Admin-Key'] = options.adminKey;
  }
  const res = await fetch('/api/realtime/ticket', {
    method: 'POST',
    headers,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to create realtime ticket: ${res.status}`);
  }
  return res.json();
}

/**
 * Lightweight (~2 KB) zero-dependency fetch-based ReadableStream SSE reader.
 * Eliminates transmitting JWTs or credentials inside URL query strings.
 */
export function subscribeWithFetch(options: SubscribeOptions): () => void {
  const {
    url,
    token,
    adminKey,
    ticket,
    onConnected,
    onMessage,
    onError,
    signal,
    reconnect = true,
    reconnectIntervalMs = 3000,
  } = options;

  let active = true;
  let abortController = new AbortController();

  if (signal) {
    signal.addEventListener('abort', () => {
      active = false;
      abortController.abort();
    });
  }

  function parseSSEMessage(
    raw: string,
    connectedCb?: (info: any) => void,
    messageCb?: (event: MoulSSEEvent) => void
  ) {
    const lines = raw.split('\n');
    let eventType = 'message';
    let data = '';

    for (const line of lines) {
      if (line.startsWith(':')) {
        // Heartbeat comment or ping
        continue;
      }
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const slice = line.slice(5).trim();
        data = data ? `${data}\n${slice}` : slice;
      }
    }

    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      if (eventType === 'connected') {
        if (connectedCb) {
          connectedCb(parsed);
        }
      } else {
        if (messageCb) {
          messageCb({
            action: parsed.action || eventType,
            moul: parsed.moul || '',
            record: parsed.record || parsed,
            oldRecord: parsed.old_record || parsed.oldRecord,
            timestamp: parsed.timestamp || new Date().toISOString(),
            raw: data,
          });
        }
      }
    } catch {
      if (messageCb) {
        messageCb({
          action: eventType,
          moul: '',
          raw: data,
        });
      }
    }
  }

  const connect = async () => {
    while (active) {
      try {
        const headers: Record<string, string> = {
          Accept: 'text/event-stream',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        if (adminKey) {
          headers['X-Admin-Key'] = adminKey;
        }

        let fetchUrl = url;
        if (ticket) {
          const sep = fetchUrl.includes('?') ? '&' : '?';
          fetchUrl = `${fetchUrl}${sep}ticket=${encodeURIComponent(ticket)}`;
        }

        const res = await fetch(fetchUrl, {
          method: 'GET',
          headers,
          signal: abortController.signal,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || `SSE connection failed with status ${res.status}`);
        }

        if (!res.body) {
          throw new Error('ReadableStream not supported on this response');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (active) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (!part.trim()) continue;
            parseSSEMessage(part, onConnected, onMessage);
          }
        }
      } catch (err: any) {
        if (!active || err?.name === 'AbortError') {
          return;
        }
        if (onError) {
          onError(err instanceof Error ? err : new Error(String(err)));
        }
      }

      if (!active || !reconnect) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, reconnectIntervalMs));
    }
  };

  connect();

  return () => {
    active = false;
    abortController.abort();
  };
}
