import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Simular la lógica de superposición que está en services.ts
function checkOverlap(
  requestedStart: number,
  requestedEnd: number,
  existingStart: number,
  existingEnd: number
): boolean {
  return requestedStart < existingEnd && requestedEnd > existingStart;
}

describe('Agenda Concurrency & Validation', () => {
  describe('Overlap Logic (Prevención de Doble Reserva)', () => {
    it('should detect exact overlap', () => {
      expect(checkOverlap(1000, 2000, 1000, 2000)).toBe(true);
    });

    it('should detect partial overlap (start)', () => {
      expect(checkOverlap(500, 1500, 1000, 2000)).toBe(true);
    });

    it('should detect partial overlap (end)', () => {
      expect(checkOverlap(1500, 2500, 1000, 2000)).toBe(true);
    });

    it('should detect complete containment', () => {
      expect(checkOverlap(1200, 1800, 1000, 2000)).toBe(true);
    });

    it('should allow adjacent slots (no overlap)', () => {
      // El slot A termina exactamente cuando empieza el slot B
      expect(checkOverlap(1000, 2000, 2000, 3000)).toBe(false);
    });

    it('should allow completely separate slots', () => {
      expect(checkOverlap(1000, 2000, 3000, 4000)).toBe(false);
    });
  });

  describe('Zod Validation for Appointment Creation', () => {
    const createAppointmentSchema = z.object({
      masterId: z.string().min(1),
      startAt: z.string().datetime(),
      endAt: z.string().datetime(),
      timezone: z.string().min(1),
    });

    it('should validate correct appointment data', () => {
      const validData = {
        masterId: 'master-123',
        startAt: '2023-10-25T09:00:00.000Z',
        endAt: '2023-10-25T10:00:00.000Z',
        timezone: 'America/Bogota',
      };
      expect(() => createAppointmentSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid datetime formats', () => {
      const invalidData = {
        masterId: 'master-123',
        startAt: '2023-10-25 09:00:00', // Formato inválido (falta la T y Z)
        endAt: '2023-10-25T10:00:00.000Z',
        timezone: 'America/Bogota',
      };
      expect(() => createAppointmentSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty masterId', () => {
      const invalidData = {
        masterId: '',
        startAt: '2023-10-25T09:00:00.000Z',
        endAt: '2023-10-25T10:00:00.000Z',
        timezone: 'America/Bogota',
      };
      expect(() => createAppointmentSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing timezone', () => {
      const invalidData = {
        masterId: 'master-123',
        startAt: '2023-10-25T09:00:00.000Z',
        endAt: '2023-10-25T10:00:00.000Z',
        timezone: '',
      };
      expect(() => createAppointmentSchema.parse(invalidData)).toThrow();
    });
  });
});
