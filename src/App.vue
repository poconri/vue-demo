<script setup lang="ts">
import { ref, watch, reactive, nextTick } from 'vue';
import Button, { type ButtonType } from '@/components/Button.vue';
import { isHmtlInputElement, isElement, isHTMLDivElement } from './type-guard/type-guards.ts';

let primaryButtonType = ref<ButtonType>('primary');
let secondaryButtonType = ref<ButtonType>('primary');
let primaryButtonText = ref<string>('Upload Image');
let secondaryButtonText = ref<string>('Add Comment');
let isButtonHidden = ref<boolean>(true);
let isLoading = ref<boolean>(false);
let isPictureSelected = ref<boolean>(false);
let isAddingComment = ref<boolean>(false);
let isWritingComment = ref<boolean>(false);
let comments = ref<{ x: number, y: number, text: string, width: number, height: number, tempText: string }[]>([]);
let fileInput = ref<HTMLInputElement | null>(null);
let backgroundImage = ref<string>('');
let isDrawing = ref<boolean>(false);
let start = reactive({ x: 0, y: 0 });
let currentBox = reactive({ x: 0, y: 0, width: 0, height: 0 });
let editingComment = ref<number | null>(null);

watch(isPictureSelected, (newValue) => {
  if (newValue) {
    primaryButtonText.value = 'Remove Image';
    primaryButtonType.value = 'secondary';
    isButtonHidden.value = false;
  } else {
    primaryButtonText.value = 'Upload Image';
    primaryButtonType.value = 'primary';
    isButtonHidden.value = true;
  }
});

watch(isAddingComment, (newValue) => {
  if (newValue) {
    secondaryButtonText.value = 'Cancel';
    secondaryButtonType.value = 'cancel';
  } else {
    secondaryButtonText.value = 'Add Comment';
    secondaryButtonType.value = 'secondary';
  }
});


const updateTooltipPosition = (index: number) => {
  const box = document.querySelector(`.comment-box-${index}`);
  const tooltip = document.querySelector(`.comment-tooltip-${index}`);
  if (box && tooltip && isHTMLDivElement(tooltip)) {
      tooltip.style.position = 'absolute';
      tooltip.style.left = '0';
      tooltip.style.top = '0';
  }
};

watch(comments, () => {
  for (let index = 0; index < comments.value.length; index++) {
    updateTooltipPosition(index);
  }
});

const handleClick = () => {
  if (isPictureSelected.value) {
    backgroundImage.value = '';
    isPictureSelected.value = false;
  } else if (isHmtlInputElement(fileInput.value)) {
    fileInput.value.click();
  }
};

const handleMouseDown = (event: MouseEvent) => {
  if (isAddingComment.value && isElement(event.currentTarget)) {
    const container = event.currentTarget.getBoundingClientRect();
      start.x = event.clientX - container.left;
      start.y = event.clientY - container.top;
    currentBox.x = start.x;
    currentBox.y = start.y;
    isDrawing.value = true;
  }
};

const handleMouseUp = (event: MouseEvent) => {
  if (isAddingComment.value && isDrawing.value) {
    isDrawing.value = false;

    let x = Math.min(start.x, currentBox.x);
    let y = Math.min(start.y, currentBox.y);
    let width = Math.abs(start.x - currentBox.x);
    let height = Math.abs(start.y - currentBox.y);
    console.log(start.x,start.y,currentBox.x,currentBox.y,'width, height')
    if (width > 5 && height > 5) {
      comments.value.push({ x, y, text: '', width, height, tempText:'' });
      editingComment.value = comments.value.length - 1;
      isWritingComment.value = true;
      updateTooltipPosition(editingComment.value);
    } else {
      isAddingComment.value = false;
    }

    start.x = 0;
    start.y = 0;
    currentBox.width = 0;
    currentBox.height = 0;
    currentBox.x = 0;
    currentBox.y = 0;
  }
};

