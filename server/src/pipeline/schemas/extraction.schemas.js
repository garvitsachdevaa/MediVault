import { z } from 'zod';

const nstr = z.string().nullable().optional();
const nnum = z.number().nullable().optional();

export const prescriptionSchema = z.object({
  doctorName: nstr,
  clinic: nstr,
  date: nstr,
  medicines: z
    .array(
      z.object({
        name: nstr,
        strength: nstr,
        form: nstr,
        dose: nstr,
        frequency: nstr,
        durationDays: nnum,
        instructions: nstr,
        readAs: nstr,
      })
    )
    .default([]),
  notes: nstr,
});

export const labSchema = z.object({
  labName: nstr,
  date: nstr,
  tests: z
    .array(
      z.object({
        readAs: nstr,
        name: nstr,
        value: nnum,
        valueText: nstr,
        unit: nstr,
        refLow: nnum,
        refHigh: nnum,
        refText: nstr,
      })
    )
    .default([]),
});
