/**
 * Auto-generated TypeScript definitions by `moul typegen`.
 * Do NOT edit manually. Run `moul typegen` to regenerate.
 */

export interface BaseSystemFields {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSystemFields extends BaseSystemFields {
  username: string;
  email: string;
  verified?: boolean;
  otpCode?: string;
  otpExpiresAt?: string;
  passkeys?: string;
  resetToken?: string;
  resetTokenExpiresAt?: string;
  oauthProviders?: string;
}

export type WorkerJobState = 'available' | 'executing' | 'completed' | 'discarded' | 'cancelled';

export interface WorkerSystemFields extends BaseSystemFields {
  state: WorkerJobState;
  queue: string;
  worker: string;
  args: Record<string, unknown>;
  meta: Record<string, unknown>;
  tags: string[];
  errors: string[];
  attempt: number;
  max_attempts: number;
  priority: number;
  inserted_at: string;
  scheduled_at: string;
  attempted_at?: string;
  attempted_by?: string;
  completed_at?: string;
  discarded_at?: string;
  cancelled_at?: string;
}

export interface AnalyticSystemFields extends BaseSystemFields {
  visit_token: string;
  visitor_token: string;
  user_id?: string;
  name: string;
  properties: Record<string, unknown>;
  time: string;
}

export interface CategoriesRecord extends BaseSystemFields {
  color?: string;
  description?: string;
  name: string;
  slug: string;
}

export interface EventsRecord extends AnalyticSystemFields {
}

export interface PostsRecord extends BaseSystemFields {
  authorId?: string;
  authorId_expand?: UsersRecord;
  categoryId?: string;
  categoryId_expand?: CategoriesRecord;
  content?: string;
  isFeatured: boolean;
  publishedAt?: string;
  slug: string;
  status?: "draft" | "published" | "archived";
  tags?: Record<string, unknown> | unknown[] | unknown;
  title: string;
  viewsCount?: number;
}

export interface TasksQueueRecord extends WorkerSystemFields {
}

export interface WorkersRecord extends WorkerSystemFields {
}

export interface UsersRecord extends AuthSystemFields {
  avatar?: string;
  bio?: string;
  name?: string;
  role?: "admin" | "editor" | "member";
}

export interface MoulSchema {
  "_workers"?: WorkersRecord;
  "categories": CategoriesRecord;
  "events": EventsRecord;
  "posts": PostsRecord;
  "tasks_queue": TasksQueueRecord;
  "users": UsersRecord;
}

export type MoulCollectionName = keyof MoulSchema;

export type RecordModel<T extends MoulCollectionName> = MoulSchema[T];
