<script setup lang="ts">
import data from '../../data/talk.json'
interface Element {kind:string;text?:string;file?:string;x:number;y:number;w:number;h:number;size?:number;color?:string;bold?:boolean}
const talk = data as {title:string;elements:Element[]}[]
const props = defineProps<{ slideIndex: number }>()
const url = (file: string) => `${import.meta.env.BASE_URL}images/${file}`
</script>
<template>
  <section class="slide warbound-slide" :aria-label="talk[props.slideIndex]!.title">
    <div class="warbound-canvas">
      <template v-for="(el, i) in talk[props.slideIndex]!.elements" :key="i">
        <img v-if="el.kind === 'image'" :src="url(el.file!)" :alt="el.file!.replaceAll('-', ' ')" class="talk-image" :style="{left:el.x/16+'%',top:el.y/9+'%',width:el.w/16+'%',height:el.h/9+'%'}">
        <div v-else :class="el.kind === 'text' ? 'talk-text' : 'talk-rect'" :style="{left:el.x/16+'%',top:el.y/9+'%',width:el.w/16+'%',height:el.h/9+'%',fontSize:(el.size || 16)/16+'cqw',color:'#'+el.color,fontWeight:el.bold?700:400,background:el.kind==='rect'?'#'+el.color:undefined}">{{el.text}}</div>
      </template>
    </div>
  </section>
</template>
<style>
.warbound-slide {padding:0;min-height:0;container-type:inline-size;}
.warbound-canvas {position:absolute;inset:0;}
.talk-text,.talk-image,.talk-rect {position:absolute;box-sizing:border-box;}
.talk-text {white-space:pre-line;line-height:1.12;letter-spacing:-.025em;font-family:Arial,sans-serif;}
.talk-image {object-fit:contain;image-rendering:pixelated;}
.warbound-slide::before {display:none;}
@media print {
 @page {size:1600px 900px;margin:0;}
 body,#app {margin:0;background:#701130;}
 .print-deck .slide {width:1600px;height:900px;break-after:page;box-shadow:none;print-color-adjust:exact;}
}
</style>
