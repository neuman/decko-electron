<template>
  <div id="app" class="h-100">
    <b-row class="h-100">
      <b-col cols="3" class="h-100 overflow-auto">
        <b-list-group>
          <b-list-group-item v-for="item in DirectoryListItems" :key="item.id">
            <directory-list-item
              :label="item.label"
              :volatile="item.volatile"
              :id="item.id"
              :filePath="item.filePath"
              @directory-list-item-clicked="openFilePathInEditor"
            ></directory-list-item>
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <b-col cols="9">
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
//import DebugTools from "./components/DebugTools";
import fs from "fs";
const { dialog } = require("electron").remote;
require(["emmet/emmet"], function (data) {
  // this is huge. so require it async is better
  window.emmet = data.emmet;
});
const electron = require("electron");

export default {
  name: "App",
  components: {
    //DebugTools,
    DirectoryListItem,
    editor: require("vue2-ace-editor"),
  },
  created: function () {
    electron.ipcRenderer.on("openProject", (event, arg) => {
      this.openProjectDialog();
    });
    electron.ipcRenderer.on("newProject", (event, arg) => {
      this.newProjectDialog();
    });
    electron.ipcRenderer.on("saveOpenFile", (event, arg) => {
      this.saveOpenFile();
    });
    electron.ipcRenderer.on("importAllData", (event, arg) => {
      this.importAllDataDialog();
    });
  },
  data() {
    return {
      rootDirectoryPath: undefined,
      openFile: undefined,
      DirectoryListItems: [
        //{ id: uniqueId("todo-"), label: "Learn Vue", done: false },
      ],
      msg: "",
    };
  },
  methods: {
    newProjectDialog() {
      dialog
        .showOpenDialog({
          title: "Select an empty folder to create your new project in.",
          filters: [{ name: "Folders", extensions: ["*"] }],
          properties: ["openDirectory"],
        })
        .then((filenames) => {
          //console.log(filenames.filePaths[0]);
          var directoryPath = filenames.filePaths[0];
          this.rootDirectoryPath = directoryPath;
          //fs.mkdirSync(directoryPath+"/NewProject");
        });
    },
    openProjectDialog() {
      dialog
        .showOpenDialog({
          title: "Select your project folder.",
          filters: [{ name: "Folders", extensions: ["*"] }],
          properties: ["openDirectory"],
        })
        .then((filenames) => {
          //console.log(filenames.filePaths[0]);
          var directoryPath = filenames.filePaths[0];
          this.openProjectDirectory(directoryPath);
        });
    },
    openProjectDirectory(directoryPath) {
      fs.readdir(directoryPath, (err, files) => {
        if (err) console.log(err);
        else {
          console.log("\nCurrent directory filenames:");
          files.forEach((file) => {
            console.log(file);
            this.addDirectoryListItem(directoryPath, file);
          });
        }
      });
    },
    addDirectoryListItem(directoryPath, fileName) {
      this.DirectoryListItems.push({
        id: uniqueId("todo-"),
        label: fileName,
        filePath: directoryPath + "/" + fileName,
        volatile: false,
      });
    },
    openFilePathInEditor(filePath) {
      console.log("openFilePathInEditor", filePath);
      this.msg = filePath;
      this.openFile = filePath;

      console.log(filePath);
      var output = "NO DATA READ";
      output = fs.readFileSync(filePath, "utf8", (err, data) => {
        if (err) throw err;
        //console.log(data);
        output = data;
      });

      console.log(output);
      this.msg = output;
    },
    saveOpenFile() {
      fs.writeFileSync(this.openFile, this.msg);
      console.log("File written successfully\n");
    },
    importAllDataDialog() {
      dialog
        .showOpenDialog({
          title: "Select Your .json File.",
          filters: [{ name: ".json", extensions: ["json"] }],
          properties: ["openFile"],
        })
        .then((filenames) => {
          //console.log(filenames.filePaths[0]);
          var filePath = filenames.filePaths[0];
          var output = "NO DATA READ";
          output = fs.readFileSync(filePath, "utf8", (err, data) => {
            if (err) throw err;
            //console.log(data);
            output = data;
          });
          var jsonData = JSON.parse(output);
          for (var attributename in jsonData) {
            console.log(attributename + ": " + jsonData[attributename]);
            var componentDirectoryPath =
              this.rootDirectoryPath + "/" + attributename;
            //create folder
            fs.mkdirSync(componentDirectoryPath);
            //create data.json file
            fs.writeFileSync(
              componentDirectoryPath + "/data.json",
              JSON.stringify(jsonData[attributename])
            );
            //create empty template file
            fs.writeFileSync(componentDirectoryPath + "/template.html", "");
            //create empty css file
            fs.writeFileSync(componentDirectoryPath + "/styles.css", "");
          }
        });
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
