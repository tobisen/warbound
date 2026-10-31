import type {MatchState} from '../match';
/** Reconstruct the actual pre80 island stock and geometry for migration tests. */
export function legacyIslandForests(doc:{state:MatchState}):void{
 const s=doc.state,added=(s.gathering.extraNodes??[]).filter(n=>n.id.includes('-grove-'));
 s.gathering.extraNodes=s.gathering.extraNodes?.filter(n=>!n.id.includes('-grove-'));
 for(const n of s.gathering.extraNodes??[])if(/^island-\d+-tree-/.test(n.id))n.remaining=Math.min(n.remaining,60);
 s.map.obstacles=s.map.obstacles.filter(r=>!added.some(n=>r.x===n.position.x-16&&r.y===n.position.y-16&&r.width===32&&r.height===32));
 for(const team of ['player','enemy'] as const)for(const n of added)delete s.fog?.forest?.[team]?.[n.id];
 delete s.map.legacyIslandForests;
 if(s.armyPlan){const weights:Partial<Record<string,number>>=s.armyPlan.weights;delete weights.zeppelin;delete weights.behemoth;}
}
