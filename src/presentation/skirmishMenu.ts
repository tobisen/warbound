import {isIslandMap,islandMapIds,islandMaps} from '../config/islandMaps';
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
 const mapSelect=element('map-select') as HTMLSelectElement;for(const id of [...islandMapIds,'lakehold','fivepasses','rivercrown'] as const)if(!mapSelect.querySelector(`option[value="${id}"]`))mapSelect.add(new Option(maps[id].label,id));
 const human=document.createElement('fieldset');human.id='skirmish-human';human.innerHTML='<legend>Your faction</legend><p id="skirmish-faction-description"></p>';human.prepend(element('faction-select').closest('label')!);setup.append(human);
 const opponents=document.createElement('section');opponents.id='skirmish-opponents';opponents.innerHTML='<h3>Opponents</h3><p id="skirmish-capacity" role="status"></p><fieldset id="skirmish-ai-1"><legend>AI 1</legend><p id="skirmish-ai-1-description"></p></fieldset><fieldset id="skirmish-ai-2"><legend>AI 2</legend><p id="skirmish-ai-2-description"></p></fieldset>';
 opponents.prepend(element('player-count-select').closest('label')!);setup.append(opponents);
 for(const id of ['enemy-faction-select','difficulty-select','ai-profile-select','enemy-team-select'])element('skirmish-ai-1').append(element(id).closest('label')!);
 element('skirmish-ai-1').append(element('ai-profile-description'),element('difficulty-description'));
 element('skirmish-ai-2').append(element('additional-ai-settings'),element('ai-2-team-select').closest('label')!);
 for(const n of [3,4]){const field=element('skirmish-ai-2').cloneNode(true) as HTMLElement;for(const node of [field,...field.querySelectorAll<HTMLElement>('[id]')])node.id=node.id.replace('ai-2',`ai-${n}`).replace('additional-ai-settings',`additional-ai-${n}-settings`);field.querySelector('legend')!.textContent=`AI ${n}`;for(const label of field.querySelectorAll('label'))for(const child of label.childNodes)if(child.nodeType===Node.TEXT_NODE)child.textContent=child.textContent!.replace('AI 2',`AI ${n}`);(field.querySelector(`#ai-${n}-faction-select`) as HTMLSelectElement).value=n===3?'dwarves':'goblins';opponents.append(field);}
 for(const [i,id] of playerIds.entries()){const select=element(`${id}-team-select`) as HTMLSelectElement;select.replaceChildren(...[1,2,3,4,5].map(n=>new Option(`Team ${n}`,String(n),false,n===i+1)));}
 const advanced=document.createElement('details');advanced.id='skirmish-advanced';advanced.innerHTML='<summary>Advanced match settings</summary>';advanced.append(element('team-settings'),element('speed-select').closest('label')!,element('speed-description'));setup.append(advanced);
 const presets=document.createElement('details');presets.id='skirmish-presets';presets.innerHTML='<summary>Naval match ideas</summary><p>Playable setups with ordinary base-destruction victory. All settings remain editable; no unlocks or scores.</p>';
 for(const preset of [
  {name:'Race for Trident',map:'trident',faction:'elves',enemy:'dwarves',profile:'economic',count:'2',text:'Scout first, then transport workers to the rich southern island before the Economic Dwarves settle it.'},
  {name:'Narrows Raid',map:'twinwake',faction:'clans',enemy:'crown',profile:'defensive',count:'2',text:'Use Flame Galleys and assault infantry against Human armor and repairs. An early landing can bypass the defending fleet.'},
  {name:'Farreach Convoy',map:'farreach',faction:'crown',enemy:'goblins',profile:'fleet',count:'2',text:'Escort remote colonies with repair support. Goblin torpedo boats punish isolated transports.'},
  {name:'Four Crowns Rivalry',map:'crownsea',faction:'elves',enemy:'clans',profile:'fleet',count:'4',text:'Four island starts. Choose alliances in Advanced settings or fight for every enemy shore.'},
 ]){const button=document.createElement('button');button.type='button';button.textContent=preset.name;button.dataset.navalPreset=preset.map;button.title=preset.text;const text=document.createElement('p');text.textContent=preset.text;button.addEventListener('click',()=>{const change=(id:string,value:string)=>{const select=element(id) as HTMLSelectElement;select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));};change('scenario-select','skirmish');change('player-count-select','2');change('map-select',preset.map);change('faction-select',preset.faction);change('enemy-faction-select',preset.enemy);change('ai-profile-select',preset.profile);change('player-count-select',preset.count);for(const [i,id]of playerIds.entries())change(`${id}-team-select`,String(i+1));});presets.append(button,text);}
 setup.append(presets);
 setup.append(element('start-match'));
}
export function syncSkirmishMenu(active:boolean,options:MatchOptions):void{
 for(const id of ['skirmish-human','skirmish-opponents','skirmish-advanced','skirmish-presets'])element(id).hidden=!active;
 if(!active)return;
 const faction=options.faction??'crown',max=Math.max(...supportedPlayerCounts(options.map,options.scenario)),count=options.players?.length??2;
 element('skirmish-faction-description').textContent=factionDescriptions[faction];
 syncFactionPortrait(element('skirmish-faction-description'),faction);
 element('skirmish-capacity').textContent=`${maps[options.map].label} · ${isIslandMap(options.map)?islandMaps[options.map].world!.width/32:options.map==='arena'||options.map==='lakehold'?64:options.map==='forest'||options.map==='fivepasses'?96:128} × ${isIslandMap(options.map)?islandMaps[options.map].world!.height/32:options.map==='arena'||options.map==='lakehold'?64:options.map==='forest'||options.map==='fivepasses'?96:128} tiles: ${max} validated start positions · You + up to ${max-1} AI. Changing opponent count selects a compatible map when needed.${options.scenario!=='skirmish'?' Survival uses fixed scenario starts.':''}`;
 for(const n of [2,3,4]){element(`skirmish-ai-${n}`).hidden=count<n+1;element(n===2?'additional-ai-settings':`additional-ai-${n}-settings`).hidden=count<n+1;}
 for(const [i,id] of playerIds.entries())element(`${id}-team-select`).closest('label')!.hidden=count<3||i>=count;
 for(let n=1;n<count;n++){const opponent=options.players?.[n]?.faction??options.enemyFaction??(faction==='crown'?'clans':'crown');element(`skirmish-ai-${n}-description`).textContent=`${factions[opponent].label}: ${factionDescriptions[opponent]} ${difficultyDescription[options.players?.[n]?.difficulty??options.difficulty]}`;}
 const select=element('map-select') as HTMLSelectElement;for(const option of select.options){const id=option.value as MatchOptions['map'],capacity=Math.max(...supportedPlayerCounts(id,'skirmish'));const m=maps[id];const size=id==='arena'||id==='lakehold'?64:id==='forest'||id==='fivepasses'?96:128;const label=`${m.label} · ${isIslandMap(id)?`${m.world!.width/32} × ${m.world!.height/32} · Naval`: `${size} × ${size}`} · ${capacity} players`;if(option.textContent!==label)option.textContent=label;const supported=supportedPlayerCounts(id,options.scenario).includes(count);option.disabled=!supported;option.hidden=!supported;}
 const difficultyLabel=element('difficulty-select').closest('label')!.querySelector('span');if(difficultyLabel&&difficultyLabel.textContent!=='Difficulty')difficultyLabel.textContent='Difficulty';
}
