<template>
  <div id="app" class="h-100">
    <debug-tools @directory-list-item-added="addDirectoryListItem"></debug-tools>
    <b-row class="h-100">
      <b-col cols="3" class="h-100 overflow-auto">
        <b-list-group>
          <b-list-group-item v-for="item in DirectoryListItems" :key="item.id">
            <directory-list-item
              :label="item.label"
              :done="item.done"
              :id="item.id"
              @directory-list-item-clicked="clickDirectoryListItem"
            ></directory-list-item>
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <b-col cols="9">
        <div v-html="msg">
          </div>
        <div class="h-100">
          <div>
            <b-tabs content-class="mt-3">
              <b-tab title="Template" active></b-tab>
              <b-tab title="Preview"></b-tab>
              <b-tab title="Data" disabled></b-tab>
            </b-tabs>
          </div>
          <editor class="h-100 w-100" v-model="msg" @init="editorInit" lang="html" theme="chrome"></editor>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import uniqueId from "lodash.uniqueid";
import DirectoryListItem from "./components/DirectoryListItem";
import DebugTools from "./components/DebugTools";
import fs from "fs";
require(["emmet/emmet"], function (data) {
  // this is huge. so require it async is better
  window.emmet = data.emmet;
});

export default {
  name: "App",
  components: {
    DebugTools,
    DirectoryListItem,
    editor: require("vue2-ace-editor"),
  },
  data() {
    return {
      rootDirectory:"",
      DirectoryListItems: [
        { id: uniqueId("todo-"), label: "Learn Vue", done: false },
      ],
      msg: "Pandas",
    };
  },
  methods: {
    addDirectoryListItem(DirectoryListItemLabel) {
      this.DirectoryListItems.push({
        id: uniqueId("todo-"),
        label: DirectoryListItemLabel,
        done: false,
      });
    },
    clickDirectoryListItem(DirectoryListItemLabel) {
      console.log("clickDirectoryListItem");
      this.msg = DirectoryListItemLabel;

      console.log(DirectoryListItemLabel);
      var output = "noodles";
      output = fs.readFileSync(DirectoryListItemLabel, "utf8", (err, data) => {
        if (err) throw err;
        //console.log(data);
        output = data;
      });

      console.log(output);
      this.msg = output;
    },
    editorInit() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); //snippet
    },
  },
};


</script>

<style>
#app {
}
</style>
