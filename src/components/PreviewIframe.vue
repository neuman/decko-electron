<template>
 <iframe v-bind:src="url"></iframe>
</template>
<script>
const { ipcRenderer } = require('electron')
export default {
  data() {
    return {
      url:"http://127.0.0.1:3000"
    };
  },
 methods: {
     reload(previewSrcURL) { this.$el.src = previewSrcURL; }
 },
  created: function() {
    ipcRenderer.on("setIframeURL", (event, arg) => {
        console.log("PreviewIframe reloadPreview", arg)
      this.url = arg;
    });
 }
}
</script>
<style scoped>
iframe { height: 100%; width:100%; }
</style>