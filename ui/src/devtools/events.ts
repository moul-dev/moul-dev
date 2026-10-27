// In-page event bus for the Moul Inspector. It replaced the TanStack devtools event client;
// the payloads are unchanged.

export interface AuthStatePayload {
  isAuthenticated: boolean;
  user: { id?: string; username?: string; name?: string; email?: string; role?: string } | null;
  adminKey: boolean;
  timestamp: number;
}

export interface ApiRequestPayload {
  id: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  timestamp: number;
  error?: string;
}

export interface AppActionPayload {
  id: string;
  action: string;
  category: 'schema' | 'record' | 'worker' | 'auth' | 'system' | 'custom';
  details?: Record<string, unknown>;
  timestamp: number;
}

export interface SystemPingPayload {
  timestamp: number;
  message: string;
}

export type MoulDevtoolsEvents = {
  'auth:state-change': AuthStatePayload;
  'api:request': ApiRequestPayload;
  'app:action': AppActionPayload;
  'system:ping': SystemPingPayload;
};

export type MoulDevtoolsEvent = {
  [K in keyof MoulDevtoolsEvents]: { type: K; payload: MoulDevtoolsEvents[K] };
}[keyof MoulDevtoolsEvents];

class MoulDevtoolsBus extends EventTarget {
  emit<K extends keyof MoulDevtoolsEvents>(type: K, payload: MoulDevtoolsEvents[K]): void {
    this.dispatchEvent(new CustomEvent<MoulDevtoolsEvent>('event', { detail: { type, payload } as MoulDevtoolsEvent }));
  }

  /** Subscribes to every event; returns the unsubscribe function. */
  onAll(listener: (event: MoulDevtoolsEvent) => void): () => void {
    const handler = (event: Event) => listener((event as CustomEvent<MoulDevtoolsEvent>).detail);
    this.addEventListener('event', handler);
    return () => this.removeEventListener('event', handler);
  }
}

export const moulDevtoolsClient = new MoulDevtoolsBus();

const newId = () => Math.random().toString(36).substring(2, 9);

export function emitAuthChange(payload: Omit<AuthStatePayload, 'timestamp'>): void {
  moulDevtoolsClient.emit('auth:state-change', {
    ...payload,
    timestamp: Date.now(),
  });
}

export function emitApiRequest(payload: Omit<ApiRequestPayload, 'timestamp' | 'id'> & { id?: string }): void {
  moulDevtoolsClient.emit('api:request', {
    id: payload.id || newId(),
    ...payload,
    timestamp: Date.now(),
  });
}

export function emitAppAction(payload: Omit<AppActionPayload, 'timestamp' | 'id'> & { id?: string }): void {
  moulDevtoolsClient.emit('app:action', {
    id: payload.id || newId(),
    ...payload,
    timestamp: Date.now(),
  });
}

export function emitSystemPing(message: string = 'Devtools Inspector Ping'): void {
  moulDevtoolsClient.emit('system:ping', {
    timestamp: Date.now(),
    message,
  });
}
