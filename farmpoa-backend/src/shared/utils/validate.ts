import { z, ZodSchema } from 'zod';
import { AppError } from '../errors/AppError';

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw AppError.unprocessable('Validation failed', result.error.flatten().fieldErrors);
  }
  return result.data;
}

// East African phone validation (E.164)
export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be in E.164 format (e.g. +254712345678)');

// UUID schema
export const uuidSchema = z.string().uuid('Must be a valid UUID');

// Date-only schema (YYYY-MM-DD)
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format');

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
