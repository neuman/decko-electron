<template>
  <div v-if="visible == true" v-on:click="isClicked">
    <div
      class="text-nowrap assetListItem"
      v-bind:class="{ assetListItemActive: myActive}"
      v-bind:style="{ 'padding-left': myIndentString+'px'}"
      :for="id"
    >
      <font-awesome-icon :icon="getIcon" v-bind:style="{ 'color': getColor}" />
      {{label}}
    </div>
  </div>
</template>

<script>
//import func from '../../../testvue/hello-world/vue-temp/vue-editor-bridge.js';
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
    active: { default: false, type: Boolean },
    expanded: { required: true, default: true, type: Boolean },
    visible: { required: true, default: true, type: Boolean },
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
      myExpanded: this.expanded,
      myVisible: this.visible,
    };
  },
  computed: {
    getIcon: function () {
      var icString = "";
      if (this.category == assetCategories.DIRECTORY) {
        if (this.expanded) {
          icString = "chevron-down";
        } else {
          icString = "chevron-right";
        }
      } else if (this.category == assetCategories.TEMPLATE) {
        icString = "code";
      } else if (this.category == assetCategories.STYLESHEET) {
        icString = "hashtag";
      } else if (this.category == assetCategories.DATAFILE) {
        icString = "database";
      } else if (this.category == assetCategories.IMAGE) {
        icString = "image";
      } else if (this.category == assetCategories.BOX) {
        icString = "cube";
      } else if (this.category == assetCategories.JSON) {
        icString = "file-code";
      } else if (this.category == assetCategories.TEXT) {
        icString = "file-alt";
      }else {
        icString = "file";
      }
      return icString;
    },
    getColor: function () {
      var icColor = "";
      if (this.category == assetCategories.DIRECTORY) {
        icColor = "#fff";
      } else if (this.category == assetCategories.TEMPLATE) {
        icColor = "coral";
      } else if (this.category == assetCategories.STYLESHEET) {
        icColor = "lightskyblue";
      } else if (this.category == assetCategories.DATAFILE) {
        icColor = "lightgreen";
      } else if (this.category == assetCategories.IMAGE) {
        icColor = "teal";
      } else if (this.category == assetCategories.BOX) {
        icColor = "goldenrod";
      } else {
        icColor = "#fff";
      }
      return icColor;
    },
  },
  created: function () {
    //this.assignColorIcon();
  },
  methods: {
    isClicked() {
      this.$emit("asset-selected", this.id);
    },
  },
};
</script>
