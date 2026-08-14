import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptBR from './locales/pt-BR.json';

/**
 * Estrutura de i18n montada já na Fase 1 (decisão D5).
 * A v1 lança só em PT-BR; a extração completa das strings de tela é
 * entregável da Fase 6 — por ora ficam aqui os rótulos de domínio (enums),
 * que são os mais caros de traduzir depois.
 */
export const DEFAULT_LANGUAGE = 'pt-BR';

export const resources = {
  [DEFAULT_LANGUAGE]: { translation: ptBR },
} as const;

// `use` também é export nomeado do i18next; aqui é mesmo o método da instância.
// eslint-disable-next-line import/no-named-as-default-member
void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

export default i18n;
