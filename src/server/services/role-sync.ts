import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import glob from 'fast-glob';
import { db } from '../db/index';
import { personas } from '../db/schema';
import { roleSchema } from './role-schema';
import { eq } from 'drizzle-orm';

export async function syncRoles() {
  const rolesPath = path.resolve(process.cwd(), 'roles');
  const files = await glob('**/*.yml', { cwd: rolesPath });

  console.log(`Found ${files.length} role files in ${rolesPath}`);

  for (const file of files) {
    const filePath = path.join(rolesPath, file);
    const category = path.dirname(file) === '.' ? 'general' : path.dirname(file);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const rawData = yaml.load(content);
      const validated = roleSchema.parse(rawData);

      // Upsert into database
      const existing = await db.select().from(personas).where(eq(personas.id, validated.id)).limit(1);

      const personaData = {
        name: validated.name,
        role: validated.name, // Mapping for UI compatibility
        description: validated.description,
        role_type: validated.role_type,
        systemPrompt: validated.systemPrompt,
        chattiness_limit: validated.chattiness_limit,
        category: category,
        icon_id: validated.icon_id,
        color_accent: validated.color_accent,
        skills: JSON.stringify(validated.skills || []),
        temperature: validated.parameters?.temperature,
        top_p: validated.parameters?.top_p,
        max_tokens: validated.parameters?.max_tokens,
        presence_penalty: validated.parameters?.presence_penalty,
        frequency_penalty: validated.parameters?.frequency_penalty,
        is_predefined: true,
      };

      if (existing.length > 0) {
        // Update
        await db.update(personas).set(personaData).where(eq(personas.id, validated.id));
        console.log(`Updated role: ${validated.id} in category: ${category}`);
      } else {
        // Insert
        await db.insert(personas).values({
          id: validated.id,
          ...personaData,
        });
        console.log(`Inserted role: ${validated.id} in category: ${category}`);
      }
    } catch (err) {
      console.error(`Error syncing role file ${file}:`, err);
    }
  }
}
