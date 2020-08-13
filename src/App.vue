<template>
  <div id="app">
    <debug-tools @directory-list-item-added="addDirectoryListItem"></debug-tools>
    <b-list-group>
      <b-list-group-item v-for="item in DirectoryListItems" :key="item.id">
        <directory-list-item :label="item.label" :done="item.done" :id="item.id"></directory-list-item>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import uniqueId from "lodash.uniqueid";
import DirectoryListItem from "./components/DirectoryListItem";
import DebugTools from "./components/DebugTools";

export default {
  name: "App",
  components: {
    DebugTools,
    DirectoryListItem,
  },
  data() {
    return {
      DirectoryListItems: [
      ],
    };
  },
  methods: {
    addDirectoryListItem(toDoLabel) {
      this.DirectoryListItems.push({
        id: uniqueId("todo-"),
        label: toDoLabel,
        done: false,
      });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
