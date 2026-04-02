# Summary: 09-01 Database & Backend Updates

## Objective
Update the database schema and provider adapters to support advanced persona customization parameters and a side-effect-free testing sandbox.

## Changes
### src/server/db/schema.ts
- Added `temperature`, `top_p`, `max_tokens`, `presence_penalty`, `frequency_penalty`, `icon_id`, `color_accent`, and `skills` columns to the `personas` table.
- Applied changes to the database via `drizzle-kit`.

### src/server/providers/types.ts
- Defined `ModelOptions` interface.
- Updated `BaseProvider.generate` method to accept `options: ModelOptions`.

### src/server/providers/*.ts
- **Ollama**: Mapped `max_tokens` to `num_predict`.
- **LM Studio**: Mapped parameters to standard OpenAI-style request body.
- **OpenRouter**: Mapped parameters to standard OpenAI-style request body.

### src/server/index.ts
- Implemented `POST /personas/test` endpoint for live streaming persona testing without session overhead.

## Verification
- Verified database schema via `npx drizzle-kit push`.
- Provider adapter signatures updated and compile.
- Sandbox endpoint implemented using Hono streaming.

## Success Criteria
- [x] Database schema includes 8 new columns.
- [x] Provider adapters correctly map advanced parameters.
- [x] `/personas/test` endpoint is active and streams responses.
