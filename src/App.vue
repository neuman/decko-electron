<template>
  <div id="app" class="h-100">
    <b-row class="h-100">
      <b-col cols="3" class="h-100 overflow-auto">
        <b-list-group>
          <b-list-group-item v-for="item in Assets" :key="item.id">
            <asset-list-item
              :label="item.label"
              :category="item.category"
              :volatile="item.volatile"
              :id="item.id"
              :filePath="item.filePath"
              :depth="item.depth"
              @asset-selected="assetSelected"
            ></asset-list-item>
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <b-col cols="9">
        <div class="h-100">
          <editor class="h-100 w-100" v-model="msg" @init="editorInit" lang="html" theme="chrome"></editor>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import uniqueId from "lodash.uniqueid";
import AssetListItem from "./components/AssetListItem";
//import DebugTools from "./components/DebugTools";
import fs from "fs";
const { dialog } = require("electron").remote;
require(["emmet/emmet"], function (data) {
  // this is huge. so require it async is better
  window.emmet = data.emmet;
});
const electron = require("electron");

const assetCategories = {
  DIRECTORY: "directory",
  TEMPLATE: "template",
  STYLESHEET: "stylesheet",
  DATAFILE: "datafile",
  OTHER: "other",
};

export default {
  name: "App",
  components: {
    //DebugTools,
    AssetListItem,
    editor: require("vue2-ace-editor"),
  },
  created: function () {
    electron.ipcRenderer.on("openProject", (event, arg) => {
      this.openProjectDialog();
    });
    electron.ipcRenderer.on("newProject", (event, arg) => {
      this.newProjectDialog();
    });
    electron.ipcRenderer.on("saveProject", (event, arg) => {
      this.saveProject();
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
      selectedDirectoryListItem: undefined,
      openFile: undefined,
      Assets: [],
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
          title: "Select your project file.",
          filters: [{ name: "Decko File", extensions: ["dko"] }],
          properties: ["openFile"],
        })
        .then((filenames) => {
          //console.log(filenames.filePaths[0]);
          var filePath = filenames.filePaths[0];
          this.openProjectFile(filePath);
        });
    },
    openProjectFile(filePath){
      var output = "NO DATA READ";
      output = fs.readFileSync(filePath, "utf8", (err, data) => {
        if (err) throw err;
        //console.log(data);
        output = data;
      });
      this.Assets = JSON.parse(output);
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
        id: uniqueId("directoryListItem-"),
        label: fileName,
        filePath: directoryPath + "/" + fileName,
        volatile: false,
      });
    },
    addAsset(parent, category, directoryPath, fileName, label, depth) {
      var parentId = undefined;
      if (parent != undefined) {
        parentId = parent.id;
      }
      var output = {
        id: uniqueId("asset-"),
        parentId: parentId,
        category: category,
        label: label,
        fileName: fileName,
        filePath: directoryPath + "/" + fileName,
        active: true,
        singleton: false,
        depth:depth
      };
      this.Assets.push(output);
      return output;
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
    saveProject() {
      fs.writeFileSync(this.rootDirectoryPath+"/project.dko", JSON.stringify(this.Assets));
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
            var pieceDirectoryPath =
              this.rootDirectoryPath + "/" + attributename;
            //create Piece in state
            var newPiece = this.addAsset(
              undefined,
              assetCategories.DIRECTORY,
              pieceDirectoryPath,
              undefined,
              attributename,
              0
            );
            //create folder for piece
            console.log(pieceDirectoryPath);
            fs.mkdirSync(pieceDirectoryPath);

            //make add datafile to piece
            var newFileName = "data.json";
            this.addAsset(
              newPiece,
              assetCategories.DATAFILE,
              pieceDirectoryPath,
              newFileName,
              newFileName,
              1
            );
            //create data.json file
            fs.writeFileSync(
              pieceDirectoryPath + "/data.json",
              JSON.stringify(jsonData[attributename])
            );
            //add template to piece
            newFileName = "template.html";
            this.addAsset(
              newPiece,
              assetCategories.TEMPLATE,
              pieceDirectoryPath,
              newFileName,
              newFileName,
              1
            );
            //create empty template file
            fs.writeFileSync(pieceDirectoryPath + "/" + newFileName, "");

            //add style to piece
            newFileName = "style.css";
            this.addAsset(
              newPiece,
              assetCategories.STYLESHEET,
              pieceDirectoryPath,
              newFileName,
              newFileName,
              1
            );
            //create empty css file
            fs.writeFileSync(pieceDirectoryPath + "/"+newFileName, "");
          }
          console.log(this.Assets);
        });
    },
    assetSelected(id) {
      console.log("assetSelected", id)
      var match = this.Assets.find((obj) => {
        return obj.id === id;
      });
      //if it's a dir, expand it
      //if it's a file, open it in editor
      if (match.parentId != undefined) {
        console.log("openFilePathInEditor", match.filePath);
        this.openFilePathInEditor(match.filePath);
      }
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
