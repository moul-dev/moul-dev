import { toastQueue } from '@moul-dev/web-component';

// The React console patched toastQueue.add to default every toast to 3 seconds.
const DEFAULT_DURATION = 3000;

type ToastTone = 'primary' | 'success' | 'warning' | 'error';

function show(tone: ToastTone, title: string, description?: string, duration = DEFAULT_DURATION): string {
  return toastQueue.add({ title, description, tone, duration });
}

export const toast = {
  success: (title: string, description?: string, duration?: number) => show('success', title, description, duration),
  error: (title: string, description?: string, duration?: number) => show('error', title, description, duration),
  warning: (title: string, description?: string, duration?: number) => show('warning', title, description, duration),
  info: (title: string, description?: string, duration?: number) => show('primary', title, description, duration),
  close: (id: string) => toastQueue.close(id),
};
