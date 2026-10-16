import { z } from 'zod';

export const documentCreateSchema = z.object({
  kind: z.enum(['prescription', 'lab_report']),
});