const saveComment = (index: number) => {
  comments.value[index].text = comments.value[index].tempText;
  editingComment.value = null;
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDrawing.value || !isElement(event.currentTarget)) return;

  const container = event.currentTarget.getBoundingClientRect();
  const currentX = event.clientX - container.left;
  const currentY = event.clientY - container.top;

  currentBox.x = Math.min(start.x, currentX);
  currentBox.y = Math.min(start.y, currentY);
  currentBox.width = Math.abs(currentX - start.x);
  currentBox.height = Math.abs(currentY - start.y);

  if (currentX < start.x) {
    currentBox.x = currentX;
  }
  if (currentY < start.y) {
    currentBox.y = currentY;
  }

  if (isAddingComment.value && editingComment.value !== null) {
    updateTooltipPosition(editingComment.value);
  }
}

const cancelComment = (index: number) => {
  comments.value.splice(index, 1);
  isWritingComment.value = false;
};

const handleAddCommentClick = () => {
  if (editingComment.value !== null) {
    cancelComment(editingComment.value);
  }
  isAddingComment.value = !isAddingComment.value;
}

const handleFileChange = async (event: Event) => {
  if (!isHmtlInputElement(event.target) || !event.target.files || !event.target.files.length) return;

  const files = Array.from(event.target.files);

  isLoading.value = true;
  primaryButtonText.value = 'loading...';

  const fileReader = new FileReader();

  fileReader.onload = (event: ProgressEvent<FileReader>) => {
    if (!event.target) return;
    const { result } = event.target;
    if (typeof result !== 'string') return;
    backgroundImage.value = result;
    isLoading.value = false;
    isPictureSelected.value = true;
  };

  fileReader.readAsDataURL(files[0]);
  event.target.value = '';
}

</script>

<template>
  <header>
    <div class="wrapper">

    </div>
  </header>
  <div
    class="flex flex-col items-center justify-center min-h-screen overflow-auto bg-center bg-no-repeat transition-all duration-200 ease-in-out"
    :style="{ backgroundImage: `url('${backgroundImage}')`, cursor: isAddingComment ? 'crosshair' : 'default' }"
    @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp">
    <input type="file" class="hidden" ref="fileInput" accept="image/*" @change="handleFileChange" />
    <div :class="{ 'absolute bottom-0 right-0 mb-4 mr-4 flex flex-row gap-4': backgroundImage.length > 0 }">
      <Button :is-loading="isLoading" :type="secondaryButtonType" :class="{ hidden: isButtonHidden }"
        @click="handleAddCommentClick">{{ secondaryButtonText }}</Button>
      <Button :is-loading="isLoading" :type="primaryButtonType" @click="handleClick">{{ primaryButtonText }}</Button>
    </div>
    <div v-if="isDrawing"
      :style="{ position: 'absolute', left: `${currentBox.x}px`, top: `${currentBox.y}px`, width: `${currentBox.width}px`, height: `${currentBox.height}px`, border: '2px solid red' }">
    </div>
    <div v-for="(comment, index) in comments" :class="`comment-box-${index}`"
      :style="{ position: 'absolute', left: `${comment.x}px`, top: `${comment.y}px`, width: `${comment.width}px`, height: `${comment.height}px`, border: '2px solid red' }">
      <div v-if="editingComment === index" class="w-64 p-2 bg-yellow-100 rounded shadow-md"
        :class="`comment-tooltip-${index}`">
        <textarea v-model="comment.tempText" class="w-full h-20 p-2 bg-yellow-100 border-none resize-none" autofocus />
        <div class="flex gap-2">
          <Button type="primary" @click="saveComment(index)">Save</Button>
          <Button type="cancel" @click="cancelComment(index)">Cancel</Button>
        </div>
      </div>
      <div v-else class="w-64 p-2 bg-yellow-100 rounded shadow-md" :class="`comment-tooltip-${index}`">
        {{ comment.text }}
      </div>
    </div>
  </div>
</template>