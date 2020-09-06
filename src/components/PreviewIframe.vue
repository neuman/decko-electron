<template>
  <webview v-bind:src="url" ref="iframeContent"></webview>
</template>
<script>
const { ipcRenderer } = require("electron");
export default {
  data() {
    return {
      url: "http://127.0.0.1:3000",
    };
  },
  methods: {
    reload(previewSrcURL) {
      this.$el.src = previewSrcURL;
    },
  },
  created: function () {
    ipcRenderer.on("setIframeURL", (event, arg) => {
      console.log("PreviewIframe reloadPreview", arg);
      this.url = arg;
    });
  },
  mounted() {
    /*
    addEventListener("contextmenu",(event) => {event.preventDefault();console.log("CAPTURED");},false);
    //this.$refs.iframeContent.openDevTools()
    console.log("this.$refs.iframeContent", this.$refs.iframeContent);
    this.$refs.iframeContent.addEventListener(
      "contextmenu",
      (event) => {
        event.preventDefault();
        console.log("CAPTURED");
      },
      false
    );
    */
  },
};
</script>
<style scoped>
webview {
  height: 100%;
  width: 100%;
}
</style>

