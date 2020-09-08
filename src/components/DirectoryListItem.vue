<template>
  <div v-on:click="isClicked">
    <input type="checkbox" :id="id" :checked="isVolatile" />
    <label class="text-nowrap" :for="id">iconName | {{label}}</label>
  </div>
</template>

<script>
import testeroni from "../utilitybelt.js";
export default {
  props: {
    label: { required: true, type: String },
    filePath: { required: true, type: String },
    volatile: { default: false, type: Boolean },
    id: { required: true, type: String },
    content: { required: false, type: String },
  },
  data() {
    return {
      isVolatile: this.volatile,
      iconName: testeroni(),
    };
  },
  methods: {
    isClicked() {
      this.$emit("asset-selected", this.id);
    },
  },
};
</script>
