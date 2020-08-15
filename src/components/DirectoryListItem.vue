<template>
  <div v-on:click="isClicked">
    <input type="checkbox" :id="id" :checked="isVolatile" />
    <label class="text-nowrap" :for="id">{{label}}</label>
  </div>
</template>

<script>
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
    };
  },
  methods: {
    isClicked() {
      this.$emit("asset-selected", this.id);
    },
  },
};
</script>
