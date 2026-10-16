import type { SlideTypeId } from './slideRegistry'
import talk from './talk.json'
export interface SlideDefinition { type: SlideTypeId; props: Record<string, unknown>; imageAsset?: string; notes?: string[] }
export type DeckLanguage = 'en' | 'sv'
export const languageLabels = { en: 'EN', sv: 'SV' }
const slides: SlideDefinition[] = talk.map((s, i) => ({type:'warbound',props:{slideIndex:i,title:s.title},notes:[`Tid: ${s.seconds} sekunder.`,s.notes]}))
export const decks: Record<DeckLanguage, SlideDefinition[]> = {sv:slides,en:slides}
