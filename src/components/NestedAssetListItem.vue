<template>
  <div>
    <div v-on:click="isClicked">
      <div
        class="text-nowrap assetListItem"
        v-bind:style="{ 'padding-left': myIndentString + 'px' }"
        :for="label"
      >
        <font-awesome-icon :icon="getIcon" v-bind:style="{ color: getColor }" />
        {{ label }}
      </div>
    </div>
    <div v-for="item in children" :key="item.label">
      <nested-asset-list-item
        :label="item.label"
        :depth="getChildDepth"
        :isDirectory="item.isDirectory"
        :children="item.children"
        @asset-selected="childClicked"
      ></nested-asset-list-item>
    </div>
  </div>
</template>

<script>
import {
  assetCategories,
  assetFilenames,
  staticStrings,
  getAssetCategory,
} from "../utilitybelt.js";
import NestedAssetListItem from "./NestedAssetListItem.vue";
export default {
  props: {
    label: { required: true, type: String },
    depth: { required: true, type: Number },
    isDirectory: { required: true, type: Boolean },
    children: { required: true, type: Object },
  },
  name: "nested-asset-list-item",
  components: {
    NestedAssetListItem,
  },
  data() {
    return {
      myChildren: this.children,
      myIndentString: this.depth * 20,
      myExpanded: true,
    };
  },
  computed: {
    getChildDepth: function () {
      return this.depth + 1;
    },
    getIcon: function () {
      //console.log('getIcon category', this.category);
      var icString = "";
      if (this.isDirectory) {
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
      } else {
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
    this.category = getAssetCategory(this.label);
  },
  methods: {
    isClicked() {
      this.$emit("asset-selected", this.label);
    },
    childClicked(label) {
      this.$emit("asset-selected", label);
    },
  },
};
</script>
