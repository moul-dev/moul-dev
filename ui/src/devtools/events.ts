import { EventClient } from '@tanstack/devtools-event-client';

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

class MoulDevtoolsEventClient extends EventClient<MoulDevtoolsEvents> {
  constructor() {
    super({
      pluginId: 'mould-inspector',
      debug: false,
    });
  }
}

export const moulDevtoolsClient = new MoulDevtoolsEventClient();

// Helper emit functions
export function emitAuthChange(payload: Omit<AuthStatePayload, 'timestamp'>): void {
  moulDevtoolsClient.emit('auth:state-change', {
    ...payload,
    timestamp: Date.now(),
  });
}

export function emitApiRequest(payload: Omit<ApiRequestPayload, 'timestamp' | 'id'> & { id?: string }): void {
  moulDevtoolsClient.emit('api:request', {
    id: payload.id || Math.random().toString(36).substring(2, 9),
    ...payload,
    timestamp: Date.now(),
  });
}

export function emitAppAction(payload: Omit<AppActionPayload, 'timestamp' | 'id'> & { id?: string }): void {
  moulDevtoolsClient.emit('app:action', {
    id: payload.id || Math.random().toString(36).substring(2, 9),
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
