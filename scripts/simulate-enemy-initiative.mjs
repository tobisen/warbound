// Production-bundled, reproducible 20-game-minute AI scenarios; no browser required.
import {build} from 'vite';
import {mkdtemp,writeFile,mkdir,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const temporary=await mkdtemp(join(tmpdir(),'w2t-initiative-'));
const baseline=process.env.W2T_BASELINE==='1',out=process.env.W2T_ARTIFACTS??'artifacts/ai-initiative';
try{
 const changed=execFileSync('git',['diff','--name-only','--','src'],{encoding:'utf8'}).trim().split('\n').filter(p=>p.endsWith('.ts')).map(p=>resolve(p));
 await build({configFile:false,logLevel:'error',plugins:[{name:'initiative-baseline',enforce:'pre',load(id){if(baseline&&changed.includes(id))return execFileSync('git',['show',`HEAD:${id.slice(process.cwd().length+1)}`],{encoding:'utf8'});}}],build:{outDir:temporary,lib:{entry:resolve('src/gameplay/testHelpers/enemyInitiative.ts'),formats:['es'],fileName:()=> 'scenario.mjs'},minify:true}});
 const {simulateEnemyInitiative}=await import(pathToFileURL(join(temporary,'scenario.mjs')).href),reports=[];
 const scenarios=process.env.W2T_SCENARIO? [process.env.W2T_SCENARIO.split('/')]:[['arena','easy'],['arena','hard'],['arena','normal'],['plains96','normal']];
 for(const [map,difficulty] of scenarios){const started=performance.now();const {report}=simulateEnemyInitiative(map,difficulty,1200,s=>console.log(`${map}/${difficulty} ${s.time}s jobs=${s.jobs} bases=${s.bases} priority=${s.priority}`));reports.push({...report,wallMs:performance.now()-started});await mkdir(out,{recursive:true});await writeFile(join(out,`${baseline?'baseline':'results'}.json`),JSON.stringify(reports,null,2)+'\n');console.log(JSON.stringify(reports.at(-1)));}
}finally{await rm(temporary,{recursive:true,force:true});}
