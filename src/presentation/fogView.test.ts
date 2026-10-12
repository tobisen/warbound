import {expect,it} from 'vitest';
import type Phaser from 'phaser';
import {createFog} from '../gameplay/fog';
import {drawFog} from './fogView';
it('reuses unchanged geometry but redraws in-place discovery, explored retreat, team and world changes',()=>{
 let clears=0;const alpha:number[]=[];
 const fake={clear(){clears++;alpha.length=0;return this;},fillStyle(_color:number,a:number){alpha.push(a);return this;},fillRect(){return this;}};
 const graphics=fake as unknown as Phaser.GameObjects.Graphics,fog=createFog({width:96,height:96});
 drawFog(graphics,fog,'player');drawFog(graphics,{...fog},'player');expect(clears).toBe(1);
 fog.teams.player.visible[0]=true;drawFog(graphics,fog,'player');expect(clears).toBe(2);
 fog.teams.player.visible[0]=false;fog.teams.player.explored[0]=true;drawFog(graphics,fog,'player');expect(clears).toBe(3);expect(alpha).toContain(.55);
 drawFog(graphics,fog,'enemy');expect(clears).toBe(4);expect(alpha).not.toContain(.55);
 drawFog(graphics,createFog({width:64,height:64}),'enemy');expect(clears).toBe(5);
});
