/** Formatação para exibição — regras em docs/07, seção 6. */

/** Carga: vírgula decimal, uma casa, sem `,0` desnecessário. */
export function formatWeight(value: number | null, unit = 'kg'): string {
  if (value == null) return '—';
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace('.', ',');
  return `${text} ${unit}`;
}

/** Volume: kg até 10 t, depois toneladas. */
export function formatVolume(kg: number | null): string {
  if (kg == null) return '—';
  if (kg < 10_000) return `${Math.round(kg).toLocaleString('pt-BR')} kg`;
  return `${(kg / 1000).toFixed(1).replace('.', ',')} t`;
}

/** Duração longa: "52 min", "1h 12min". */
export function formatDuration(seconds: number | null): string {
  if (seconds == null) return '—';
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

/** Cronômetro: mm:ss (ou h:mm:ss acima de 1 hora). */
export function formatTimer(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

/** Faixa de repetições: "8–12" ou "10". */
export function formatRepRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return '—';
  if (min != null && max != null) return min === max ? `${min}` : `${min}–${max}`;
  return String(min ?? max);
}

/** Percentual com sinal: "+12%". */
export function formatPercentDelta(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${Math.round(value)}%`;
}
