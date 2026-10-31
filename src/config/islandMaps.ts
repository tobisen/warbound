import type {MapDefinition,TerrainPatch,MapResource} from './maps';
/** Authored large landmasses. Lobes vary shore shape without random micro-islands. */
export const islandMapIds=['twinwake','trident','crownsea','farreach'] as const;
export type IslandMapId=typeof islandMapIds[number];
export const isIslandMap=(id:unknown):id is IslandMapId=>islandMapIds.some(k=>k===id);
type Island={x:number;y:number;rx:number;ry:number;phase:number};
const designs:Record<IslandMapId,{label:string;width:number;height:number;islands:Island[];starts:{x:number;y:number}[];instruction:string}>={
 twinwake:{label:'Twinwake Narrows',width:2048,height:1536,islands:[{x:480,y:576,rx:400,ry:480,phase:0},{x:1536,y:640,rx:400,ry:500,phase:2}],starts:[{x:400,y:450},{x:1536,y:512}],instruction:'Small ·64×48 ·2 players ·2 islands. A narrow central strait offers the shortest crossing; the open southern sea lets raiders flank both harbors.'},
 trident:{label:'Trident Anchorage',width:3072,height:2304,islands:[{x:512,y:576,rx:440,ry:480,phase:1},{x:2496,y:576,rx:440,ry:480,phase:3},{x:1504,y:1728,rx:640,ry:400,phase:4}],starts:[{x:400,y:450},{x:2496,y:512}],instruction:'Medium ·96×72 ·2 players ·3 islands. Rich southern mines demand worker transports. Control the central sea or take the long southern supply route.'},
 crownsea:{label:'Four Crowns Sea',width:3072,height:3072,islands:[{x:512,y:576,rx:440,ry:480,phase:0},{x:2496,y:576,rx:440,ry:480,phase:2},{x:576,y:2496,rx:480,ry:440,phase:3},{x:2496,y:2496,rx:440,ry:440,phase:5}],starts:[{x:400,y:450},{x:2496,y:512},{x:576,y:2432},{x:2496,y:2432}],instruction:'Medium ·96×96 ·2–4 players ·4 start islands. Every expansion requires a fleet. Escort troop transports across the exposed central sea; empty start islands hold contested mines.'},
 farreach:{label:'Farreach Expanse',width:4096,height:3072,islands:[{x:544,y:608,rx:480,ry:512,phase:1},{x:3488,y:576,rx:480,ry:480,phase:3},{x:1376,y:2304,rx:640,ry:560,phase:4},{x:3008,y:2272,rx:576,ry:512,phase:6}],starts:[{x:400,y:450},{x:3488,y:512}],instruction:'Large ·128×96 ·2 players ·4 islands. Remote southern colonies and two deep sea lanes reward scouting, repair tenders and multiple landing beaches.'},
};
/** Public navigational chart; contains no live resources or enemy information. */
export const islandCharts=(id:IslandMapId)=>designs[id].islands.map(({x,y})=>({x,y}));
function landAt(c:number,r:number,island:Island){const dx=(c*32+16-island.x)/island.rx,dy=(r*32+16-island.y)/island.ry,a=Math.atan2(dy,dx),edge=1+.08*Math.sin(a*3+island.phase)+.045*Math.cos(a*5-island.phase);return dx*dx+dy*dy<edge*edge;}
function terrain(id:IslandMapId):TerrainPatch[]{const d=designs[id],out:TerrainPatch[]=[];
 for(let r=0;r<d.height/32;r++){let start=-1;for(let c=0;c<=d.width/32;c++){const water=c<d.width/32&&!d.islands.some(i=>landAt(c,r,i));if(water&&start<0)start=c;if(!water&&start>=0){out.push({column:start,row:r,columns:c-start,rows:1,kind:'water'});start=-1;}}}return out;
}
function resources(id:IslandMapId):MapResource[]{const d=designs[id],out:MapResource[]=[];
 for(const [i,p] of d.islands.entries()){
  // Connected groves outside the base/production rectangle; ordinary finite trees.
  for(let row=0;row<3;row++)for(let col=0;col<5;col++)out.push({id:`island-${i}-tree-${col}-${row}`,tree:true,resource:'wood',position:{x:p.x-208+col*32,y:p.y+208+row*32},amount:60});
  out.push({id:`island-${i}-gold`,mine:true,resource:'gold',position:{x:p.x+176,y:p.y+176},amount:i<d.starts.length?1800:4500});
  if(i>0&&i<d.starts.length){out.push({id:`island-${i}-supply-tree`,tree:true,resource:'wood',position:{x:p.x+128,y:p.y-256},amount:700},{id:`island-${i}-near-gold`,mine:true,resource:'gold',position:{x:p.x+128,y:p.y+64},amount:1800});}
 }return out;
}
export const islandMaps=Object.fromEntries(islandMapIds.map(id=>{const d=designs[id],enemy=d.starts[1],base={x:enemy.x-48,y:enemy.y-48,width:96,height:96};return [id,{label:d.label,world:{width:d.width,height:d.height},skirmishStarts:d.starts,enemyBase:base,enemyNaval:true,wood:700,gold:1800,woodPosition:{x:640,y:320},goldPosition:{x:640,y:640},terrain:terrain(id),extraResources:resources(id),instruction:d.instruction,enemyBuildSites:[{x:base.x-160,y:base.y-96},{x:base.x+128,y:base.y-96},{x:base.x-160,y:base.y+64},{x:base.x+128,y:base.y+64},{x:base.x-64,y:base.y-160},{x:base.x+32,y:base.y+160},{x:base.x-160,y:base.y+160},{x:base.x+224,y:base.y+64},{x:base.x+128,y:base.y+160},{x:base.x-224,y:base.y+64},{x:base.x+32,y:base.y-160}],enemyMuster:{x:enemy.x,y:enemy.y+128},enemyResourceWaypoints:[{x:enemy.x-144,y:enemy.y+240},{x:enemy.x+176,y:enemy.y+240}],enemyAttackWaypoints:[{x:enemy.x,y:enemy.y+128}]} satisfies MapDefinition];})) as unknown as Record<IslandMapId,MapDefinition>;
