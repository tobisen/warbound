import type {MapDefinition,TerrainPatch} from './maps';
/** Three sea lanes around the signal island; southern resource island is optional. */
export function seaBattleTerrain():TerrainPatch[]{
 const patches:TerrainPatch[]=[];
 for(let row=0;row<64;row++){
  let start:number|undefined;
  for(let column=0;column<=96;column++){
   const home=column<=22+Math.round(1.5*Math.sin(row*.3))&&row<=26;
   const enemy=column>=75+Math.round(2*Math.sin(row*.25))&&row<=31;
   const signal=((column-49)/5)**2+((row-26)/7)**2<1;
   const southern=((column-42)/7)**2+((row-55)/6)**2<1;
   const water=column<96&&!home&&!enemy&&!signal&&!southern;
   if(water&&start===undefined)start=column;
   if(!water&&start!==undefined){patches.push({column:start,row,columns:column-start,rows:1,kind:'water'});start=undefined;}
  }
 }
 return patches;
}
export const seaBattleMap:MapDefinition={
 campaignOnly:true,label:'Stormgate Straits',enemyNaval:true,world:{width:3072,height:2048},wood:2400,gold:6000,goldPosition:{x:600,y:300},
 enemyBase:{x:2656,y:416,width:96,height:96},enemyMuster:{x:2560,y:720},
 enemyAttackWaypoints:[{x:2528,y:864},{x:2656,y:736},{x:2848,y:608}],enemyResourceWaypoints:[{x:2576,y:272},{x:2800,y:208},{x:2848,y:864}],
 enemyBuildSites:[{x:2528,y:352},{x:2528,y:512},{x:2784,y:512},{x:2784,y:352}],
 extraResources:[{id:'wood-2',resource:'wood',position:{x:2608,y:208},amount:2000},{id:'gold-2',resource:'gold',position:{x:2848,y:256},amount:6000},{id:'wood-3',resource:'wood',position:{x:1296,y:1712},amount:1200},{id:'gold-3',resource:'gold',position:{x:1440,y:1792},amount:3000}],
 instruction:'Three sea lanes flank Signal Island. Secure the northern passage, defeat the blockade and land on the eastern coast. The southern island offers finite reinforcements.',
 terrain:seaBattleTerrain(),
};
export const seaBattleMission='crown-stormgate-armada' as const;
export const seaBattlePassage={x:1600,y:480};
export const seaBattleLanding={x:2496,y:864};
export const seaBattleDifficulty={beginner:{enemyShips:10,release:150},easy:{enemyShips:12,release:120},normal:{enemyShips:15,release:90},hard:{enemyShips:18,release:60}} as const;

export const navalContentAI=(m:{scenario?:string;campaignMission?:string})=>m.scenario==='skirmish'&&!m.campaignMission||m.campaignMission===seaBattleMission;
