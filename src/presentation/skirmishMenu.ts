import {syncFactionPortrait} from './factionPortrait';
import {factionDescriptions} from '../config/factionDescriptions';
import {factions} from '../config/factions';
import {maps} from '../config/maps';
import {supportedPlayerCounts,playerIds} from '../config/players';
import {difficultyDescription} from './matchSettings';
import type {MatchOptions} from '../gameplay/session';
const element=(id:string)=>document.getElementById(id)!;
export function bindSkirmishMenu():void{
 const setup=element('match-setup');
 const human=document.createElement('fieldset');human.id='skirmish-human';human.innerHTML='<legend>Your faction</legend><p id="skirmish-faction-description"></p>';human.prepend(element('faction-select').closest('label')!);setup.append(human);
 const opponents=document.createElement('section');opponents.id='skirmish-opponents';opponents.innerHTML='<h3>Opponents</h3><p id="skirmish-capacity" role="status"></p><fieldset id="skirmish-ai-1"><legend>AI 1</legend><p id="skirmish-ai-1-description"></p></fieldset><fieldset id="skirmish-ai-2"><legend>AI 2</legend><p id="skirmish-ai-2-description"></p></fieldset>';
 opponents.prepend(element('player-count-select').closest('label')!);setup.append(opponents);
 for(const id of ['enemy-faction-select','difficulty-select','ai-profile-select','enemy-team-select'])element('skirmish-ai-1').append(element(id).closest('label')!);
 element('skirmish-ai-1').append(element('ai-profile-description'),element('difficulty-description'));
 element('skirmish-ai-2').append(element('additional-ai-settings'),element('ai-2-team-select').closest('label')!);
 for(const n of [3,4]){const field=element('skirmish-ai-2').cloneNode(true) as HTMLElement;for(const node of [field,...field.querySelectorAll<HTMLElement>('[id]')])node.id=node.id.replace('ai-2',`ai-${n}`).replace('additional-ai-settings',`additional-ai-${n}-settings`);field.querySelector('legend')!.textContent=`AI ${n}`;for(const label of field.querySelectorAll('label'))for(const child of label.childNodes)if(child.nodeType===Node.TEXT_NODE)child.textContent=child.textContent!.replace('AI 2',`AI ${n}`);(field.querySelector(`#ai-${n}-faction-select`) as HTMLSelectElement).value=n===3?'dwarves':'goblins';opponents.append(field);}
 for(const [i,id] of playerIds.entries()){const select=element(`${id}-team-select`) as HTMLSelectElement;select.replaceChildren(...[1,2,3,4,5].map(n=>new Option(`Team ${n}`,String(n),false,n===i+1)));}
 const advanced=document.createElement('details');advanced.id='skirmish-advanced';advanced.innerHTML='<summary>Advanced match settings</summary>';advanced.append(element('team-settings'),element('speed-select').closest('label')!,element('speed-description'));setup.append(advanced);
 setup.append(element('start-match'));
}
export function syncSkirmishMenu(active:boolean,options:MatchOptions):void{
 for(const id of ['skirmish-human','skirmish-opponents','skirmish-advanced'])element(id).hidden=!active;
 if(!active)return;
 const faction=options.faction??'crown',max=Math.max(...supportedPlayerCounts(options.map,options.scenario)),count=options.players?.length??2;
 element('skirmish-faction-description').textContent=factionDescriptions[faction];
 syncFactionPortrait(element('skirmish-faction-description'),faction);
 element('skirmish-capacity').textContent=`${maps[options.map].label}: ${max} validated start positions · You + up to ${max-1} AI. Changing opponent count selects a compatible map when needed.${options.scenario!=='skirmish'?' Survival uses fixed scenario starts.':''}`;
 for(const n of [2,3,4]){element(`skirmish-ai-${n}`).hidden=count<n+1;element(n===2?'additional-ai-settings':`additional-ai-${n}-settings`).hidden=count<n+1;}
 for(const [i,id] of playerIds.entries())element(`${id}-team-select`).closest('label')!.hidden=count<3||i>=count;
 for(let n=1;n<count;n++){const opponent=options.players?.[n]?.faction??options.enemyFaction??(faction==='crown'?'clans':'crown');element(`skirmish-ai-${n}-description`).textContent=`${factions[opponent].label}: ${factionDescriptions[opponent]} ${difficultyDescription[options.players?.[n]?.difficulty??options.difficulty]}`;}
 const select=element('map-select') as HTMLSelectElement;for(const option of select.options){const supported=supportedPlayerCounts(option.value as MatchOptions['map'],options.scenario).includes(count);option.disabled=!supported;option.hidden=!supported;}
 const difficultyLabel=element('difficulty-select').closest('label')!.querySelector('span');if(difficultyLabel&&difficultyLabel.textContent!=='Difficulty')difficultyLabel.textContent='Difficulty';
}
