import type {MapDefinition,MapId} from './maps';
type Point={x:number;y:number};
export const newSkirmishIds=['lakehold','fivepasses','rivercrown'] as const;
export const isNewSkirmishMap=(id:MapId)=>newSkirmishIds.some(key=>key===id);
const starts:Record<typeof newSkirmishIds[number],readonly Point[]>={
 lakehold:[{x:400,y:450},{x:1680,y:1632},{x:1680,y:448},{x:400,y:1632},{x:1040,y:1040}],
 fivepasses:[{x:400,y:450},{x:2640,y:2624},{x:2640,y:448},{x:400,y:2624},{x:1520,y:1520}],
 rivercrown:[{x:400,y:450},{x:3504,y:3344},{x:3504,y:496},{x:496,y:3440},{x:2032,y:2032}],
};
function definition(id:typeof newSkirmishIds[number],label:string,size:number,instruction:string):MapDefinition{
 const slots=starts[id],enemy=slots[1];return {label,world:{width:size,height:size},skirmishStarts:slots,wood:700,gold:3000,terrain:[],enemyBase:{x:enemy.x-48,y:enemy.y-48,width:96,height:96},instruction,
 extraResources:slots.slice(1).flatMap((p,i)=>[{id:`slot-${i+2}-wood`,tree:true as const,resource:'wood' as const,position:{x:p.x-160,y:p.y-160},amount:500},{id:`slot-${i+2}-gold`,mine:true as const,resource:'gold' as const,position:{x:p.x+176,y:p.y-112},amount:3000}])};
}
export const newSkirmishMaps={
 lakehold:definition('lakehold','Lakehold Circuit',2048,'Small · 64 × 64 · 5 players. Claim the central hold or circle the twin lakes. North and south approaches trade a short attack route for access to outer mines.'),
 fivepasses:definition('fivepasses','Five Passes',3072,'Medium · 96 × 96 · 5 players. Broken ridges divide the five homelands. Take the inner passes to contest the central glades, or follow the broad outer route to expand behind the ridges.'),
 rivercrown:definition('rivercrown','River Crown',4096,'Large · 128 × 128 · 5 players. Three broken river arms surround the crownlands. Scout the dry crossings, use the outer banks to flank, and contest rich groves between the waterways.'),
} satisfies Record<typeof newSkirmishIds[number],MapDefinition>;
type Shape=readonly [number,number,number,number];
export const skirmishGeography:Record<typeof newSkirmishIds[number],{water:readonly Shape[];rock:readonly Shape[];woods:readonly Shape[]}>= {
 lakehold:{water:[[31,18,7,5],[31,47,7,5]],rock:[[20,32,3,6],[45,32,3,6]],woods:[[8,23,5,5],[53,23,5,5],[9,41,5,4],[53,42,5,4],[30,6,7,3],[31,58,7,3]]},
 fivepasses:{water:[[24,47,5,10],[72,47,5,10]],rock:[[40,19,3,11],[57,76,3,11],[18,65,9,3],[77,29,9,3],[48,35,9,3],[48,61,9,3]],woods:[[10,32,6,9],[83,61,6,9],[28,13,8,5],[68,83,8,5],[30,72,7,8],[66,22,7,8],[48,48,9,7]]},
 rivercrown:{water:[[46,28,5,19],[83,42,18,5],[44,91,23,5],[84,95,5,17]],rock:[[28,62,7,12],[100,68,7,14],[62,20,11,4],[63,110,12,4]],woods:[[19,27,10,8],[28,110,11,7],[107,24,10,8],[110,105,10,8],[62,45,10,6],[60,81,11,7],[18,82,8,10],[109,47,9,8]]},
};
