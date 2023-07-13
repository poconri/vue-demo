<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useFloating } from '@floating-ui/vue';
import { isElement } from '@/type-guard/type-guards';


const tooltipReference = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);
const showTooltip = ref(false);
const drawing = ref(false);
const start = reactive({ x: 0, y: 0 });
const currentBox = reactive({ x: 0, y: 0, width: 0, height: 0 });

const { floatingStyles } = useFloating(tooltipReference, floating);

const tooltipStyles = {
  ...floatingStyles,
  transform: 'translate(0, -100%)',
};

const handleMouseDown = (event: MouseEvent) => {
    if(isElement(event.currentTarget)) {
        drawing.value = true;
        const container = event.currentTarget.getBoundingClientRect();
        start.x = event.clientX - container.left;
        start.y = event.clientY - container.top;
    }
};

const handleMouseUp = (event: MouseEvent) => {
  if (drawing.value) {
    drawing.value = false;
    const x = Math.min(start.x, event.offsetX);
    const y = Math.min(start.y, event.offsetY);
    const width = Math.abs(start.x - event.offsetX);
    const height = Math.abs(start.y - event.offsetY);
    const text = window.prompt('Enter your comment');
    // if (text) {
    //     comments.value.push({ x, y, text, width, height });
    // }
  }
};

const handleAddCommentClick = () => {
  showTooltip.value = !showTooltip.value;
};

onMounted(() => {
  const commentInput = tooltipReference.value?.querySelector('textarea');
  if (commentInput) {
    commentInput.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        showTooltip.value = false;
      }
    });
  }
});
</script>

<template>
    <div class="relative">
    <div
      class="absolute border-2 border-red-500"
      v-if="drawing"
      :style="{ left: `${currentBox.x}px`, top: `${currentBox.y}px`, width: `${currentBox.width}px`, height: `${currentBox.height}px` }"
    ></div>
    <div
      ref="tooltipReference"
      class="absolute top-0 right-0 mt-2 mr-2"
      @mouseover="showTooltip = true"
      @mouseleave="showTooltip = false"
    >
      <button @click="handleAddCommentClick" class="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-400">Add Comment</button>
      <div v-if="showTooltip">
        <div
          ref="floating"
          :style="tooltipStyles"
          class="bg-white border border-gray-800 p-4 rounded shadow"
        >
          <textarea ref="commentInput" class="w-full h-20"></textarea>
        </div>
      </div>
    </div>
  </div>
  </template>