<template>
  <div>
    <div v-on:click="isClicked" v-on:contextmenu="isRightClicked">
      <div
        class="text-nowrap assetListItem defaultCursor unselectable"
        v-bind:id="getRelativeFilePath"
        v-bind:style="{ 'padding-left': (myIndentString + 'px'), 'background':getBackgroundColor }"
        :for="label"
      >
        <font-awesome-icon :icon="getIcon" v-bind:style="{ color: getColor }" />
        {{ label }}
      </div>
    </div>
    <div v-if="myExpanded == true">
      <div v-for="item in children" :key="item.label">
        <nested-asset-list-item
          :label="item.label"
          :relativeFilePath="item.relativeFilePath"
          :depth="getChildDepth"
          :isDirectory="item.isDirectory"
          :children="item.children"
          @asset-selected="childClicked"
          @asset-contexted="childRightClicked"
        ></nested-asset-list-item>
      </div>
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
    relativeFilePath: { required: true, type: String },
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
      myExpanded: false,
      myIsSelected:false,
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
        if (this.myExpanded) {
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
      } else if (this.category == assetCategories.MARKDOWN) {
        icString = "file-alt";
      } else {
        icString = "file";
      }
      return icString;
    },
    getBackgroundColor: function () {
       return "transparent";
      /*if(this.myIsSelected){
        return "purple";
      }else{
      return "transparent";
      }*/
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
      } else if (this.category == assetCategories.TEXT) {
        icColor = "hotpink";
      }else if (this.category == assetCategories.MARKDOWN) {
        icColor = "mediumblue";
      } else {
        icColor = "#fff";
      }
      return icColor;
    },
    getRelativeFilePath: function () {
      return this.relativeFilePath;
    },
  },
  created: function () {
    //this.assignColorIcon();
    this.category = getAssetCategory(this.label);
    if(this.depth == 0){
      this.myExpanded = true;
    }
  },
  methods: {
    isClicked() {
      if (this.isDirectory) {
        this.myExpanded = !this.myExpanded;
      } else {
        this.$emit("asset-selected", this.relativeFilePath);
        this.myIsSelected = true;
        console.log("this.$parent",this.$parent);
      }
    },
    childClicked(relativeFilePath) {
      this.$emit("asset-selected", relativeFilePath);
    },
    childRightClicked(relativeFilePath) {
      this.$emit("asset-contexted", relativeFilePath);
    },
    isRightClicked(e) {
      console.log("isRightClicked");
        this.$emit("asset-contexted", this.relativeFilePath);
      e.preventDefault();
    },
  },
};
</script>
