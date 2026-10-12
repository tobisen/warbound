import {forEachFogRun} from './fogRuns';
import type Phaser from 'phaser';
import type { FogState,Team } from '../gameplay/fog';
type Paint={width:number;height:number;tileSize:number;columns:number;rows:number;team:Team;visible:boolean[];explored:boolean[]};
const paints=new WeakMap<Phaser.GameObjects.Graphics,Paint>();
/** Preview/overlay only; gameplay information must be filtered separately before normal activation. */
export function drawFog(graphics:Phaser.GameObjects.Graphics,fog:FogState,team:Team){
 const layer=fog.teams[team],old=paints.get(graphics);
 if(old&&old.width===fog.width&&old.height===fog.height&&old.tileSize===fog.tileSize&&old.columns===fog.columns&&old.rows===fog.rows&&old.team===team&&old.visible.length===layer.visible.length&&old.visible.every((v,i)=>v===layer.visible[i])&&old.explored.every((v,i)=>v===layer.explored[i]))return;
 paints.set(graphics,{width:fog.width,height:fog.height,tileSize:fog.tileSize,columns:fog.columns,rows:fog.rows,team,visible:[...layer.visible],explored:[...layer.explored]});
 graphics.clear();
 forEachFogRun(fog,team,(x,y,width,height,alpha)=>{graphics.fillStyle(0x000000,alpha);graphics.fillRect(x,y,width,height);});
}
