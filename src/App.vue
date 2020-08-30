<template>
  <div id="app" class="h-100">
    <splitpanes class="default-theme">
      <pane size="15" class="bg-dark overflow-y-handled">
        <div v-for="item in Assets" :key="item.id">
          <asset-list-item
            :label="item.label"
            :category="item.category"
            :volatile="item.volatile"
            :id="item.id"
            :filePath="item.filePath"
            :depth="item.depth"
            @asset-selected="assetSelected"
          ></asset-list-item>
        </div>
      </pane>
      <pane class="bg-dark">
        <b-modal ref="my-modal" title="Are You Sure?" @ok="importAllDataDialog">
          <div class="d-block text-center">
            <p
              class="my-4"
            >Importing will wipe out all old data and replace it with the incoming data file contents.</p>
          </div>
        </b-modal>

        <div class="h-100" v-if="this.selectedDirectoryListItem != undefined">
          <div class="h-100" v-if="this.selectedDirectoryListItem.category == 'template'">
            <codemirror class="h-100" v-model="msg" :options="cmOptions"></codemirror>
          </div>
          <div class="h-100" v-else-if="this.selectedDirectoryListItem.category == 'datafile'">
            <hot-table :settings="hotSettings" ref="deckoTable"></hot-table>
          </div>
          <div
            style="height:100%; width:100%;"
            v-else-if="this.selectedDirectoryListItem.category == 'directory'"
          >
            <preview-iframe style="height:100%; width:100%;"></preview-iframe>
          </div>
          <div style="height:100%; width:100%;" v-else>No Content</div>
        </div>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
const Handlebars = require("handlebars");
var markdown = require("helper-markdown");
Handlebars.registerHelper("markdown", markdown({}));

import uniqueId from "lodash.uniqueid";
import AssetListItem from "./components/AssetListItem";
import PreviewIframe from "./components/PreviewIframe";
import fs from "fs";
const { dialog } = require("electron").remote;
const electron = require("electron");
import { codemirror } from "vue-codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/htmlmixed/htmlmixed.js";
import "codemirror/theme/tomorrow-night-eighties.css";
import { HotTable } from "@handsontable/vue";
import Handsontable from "handsontable";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
const createHtmlElement = require("create-html-element");
var MarkdownIt = require("markdown-it");
var path = require("path");

const assetCategories = {
  DIRECTORY: "directory",
  TEMPLATE: "template",
  STYLESHEET: "stylesheet",
  DATAFILE: "datafile",
  OTHER: "other",
};

const assetFilenames = {
  DIRECTORY: "",
  TEMPLATE: "template.html",
  STYLESHEET: "stylesheet.css",
  DATAFILE: "datafile.json",
};

const staticStrings = {
  DECKODIRNAME: "decko",
};

