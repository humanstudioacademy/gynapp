import { create } from 'zustand';

type PickerState = {
  /** Ids confirmados no último uso do seletor. */
  selection: string[];
  /** Sobe a cada confirmação — a tela que abriu o seletor observa isso para
   *  saber que houve uma escolha nova, mesmo que os ids sejam os mesmos. */
  version: number;
  confirm: (ids: string[]) => void;
  reset: () => void;
};

/**
 * Ponte entre o modal `exercise-picker` e quem o abriu. O Expo Router não
 * devolve valor ao fechar um modal, então a seleção passa por aqui.
 * Consumido pelo editor de ficha na Fase 3.
 */
export const useExercisePicker = create<PickerState>((set) => ({
  selection: [],
  version: 0,
  confirm: (ids) => set((state) => ({ selection: ids, version: state.version + 1 })),
  reset: () => set({ selection: [], version: 0 }),
}));
