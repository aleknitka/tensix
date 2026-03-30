import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

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
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const personas = sqliteTable('personas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(), // e.g., "White Hat", "Black Hat"
  systemPrompt: text('system_prompt').notNull(),
  modelId: text('model_id').notNull(),
  providerId: text('provider_id').references(() => providers.id),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  personaId: text('persona_id').references(() => personas.id),
  role: text('role').notNull(), // "user" | "assistant" | "system"
  content: text('content').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});
