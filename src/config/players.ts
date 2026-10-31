import type {FactionId} from './factions';
import type {AIProfileId} from './aiProfiles';
import {maps,type MapId} from './maps';
import type {Position} from '../gameplay/movement';

export type PlayerId='player'|'enemy'|'ai-2'|'ai-3'|'ai-4';
export interface PlayerDefinition {difficulty?:import('./difficulty').Difficulty;teamId?:number;id:PlayerId;controller:'human'|'ai';faction:FactionId;color:string;profile:AIProfileId}
export const playerColors=['#5fa9df','#ec7770','#e5bf55','#ae8cdd','#70c79b'] as const;
/** Authored slots, never random coordinates in unexplored terrain. */
export const additionalStarts:Partial<Record<MapId,Position>>={plains96:{x:1664,y:384},plains128:{x:1664,y:384}};
export const playerIds=['player','enemy','ai-2','ai-3','ai-4'] as const;
export const extraPlayerStarts:Partial<Record<MapId,readonly Position[]>>={plains128:[{x:528,y:3520},{x:2448,y:704}]};
export function supportedPlayerCounts(map:MapId,scenario:string):readonly number[]{return scenario!=='skirmish'?[2]:maps[map].skirmishStarts?[2,3,4,5].filter(n=>n<=maps[map].skirmishStarts!.length):extraPlayerStarts[map]?[2,3,4,5]:additionalStarts[map]?[2,3]:[2];}
