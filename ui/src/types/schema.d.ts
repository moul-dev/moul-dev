/**
 * Auto-generated TypeScript definitions by `mould typegen`.
 * Do NOT edit manually. Run `mould typegen` to regenerate.
 */

export interface BaseSystemFields {
  id: string;
  created_at: string;
  updated_at: string;
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

export interface CommentsRecord extends BaseSystemFields {
  field_1?: string;
}

export interface EventsRecord extends AnalyticSystemFields {
}

export interface NewsRecord extends BaseSystemFields {
  content?: string;
  user_id?: string;
  user_id_expand?: UsersRecord;
}

export interface PostsRecord extends BaseSystemFields {
  author_id?: string;
  author_id_expand?: UsersRecord;
  category_id?: string;
  category_id_expand?: CategoriesRecord;
  content?: string;
  is_featured: boolean;
  published_at?: string;
  slug: string;
  status?: "draft" | "published" | "archived";
  tags?: Record<string, unknown> | unknown[] | unknown;
  title: string;
  views_count?: number;
}

export interface ProductsRecord extends BaseSystemFields {
}

export interface TasksQueueRecord extends WorkerSystemFields {
}

export interface UsersRecord extends AuthSystemFields {
  avatar?: string | string[];
  bio?: string;
  name?: string;
}

export interface MoulSchema {
  "categories": CategoriesRecord;
  "comments": CommentsRecord;
  "events": EventsRecord;
  "news": NewsRecord;
  "posts": PostsRecord;
  "products": ProductsRecord;
  "tasks_queue": TasksQueueRecord;
  "users": UsersRecord;
}

export type MoulCollectionName = keyof MoulSchema;

export type RecordModel<T extends MoulCollectionName> = MoulSchema[T];