export default {
  name: "App",
  components: {
    PreviewIframe,
    AssetListItem,
    codemirror,
    HotTable,
    Splitpanes,
    Pane,
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
      this.showImportAllWarning();
    });
    electron.ipcRenderer.on("exportOpenFile", (event, arg) => {
      this.exportOpenFile();
    });
    electron.ipcRenderer.on("debugAction", (event, arg) => {
      this.debugAction();
    });
  },
  data() {
    return {
      rootDirectoryPath: undefined,
      selectedDirectoryListItem: undefined,
      openFile: undefined,
      Assets: [],
      msg: undefined,
      preview: undefined,
      spreadsheet: undefined,
      hotSettings: {
        licenseKey: "non-commercial-and-evaluation",
        //colHeaders: ["", "Ford", "Volvo", "Toyota", "Honda"],
      },
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: "htmlmixed",
        theme: "tomorrow-night-eighties",
        lineNumbers: true,
        line: true,
      },
    };
  },
  methods: {
    debugAction() {
      this.showImportAllWarning();
      electron.ipcRenderer.on("asynchronous-reply", (event, arg) => {
        console.log(arg); // prints "pong"
      });
      electron.ipcRenderer.send("asynchronous-message", "ping");
    },
    loadFile(filePath, absoloute) {
      var myPath = filePath;
      if (absoloute != true) {
        myPath = path.join(this.rootDirectoryPath, filePath);
      }
      var output = undefined;
      output = fs.readFileSync(myPath, "utf8", (err, data) => {
        if (err) throw err;
        //console.log(data);
        output = data;
      });
      return output;
    },
    exportOpenFile() {
      this.assetSelectedForExport(this.selectedPieceId);
    },
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
          this.saveProject();
          fs.mkdirSync(
            path.join(this.rootDirectoryPath, staticStrings.DECKODIRNAME)
          );
          electron.ipcRenderer.send(
            "project-file-opened",
            this.rootDirectoryPath
          );
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
          this.rootDirectoryPath = path.dirname(filePath);
          this.openProjectFile(filePath);
        });
    },
    openProjectFile(filePath) {
      this.Assets = JSON.parse(this.loadFile(filePath, true));
      //if this is a different os, adjust the paths
      if (this.sep != path.sep) {
        this.Assets.forEach((element) => {
          element.filePath = element.filePath.split(element.sep).join(path.sep);
          element.sep = path.sep;
        });
      }

      electron.ipcRenderer.send("project-file-opened", path.dirname(filePath));
    },
    /*openProjectDirectory(directoryPath) {
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
    },*/
    addDirectoryListItem(directoryPath, fileName) {
      this.DirectoryListItems.push({
        id: uniqueId("directoryListItem-"),
        label: fileName,
        filePath: path.join(directoryPath, fileName),
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
        filePath: path.join(directoryPath, fileName),
        sep: path.sep,
        active: true,
        singleton: false,
        depth: depth,
      };
      this.Assets.push(output);
      return output;
    },
    openFilePathInEditor(filePath) {
      console.log(
        "openFilePathInEditor",
        path.join(this.rootDirectoryPath, filePath)
      );
      this.msg = filePath;
      this.openFile = filePath;
      var output = "NO DATA READ";
      output = fs.readFileSync(
        path.join(this.rootDirectoryPath, filePath),
        "utf8",
        (err, data) => {
          if (err) throw err;
          //console.log(data);
          output = data;
        }
      );

      //console.log(output);
      this.msg = output;
    },
    jsonArrayTo2D(arrayOfObjects) {
      let header = [],
        AoA = [];
      arrayOfObjects.forEach((obj) => {
        Object.keys(obj).forEach(
          (key) => header.includes(key) || header.push(key)
        );
        let thisRow = new Array(header.length);
        header.forEach((col, i) => (thisRow[i] = obj[col] || ""));
        AoA.push(thisRow);
      });
      AoA.unshift(header);
      return AoA;
    },
    openFilePathInSpreadSheet(filePath) {
      console.log("openFilePathInSpreadSheet", filePath);
      this.openFile = filePath;

      console.log(filePath);
      var output = this.loadFile(filePath);
      //console.log(output);

      this.spreadsheet = this.jsonArrayTo2D(JSON.parse(output));
      if (this.$refs.deckoTable != undefined) {
        this.$refs.deckoTable.hotInstance.loadData(this.spreadsheet);
      }
      console.log(this.spreadsheet);
    },
    saveOpenFile() {
      fs.writeFileSync(
        path.join(this.rootDirectoryPath, this.openFile),
        this.msg
      );
      console.log("File written successfully\n");
    },
    saveProject() {
      fs.writeFileSync(
        path.join(this.rootDirectoryPath, "project.dko"),
        JSON.stringify(this.Assets, 4, " ")
      );
      console.log("File written successfully\n");
    },
    showImportAllWarning() {
      console.log(this.Assets);
      if (this.Assets.length > 0) {
        this.$refs["my-modal"].show();
      } else {
        this.importAllDataDialog();
      }
    },
    buildPieceFromData(pieceData) {
      var block = "";
      var p = pieceData[0];
      for (var key in p) {
          console.log(key + " -> " + p[key]);
          block += "\t<p>\n\t\t<span class='badge badge-primary'>"+key+"</span>{{ "+key+" }}\n\t</p>\n";
      }
      return "<div class='card' style='width:2.5in; height:3.5in;'>\n"+block+"\n</div>"
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
          var jsonData = JSON.parse(this.loadFile(filePath, true));
          this.Assets = [];
          for (var attributename in jsonData) {
            var pieceDirectoryPath = path.join(
              staticStrings.DECKODIRNAME,
              attributename
            );
            //create Piece in state
            var newPiece = this.addAsset(
              undefined,
              assetCategories.DIRECTORY,
              pieceDirectoryPath,
              assetFilenames.DIRECTORY,
              attributename,
              1
            );
            //create folder for piece if it doesn't exist
            console.log(pieceDirectoryPath);
            if (
              fs.existsSync(
                path.join(this.rootDirectoryPath, pieceDirectoryPath)
              ) != true
            ) {
              fs.mkdirSync(
                path.join(this.rootDirectoryPath, pieceDirectoryPath)
              );
            }

            //make add datafile to piece
            var newFileName = assetFilenames.DATAFILE;
            var newFilePath = path.join(pieceDirectoryPath, newFileName);
            this.addAsset(
              newPiece,
              assetCategories.DATAFILE,
              pieceDirectoryPath,
              newFileName,
              newFileName,
              2
            );
            //create data.json file
            fs.writeFileSync(
              path.join(this.rootDirectoryPath, newFilePath),
              JSON.stringify(jsonData[attributename], 4, " ")
            );
            //add template to piece
            newFileName = assetFilenames.TEMPLATE;
            this.addAsset(
              newPiece,
              assetCategories.TEMPLATE,
              pieceDirectoryPath,
              newFileName,
              newFileName,
              2
            );
            //create empty template file
            newFilePath = path.join(
              this.rootDirectoryPath,
              pieceDirectoryPath,
              newFileName
            );
            if (fs.existsSync(newFilePath) != true) {
              fs.writeFileSync(newFilePath, this.buildPieceFromData(jsonData[attributename]));
            }

            //add style to piece
            newFileName = assetFilenames.STYLESHEET;
            this.addAsset(
              newPiece,
              assetCategories.STYLESHEET,
              pieceDirectoryPath,
              newFileName,
              newFileName,
              2
            );
            //create empty css file
            newFilePath = path.join(
              this.rootDirectoryPath,
              pieceDirectoryPath,
              newFileName
            );
            if (fs.existsSync(newFilePath) != true) {
              fs.writeFileSync(newFilePath, "");
            }
          }
          this.saveProject();
          console.log(this.Assets);
        });
    },
    search(input) {
      return Object.keys(this).every((key) => input[key] === this[key]);
    },
    searchAssets(query) {
      return this.Assets.filter(this.search, query);
    },
    assetSelected(id) {
      console.log("assetSelected", id);
      this.selectedDirectoryListItem = this.getAssetById(id);
      this.assetRender(id, false);
    },
    assetSelectedForExport(id) {
      this.assetRender(id, true);
    },
    getAssetById(id) {
      var match = this.Assets.find((obj) => {
        return obj.id === id;
      });
      return match;
    },
    assetRender(id, doExport) {
      var match = this.getAssetById(id);

      //if it's a dir, expand it
      //if it's a file, open it in editor
      if (match.parentId == undefined) {
        //get template and read it
        this.selectedPieceId = match.id;
        //var templateFilePath = this.Assets.filter(({ parentId, category }) => parentId == id && category == assetCategories.template);
        var templateFilePath = undefined;
        this.Assets.forEach((element) => {
          if (
            element.parentId == id &&
            element.category == assetCategories.TEMPLATE
          ) {
            templateFilePath = element.filePath;
          }
        });
        console.log("templateFilePath", templateFilePath);
        var templateContent = this.loadFile(templateFilePath);

        //get datafile filePath
        var datafileFilePath = undefined;
        this.Assets.forEach((element) => {
          if (
            element.parentId == id &&
            element.category == assetCategories.DATAFILE
          ) {
            datafileFilePath = element.filePath;
          }
        });
        console.log("datafileFilePath", datafileFilePath);

        //read datafile
        var datafileContent = JSON.parse(this.loadFile(datafileFilePath));
        console.log(
          "rendering template ",
          templateFilePath,
          "with data ",
          datafileFilePath
        );
        this.preview = "";
        console.log("templateContent", templateContent);
        var template = Handlebars.compile(templateContent);
        datafileContent.forEach((element) => {
          this.preview += template(element);
        });

        electron.ipcRenderer.send(
          "piece-preview-opened",
          this.preview,
          doExport
        );
        //console.log("rendered html", this.preview);
      } else {
        this.selectedPieceId = match.parentId;
        this.preview = undefined;
        if (match.filePath.split(".").pop() == "json") {
          this.openFilePathInSpreadSheet(match.filePath);
        } else {
          console.log("openFilePathInEditor", match.filePath);
          this.openFilePathInEditor(match.filePath);
        }
      }
    },
  },
};
</script>

<style>
.CodeMirror {
  height: 100%;
  max-height: 100%;
}
</style>

<style src="../node_modules/handsontable/dist/handsontable.full.css"></style>

