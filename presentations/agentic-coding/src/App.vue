<script setup lang="ts">
import PresentationDeck from './components/deck/PresentationDeck.vue'
import WarboundSlide from './components/slides/WarboundSlide.vue'
import { decks } from './data/deck'
import { presentationConfig } from './data/presentationConfig'
const printMode = new URLSearchParams(location.search).has('print')
</script>
<template>
 <main v-if="printMode" class="print-deck"><WarboundSlide v-for="(_,i) in decks.sv" :key="i" :slide-index="i" /></main>
 <PresentationDeck v-else :decks="decks" :config="presentationConfig" />
</template>
