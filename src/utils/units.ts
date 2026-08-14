/**
 * Conversão de unidades. O banco é SEMPRE métrico (ADR-010);
 * imperial existe apenas na camada de apresentação.
 */

const KG_TO_LB = 2.20462262185;
const CM_TO_IN = 0.393700787402;

export type UnitSystem = 'metric' | 'imperial';

export const kgToLb = (kg: number) => Math.round(kg * KG_TO_LB * 10) / 10;
export const lbToKg = (lb: number) => Math.round((lb / KG_TO_LB) * 100) / 100;
export const cmToIn = (cm: number) => Math.round(cm * CM_TO_IN * 10) / 10;
export const inToCm = (inch: number) => Math.round((inch / CM_TO_IN) * 10) / 10;

/** Converte um peso do banco (kg) para a unidade do usuário. */
export function displayWeight(kg: number | null, system: UnitSystem): number | null {
  if (kg == null) return null;
  return system === 'imperial' ? kgToLb(kg) : kg;
}

/** Converte o que o usuário digitou para kg (o que vai ao banco). */
export function inputWeightToKg(value: number, system: UnitSystem): number {
  return system === 'imperial' ? lbToKg(value) : value;
}

export function displayLength(cm: number | null, system: UnitSystem): number | null {
  if (cm == null) return null;
  return system === 'imperial' ? cmToIn(cm) : cm;
}

export function inputLengthToCm(value: number, system: UnitSystem): number {
  return system === 'imperial' ? inToCm(value) : value;
}

export const weightUnit = (s: UnitSystem) => (s === 'imperial' ? 'lb' : 'kg');
export const lengthUnit = (s: UnitSystem) => (s === 'imperial' ? 'in' : 'cm');
