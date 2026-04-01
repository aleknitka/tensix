import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const providers = sqliteTable('providers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // "ollama" | "lmstudio" | "openrouter"
  baseUrl: text('base_url'),
  apiKey: text('api_key'),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary'),
  status: text('status').notNull().default('active'), // "refining" | "active" | "completed"
  refinedPrompt: text('refined_prompt'),
  parentId: text('parent_id').references((): any => sessions.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const personas = sqliteTable('personas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(), // e.g., "White Hat", "Black Hat"
  description: text('description'),
  systemPrompt: text('system_prompt').notNull(),
  modelId: text('model_id'),
  providerId: text('provider_id').references(() => providers.id),
  chattiness_limit: integer('chattiness_limit'),
  category: text('category').default('general'),
  role_type: text('role_type'), // 'auditor', 'researcher', 'summarizer', etc.
  is_predefined: integer('is_predefined', { mode: 'boolean' }).default(false),
  temperature: real('temperature'),
  top_p: real('top_p'),
  max_tokens: integer('max_tokens'),
  presence_penalty: real('presence_penalty'),
  frequency_penalty: real('frequency_penalty'),
  icon_id: text('icon_id').default('user-circle'),
  color_accent: text('color_accent').default('slate'),
  skills: text('skills').default('[]'), // JSON array of skill IDs
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  personaId: text('persona_id').references(() => personas.id),
  role: text('role').notNull(), // "user" | "assistant" | "system"
  content: text('content').notNull(),
  metadata: text('metadata'), // JSON tool call details
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(), // MIME type or extension
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
