// Repeat the player-approach fixture with only the original neighbor sorter.
// Restore the working implementation even when Chrome or an assertion fails.
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const file='src/gameplay/separation.ts',current=readFileSync(file),reference=readFileSync('src/gameplay/testHelpers/separationReference.ts','utf8').replaceAll("from '../config/","from '../../config/");
try{
 writeFileSync(file,reference.replaceAll("from '../../config/","from '../config/").replaceAll("from '../map'","from './map'").replaceAll("from '../movement'","from './movement'").replaceAll("from '../navigation'","from './navigation'"));
 const r=spawnSync(process.execPath,['scripts/profile-naval-clarity.mjs'],{stdio:'inherit',env:{...process.env,W2T_APPROACH:'1',W2T_STAGE:'approach-before'}});if(r.status)process.exitCode=r.status;
}finally{writeFileSync(file,current);}
