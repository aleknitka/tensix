import { z } from 'zod';

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  role_type: z.enum(['auditor', 'researcher', 'summarizer', 'critic', 'other']),
  systemPrompt: z.string(),
  chattiness_limit: z.number().optional(),
  icon_id: z.string().optional(),
  color_accent: z.string().optional(),
  skills: z.array(z.string()).optional(),
  parameters: z.object({
    temperature: z.number().optional(),
    top_p: z.number().optional(),
    max_tokens: z.number().optional(),
    presence_penalty: z.number().optional(),
    frequency_penalty: z.number().optional(),
  }).optional(),
});

export type Role = z.infer<typeof roleSchema>;
