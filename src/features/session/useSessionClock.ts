import { useCallback, useEffect, useState } from 'react';

/**
 * Cronômetro do treino. Calcula a partir de `started_at` e do tempo já pausado,
 * em vez de acumular ticks — assim o número continua certo depois de o app
 * passar um tempo em segundo plano.
 *
 * `pausedSeconds` é o total já acumulado no banco; enquanto está pausado,
 * o tempo desde `pausedAt` também é descontado.
 */
export function useSessionClock(input: {
  startedAt: string | null;
  pausedSeconds: number;
  pausedAt: number | null;
}): number {
  const { startedAt, pausedSeconds, pausedAt } = input;

  const compute = useCallback(() => {
    if (!startedAt) return 0;
    const now = Date.now();
    const startMs = new Date(startedAt).getTime();
    const pausedNow = pausedAt == null ? 0 : Math.floor((now - pausedAt) / 1000);
    return Math.max(0, Math.floor((now - startMs) / 1000) - pausedSeconds - pausedNow);
  }, [startedAt, pausedSeconds, pausedAt]);

  const [elapsed, setElapsed] = useState(compute);

  useEffect(() => {
    // O primeiro ajuste vai para a fila de macrotask em vez de rodar no corpo do
    // efeito: setState síncrono ali dispara render em cascata.
    const immediate = setTimeout(() => setElapsed(compute()), 0);
    // Pausado, `compute` devolve sempre o mesmo número e o React ignora o set.
    const interval = setInterval(() => setElapsed(compute()), 1000);

    return () => {
      clearTimeout(immediate);
      clearInterval(interval);
    };
  }, [compute]);

  return elapsed;
}
