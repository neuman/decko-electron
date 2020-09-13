<template>
  <div v-if="myActive == true" v-on:click="isClicked">
    <div class="text-nowrap assetListItem" v-bind:class="{ assetListItemActive: myActive}" v-bind:style="{ 'padding-left': myIndentString+'px'}" :for="id">
      <font-awesome-icon :icon="myIconString" v-bind:style="{ 'color': myIconColor}"/>
      {{label}}
    </div>
  </div>
</template>

<script>
import {
  assetCategories,
  assetFilenames,
  staticStrings,
} from "../utilitybelt.js";
export default {
  props: {
    category: { required: true, type: String },
    label: { required: true, type: String },
    filePath: { required: true, type: String },
    volatile: { default: false, type: Boolean },
    id: { required: true, type: String },
    depth: { required: true, type: Number },
    active: { default: true, type: Boolean },
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
      myIndentString: this.depth * 20,
      myIconColor: "#000",
      myIconString: "faFile",
      myActive: this.active,
    };
  },
  created: function () {
    this.assignColorIcon();
  },
  methods: {
    isClicked() {
      this.$emit("asset-selected", this.id);
    },
    assignColorIcon() {
      if (this.category == assetCategories.DIRECTORY) {
        this.myIconColor = "#fff";
        this.myIconString = "chevron-down";
      } else if (this.category == assetCategories.TEMPLATE) {
        this.myIconColor = "coral";
        this.myIconString = "code";
      } else if (this.category == assetCategories.STYLESHEET) {
        this.myIconColor = "lightskyblue";
        this.myIconString = "hashtag";
      } else if (this.category == assetCategories.DATAFILE) {
        this.myIconColor = "lightgreen";
        this.myIconString = "database";
      } else {
        this.myIconColor = "#fff";
        this.myIconString = "file";
      }
    },
  },
};
</script>
