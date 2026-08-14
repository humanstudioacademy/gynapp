/** Datas na UI são sempre DD/MM/AAAA; no banco, ISO (AAAA-MM-DD). */

/** Aplica a máscara DD/MM/AAAA conforme o usuário digita. */
export function maskBrDate(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Aplica a máscara HH:MM. */
export function maskTime(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** "14/08/1990" -> "1990-08-14". Retorna null se a data não existir no calendário. */
export function brDateToIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);

  const date = new Date(Date.UTC(year, month - 1, day));
  const valid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!valid) return null;
  return `${yyyy}-${mm}-${dd}`;
}

/** "1990-08-14" -> "14/08/1990". */
export function isoToBrDate(value: string | null | undefined): string {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return '';
  return `${match[3]}/${match[2]}/${match[1]}`;
}

/** "18:00:00" -> "18:00". */
export function trimSeconds(time: string | null | undefined): string {
  if (!time) return '';
  return time.slice(0, 5);
}

/** Data de hoje em ISO, no fuso local (não usar toISOString: ele converte para UTC). */
export function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
