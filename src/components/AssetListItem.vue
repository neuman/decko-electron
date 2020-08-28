<template>
  <div v-on:click="isClicked">
      <div class="text-nowrap" v-bind:style="{ 'padding-left': myIndentString+'px'}" :for="id">{{label}}</div>
  </div>
</template>

<script>
export default {
  props: {
    category: { required: true, type: String },
    label: { required: true, type: String },
    filePath: { required: true, type: String },
    volatile: { default: false, type: Boolean },
    id: { required: true, type: String },
    depth: { required: true, type: Number },
  },
  data() {
    return {
      myCategoty: this.category,
      myFilename: this.fileName,
      myfilePath: this.filePath,
      myVolatile: this.volatile,
      myId: this.id,
      myIndentCols: this.depth,
      myOutdentCols: 12 - this.depth,
      myIndentString: (this.depth*20)
    };
  },
  methods: {
    isClicked() {
      this.$emit("asset-selected", this.id);
    },
  },
};
</script>
