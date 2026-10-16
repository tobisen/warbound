<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

export default defineComponent({
  name: 'SpeakerSlide',
  components: { SlideFrame },
  props: {
    kicker: { type: String, default: '' },
    name: { type: String, required: true },
    role: { type: String, default: '' },
    bio: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    topics: { type: Array as PropType<string[]>, default: () => [] },
  },
})
</script>

<template>
  <SlideFrame :kicker="kicker" variant="speaker">
    <div class="speaker-slide">
      <div class="speaker-slide__portrait" :class="{ 'has-image': imageUrl }">
        <img v-if="imageUrl" :src="imageUrl" :alt="name" />
        <span v-else>{{ name.slice(0, 1) }}</span>
      </div>
      <div class="speaker-slide__copy">
        <p v-if="role" class="slide-kicker">{{ role }}</p>
        <h2 class="slide-title slide-title--medium">{{ name }}</h2>
        <p v-if="bio" class="slide-body">{{ bio }}</p>
        <ul v-if="topics.length" class="tag-list">
          <li v-for="topic in topics" :key="topic">{{ topic }}</li>
        </ul>
      </div>
    </div>
  </SlideFrame>
</template>
