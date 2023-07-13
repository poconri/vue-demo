<script lang="ts">
import { computed } from 'vue';

export type ButtonType = 'primary' | 'secondary' | 'cancel';

interface Props {
  type: ButtonType;
  isLoading?: boolean;
}

export default {
  props: {
    type: {
        type: String as () => ButtonType,
      default: 'primary',
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: Props) {
    const btnClass = computed(() => {
        if(props.isLoading) {
            return 'bg-gray-400 text-white px-4 py-2 rounded shadow hover:pointer-events-none cursor-not-allowed';
        } else {
            if (props.type === 'primary') {
              return 'bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-400';
            } else if (props.type === 'secondary') {
              return 'bg-white text-gray-800 border-1 border-gray-800 px-4 py-2 rounded shadow hover:bg-gray-100';
            } else if(props.type === 'cancel') {
              return 'bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-400';
            }
        }
    });


    return {
      btnClass,
    };
  },
};
</script>

<template>
    <button :class="btnClass">
      <slot></slot>
    </button>
  </template>