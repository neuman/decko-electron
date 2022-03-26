<template>

  <div id="app" class="h-100">
    <b-modal ref="import-modal" title="Are You Sure?" @ok="importAllDataDialog">
      <div class="d-block text-center">
        <p class="my-4">
          Importing will wipe out all old data and replace it with the incoming
          data file contents.
        </p>
      </div>
    </b-modal>
    <b-modal
      id="modal-prevent-closing"
      ref="new-project-modal"
      title="Submit Your Name"
      @show="resetModal"
      @hidden="resetModal"
      @ok="handleOk"
    >
      <form ref="form" @submit.stop.prevent="newProjectHandleSubmit">
        <b-form-group
          :state="nameState"
          label="Name"
          label-for="name-input"
          invalid-feedback="Name is required"
        >
          <b-form-input
            id="name-input"
            v-model="name"
            :state="nameState"
            required
          ></b-form-input>
        </b-form-group>
      </form>
    </b-modal>
    <splitpanes v-if="rootDirectoryPath" class="default-theme">
      <pane size="30" class="bg-light overflow-y-handled">
        <nested-asset-list-item
          :label="Files.label"
          :relativeFilePath="Files.relativeFilePath"
          :fileName="Files.fileName"
          :depth="0"
          :children="Files.children"
          :category="Files.category"
          :isDirectory="Files.isDirectory"
          @asset-selected="assetSelected"
        ></nested-asset-list-item>
      </pane>
      <pane class="bg-dark">
        <div class="h-100" v-if="this.selectedDirectoryListItem != undefined">
          <div
            class="h-100"
            v-if="
              ['box', 'template', 'stylesheet'].includes(
                this.selectedDirectoryListItem.category
              )
            "
          >
            <splitpanes
              class="default-theme"
              @resize="handlePaneEvent('resize', $event)"
              @resized="handlePaneEvent('resized', $event)"
            >
              <pane>
                <codemirror
                  ref="editor"
                  class="h-100"
                  v-model="msg"
                  :options="cmOptions"
                ></codemirror>
              </pane>
              <pane>
                <div
                  v-if="paneDragging"
                  style="
                    position: fixed;
                    width: 100%;
                    height: 100%;
                    z-index: 100;
                  "
                ></div>
                <preview-iframe
                  ref="iframeContent"
                  style="height: 100%; width: 100%; border: none"
                ></preview-iframe>
              </pane>
            </splitpanes>
          </div>
          <div
            class="h-100"
            v-else-if="this.selectedDirectoryListItem.category == 'deprecated_datafile'"
          >
            <div>
              <b-navbar toggleable="lg" type="dark" sticky="true">
                <b-tabs content-class="mt-3">
                  <div v-for="item in DataSheets" :key="item.id">
                    <data-sheet-tab
                      :label="item.label"
                      :id="item.id"
                      :active="item.active"
                      @data-sheet-selected="dataSheetSelected"
                    ></data-sheet-tab>
                  </div>
                </b-tabs>
              </b-navbar>
            </div>
            <hot-table
              :settings="hotSettings"
              :data="spreadsheet"
              ref="deckoTable"
            ></hot-table>
          </div>
          <div
            class="h-100"
            v-if="
              ['datafile', 'stylesheet', 'json', 'text'].includes(
                this.selectedDirectoryListItem.category
              )
            "
          >
            <codemirror
              ref="editor"
              class="h-100"
              v-model="msg"
              :options="cmOptions"
            ></codemirror>
          </div>
          <div
            class="h-100 checkered"
            v-else-if="this.selectedDirectoryListItem.category == 'image'"
          >
            <v-zoomer style="width: 100%; height: 100%">
              <img
                v-bind:src="this.selectedLocalFile"
                style="object-fit: contain; width: 100%; height: 100%"
              />
            </v-zoomer>
          </div>
          <div
            style="height: 100%; width: 100%"
            v-else-if="this.selectedDirectoryListItem.category == 'directory'"
          >
            <preview-iframe
              ref="iframeContent"
              style="height: 100%; width: 100%; border: none"
            ></preview-iframe>
          </div>
          <div style="height: 100%; width: 100%" v-else>
            Decko Can't Open This File. Please navigate to it in your file
            explorer to view or modify.
          </div>
        </div>
      </pane>
    </splitpanes>
    <div v-else class="text-center">
      <img v-bind:src="require('./assets/decko-logo.png')" />
      <p> Use the File menu to create a new project or open an existing one.</p>
    </div>
  </div>
</template>
1
<script>
const Handlebars = require("handlebars");
var $ = require("jquery");
var markdown = require("helper-markdown");
Handlebars.registerHelper("markdown", markdown({}));
Handlebars.registerHelper("if_eq", function (a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});
Handlebars.registerHelper("if_gte", function (a, b, opts) {
  if (a >= b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});
Handlebars.registerHelper("if_lte", function (a, b, opts) {
  if (a <= b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});
import Vue from "vue";
import uniqueId from "lodash.uniqueid";
import NestedAssetListItem from "./components/NestedAssetListItem";
import DataSheetTab from "./components/DataSheetTab";
import PreviewIframe from "./components/PreviewIframe";
import fs from "fs";
const { dialog } = require("electron").remote;
const electron = require("electron");
import { codemirror } from "vue-codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/htmlmixed/htmlmixed.js";
import "codemirror/mode/javascript/javascript.js";
import "codemirror-formatting";
import "codemirror/addon/edit/matchtags.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/search.js";
import "codemirror/addon/dialog/dialog.js";
import "codemirror/addon/dialog/dialog.css";
import "./theme/decko_codemirror.css";
import { HotTable } from "@handsontable/vue";
import Handsontable from "handsontable";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import VueZoomer from "vue-zoomer";
const createHtmlElement = require("create-html-element");
var MarkdownIt = require("markdown-it");
var path = require("path");
var chokidar = require("chokidar");
var ls = require("list-directory-contents");

const { remote, webFrame } = require("electron");
const { getCurrentWebContents, Menu, MenuItem } = remote;
//
let rightClickPosition;
//
const contextMenu = new Menu();
const menuItem = new MenuItem({
  label: "Inspect Element",
  click: () => {
    let factor = webFrame.getZoomFactor();
    let x = Math.round(rightClickPosition.x * factor);
    let y = Math.round(rightClickPosition.y * factor);
    getCurrentWebContents().inspectElement(x, y);
  },
});
console.log("Menu.getApplicationMenu()", Menu.getApplicationMenu());
//
/*window.addEventListener(
  "contextmenu",
  (event) => {
    event.preventDefault();
    rightClickPosition = { x: event.x, y: event.y };
    contextMenu.popup();
  },
  false
);*/
import {
  assetCategories,
  assetFilenames,
  staticStrings,
  assetCategoryExtensions,
  getAssetCategory,
  getFileExtension,
} from "./utilitybelt.js";
import { dirname } from "path";
//import func from "../../testvue/hello-world/vue-temp/vue-editor-bridge";
Vue.use(VueZoomer);
export default {
  name: "App",
  components: {
    PreviewIframe,
    NestedAssetListItem,
    DataSheetTab,
    codemirror,
    HotTable,
    Splitpanes,
    Pane,
  },
  created: function () {
    if (process.env.NODE_ENV == "development") {
      //this.openProjectFile("/home/neuman/TEST/project.dko");
    }
    /*console.log("__dirname", __dirname);
    console.log("process.cwd()", process.cwd());
    var asarPath = this.getPublicPath("test.txt");
    fs.readdir(__dirname, function (err, items) {
      console.log(items);

      for (var i = 0; i < items.length; i++) {
        console.log(items[i]);
      }
    });

    console.log("asarPath", asarPath);
    console.log(this.loadFile(asarPath, true));*/
    electron.ipcRenderer.removeAllListeners("openProject");
    electron.ipcRenderer.on("openProject", (event, arg) => {
      this.openProjectDialog();
    });
    electron.ipcRenderer.removeAllListeners("newFile");
    electron.ipcRenderer.on("newFile", (event, arg) => {
      this.newFileDialog();
    });
    electron.ipcRenderer.removeAllListeners("newProject");
    electron.ipcRenderer.on("newProject", (event, arg) => {
      //this.newProjectDialog();
      this.newProjectDialog();
    });
    electron.ipcRenderer.removeAllListeners("saveProject");
    electron.ipcRenderer.on("saveProject", (event, arg) => {
      this.saveProject();
    });
    electron.ipcRenderer.removeAllListeners("saveOpenFile");
    electron.ipcRenderer.on("saveOpenFile", (event, arg) => {
      this.saveOpenFile();
    });
    electron.ipcRenderer.removeAllListeners("importAllData");
    electron.ipcRenderer.on("importAllData", (event, arg) => {
      this.showImportAllWarning();
    });
    electron.ipcRenderer.removeAllListeners("exportOpenFile");
    electron.ipcRenderer.on("exportOpenFile", (event, arg) => {
      this.exportOpenFile();
    });
    electron.ipcRenderer.removeAllListeners("magnetizeOpenFile");
    electron.ipcRenderer.on("magnetizeOpenFile", (event, arg) => {
      this.magnetizeOpenFile();
    });
    electron.ipcRenderer.removeAllListeners("toggleLineWrapping");
    electron.ipcRenderer.on("toggleLineWrapping", (event, arg) => {
      this.toggleLineWrapping();
    });
    electron.ipcRenderer.removeAllListeners("formatOpenFile");
    electron.ipcRenderer.on("formatOpenFile", (event, arg) => {
      this.formatOpenFile();
    });
    electron.ipcRenderer.removeAllListeners("debugAction");
    electron.ipcRenderer.on("debugAction", (event, arg) => {
      this.debugAction();
    });
    electron.ipcRenderer.removeAllListeners("openWebViewDevTools");
    electron.ipcRenderer.on("openWebViewDevTools", (event, arg) => {
      document.querySelector("webview").openDevTools({ mode: 'undocked' });
    });
  },
  updated() {
    //only fire when iframe is present
    /*if(this.$refs.iframeContent != undefined){
        console.log("this.$refs.iframeContent", this.$refs.iframeContent)
        this.$refs.iframeContent.$refs.iframeContent.addEventListener(
          "contextmenu",
          (event) => {
            event.preventDefault();
            rightClickPosition = { x: event.x, y: event.y };
            console.log("CAPTURED")
            contextMenu.popup();
          },
          false
        );
    }*/
  },
  data() {
    return {
      rootDirectoryPath: undefined,
      selectedDirectoryListItem: undefined,
      projectName:undefined,
      name:undefined,
      nameState:undefined,
      openFile: undefined,
      Assets: [],
      Files: {},
      DataSheets: [],
      msg: undefined,
      spreadsheet: undefined,
      hotSettings: {
        licenseKey: "non-commercial-and-evaluation",
        ManualColumnResize: true,
        //colHeaders: ["", "Ford", "Volvo", "Toyota", "Honda"],
      },
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: "htmlmixed",
        theme: "tomorrow-night-eighties",
        lineNumbers: true,
        line: true,
        lineWrapping: true,
        matchTags: { bothTags: true },
      },
      previewOptions: {
        doExport: false,
        doMagnetize: false,
        html: undefined,
      },
      paneDragging: false,
    };
  },
  methods: {
    checkFormValidity() {
        const valid = this.$refs.form.checkValidity()
        this.nameState = valid
        return valid
      },
      resetModal() {
        this.name = ''
        this.nameState = null
      },
      handleOk(bvModalEvt) {
        // Prevent modal from closing
        bvModalEvt.preventDefault()
        // Trigger submit handler
        this.newProjectHandleSubmit()
      },
      newProjectHandleSubmit() {
        // Exit when the form isn't valid
        if (!this.checkFormValidity()) {
          return
        }
        // Push the name to submitted names
        //this.submittedNames.push(this.name)
        this.projectName = this.name;
        this.newProjectDialog();
        // Hide the modal manually
        this.$nextTick(() => {
          this.$bvModal.hide('modal-prevent-closing')
        })
      },
    debugAction() {
      console.log(electron.ipcRenderer.sendSync("get-text-asset", {filePath:"project.css"}));
      //console.log(this.Assets);
      //this.$refs.editor.codemirror.clearHistory();
      //console.log("this", this);
      //getCurrentWebContents().send("setIframeURL", "http://www.google.com");
      //console.log(this.Assets);
      /*
      console.log("global.__l", global.__static);
      console.log(
        this.loadFile(path.join(global.__static, "public", "milkcrate.js"))
      );
      electron.ipcRenderer.on("asynchronous-reply", (event, arg) => {
        console.log(arg); // prints "pong"
      });
      electron.ipcRenderer.send("asynchronous-message", "ping");*/
    },
    extractBlocks(html, blocks) {
      //regex: {{\s?(#block+ )?head\s?}}(.|[\s\S]){{\s?\/(block)?\s?}}
      let re = /{{\s?#block\s?([a-z]*)\s?}}(.*|[\s\S]*){{\s?\/block?\s?}}/g;
      var output = {};
      //for each block
      blocks.forEach((block) => {
        let match = re.exec(html);
        do {
          if (match != undefined) {
            //console.log("block", match[1], match[2]);
            output[block] = match[2];
            output["html"] = html.replace(match[0], "");
          } else {
            output["html"] = html;
            output["head"] = "";
          }
        } while ((match = re.exec(html)) !== null);
        //copy contents of block to output
        //delete block from html
      });
      return output;
    },
    getPublicPath(relativePath) {
      if (remote.app.isPackaged === false) {
        return path.join(process.cwd(), "public", relativePath);
      } else {
        return path.join(__dirname, relativePath);
      }
    },
    handlePaneEvent(name, event) {
      //(name, event);
      if (name == "resize") {
        this.paneDragging = true;
      } else {
        this.paneDragging = false;
      }
    },
    handleFileChange(filePath) {
      console.log("fileChange", filePath);
    },
    toggleLineWrapping() {
      console.log("toggle lineWrapping to ", !this.cmOptions.lineWrapping);
      this.cmOptions.lineWrapping = !this.cmOptions.lineWrapping;
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
      this.previewOptions.doExport = true;
      this.assetSelected(
        this.selectedDirectoryListItem.relativeFilePath,
        this.previewOptions
      );
      this.previewOptions.doExport = false;
    },
    magnetizeOpenFile() {
      this.previewOptions.doExport = false;
      this.previewOptions.doMagnetize = !this.previewOptions.doMagnetize;
      this.assetSelected(
        this.selectedDirectoryListItem.relativeFilePath,
        this.previewOptions
      );
    },
    formatOpenFile() {
      if (this.$refs.editor != undefined) {
        console.log(this.$refs.editor);
        //this.$refs.editor.codemirror.clearHistory();
        //this.$refs.editor.codemirror.selectAll();
        this.$refs.editor.codemirror.autoFormatRange(
          this.$refs.editor.codemirror.getCursor(true),
          this.$refs.editor.codemirror.getCursor(false)
        );
      }
    },
    newProjectDialog() {
      //
      dialog
        .showSaveDialog({
          title: "Select which directory to create your new project in.",
          properties: ["createDirectory"],
        })
        .then((results) => {
          console.log("newProject:", results.filePath);
          var directoryPath =  path.dirname(results.filePath);
          //this.projectName = results.filePath;
          this.rootDirectoryPath = results.filePath;
          /*fs.mkdirSync(results.filePath);
          fs.writeFileSync(results.filePath+"/project.dkod", JSON.stringify({}));
          fs.mkdirSync(results.filePath+"/styles");
          fs.writeFileSync(results.filePath+"/styles/project.css", electron.ipcRenderer.sendSync("get-text-asset", {filePath:"project.css"}));
          fs.mkdirSync(results.filePath+"/images");
          fs.mkdirSync(results.filePath+"/fonts");
          fs.mkdirSync(results.filePath+"/templates");
          fs.mkdirSync(results.filePath+"/output");
          this.saveProject();*/
          electron.ipcRenderer.send("copy-default-project", {destDir:results.filePath});
          electron.ipcRenderer.send(
            "project-file-opened",
            this.rootDirectoryPath
          );
          this.openProjectFile(results.filePath+"/project.dko");
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
    openProjectFile(filePath) {
      this.datafileFilePath = path.join("project.dkod");
      this.rootDirectoryPath = path.dirname(filePath);
      //this.Assets = JSON.parse(this.loadFile(filePath, true));
      //if this is a different os, adjust the paths
      if (this.sep != path.sep) {
        this.Assets.forEach((element) => {
          element.filePath = element.filePath.split(element.sep).join(path.sep);
          element.sep = path.sep;
        });
      }
      this.openProjectDirectory(path.dirname(filePath));
      var watcher = chokidar.watch(path.dirname(filePath), {
        ignored: /^\./,
        persistent: true,
      });

      var tempThis = this;

      watcher
        .on("addDir", function (pathIn) {
          //console.log("File", pathIn, "has been added");
          //tempThis.addAssetFromFilePath(pathIn, tempThis);
          tempThis.getOrCreateFileByPath(
            tempThis.getRootDirectoryRelativePath(pathIn),
            tempThis
          );
        })
        .on("add", function (pathIn) {
          //console.log("File", pathIn, "has been added");
          //tempThis.addAssetFromFilePath(pathIn, tempThis);
          tempThis.getOrCreateFileByPath(
            tempThis.getRootDirectoryRelativePath(pathIn),
            tempThis
          );
        })
        .on("unlink", function (pathIn) {
          console.log("File", pathIn, "has been removed");
          //tempThis.addAssetFromFilePath(pathIn, tempThis);
          tempThis.removeFileByPath(
            tempThis.getRootDirectoryRelativePath(pathIn),
            tempThis
          );
          //tempThis.removeFileByPath(tempThis.getRootDirectoryRelativePath(pathIn), tempThis);
        })
        .on("unlinkDir", function (pathIn) {
          console.log("Dir", pathIn, "has been removed");
          //tempThis.addAssetFromFilePath(pathIn, tempThis);
          tempThis.removeFileByPath(
            tempThis.getRootDirectoryRelativePath(pathIn),
            tempThis
          );
          //tempThis.removeFileByPath(tempThis.getRootDirectoryRelativePath(pathIn), tempThis);
        })
        .on("change", function (pathIn) {
          console.log("File", pathIn, "has been changed");
          tempThis.handleFileChange(pathIn);
          if (tempThis.selectedDirectoryListItem != undefined) {
            if (
              [assetCategories.TEMPLATE, assetCategories.BOX].includes(
                tempThis.selectedDirectoryListItem.category
              )
            ) {
              console.log(pathIn, "has been changed");
              console.log(
                "path.dirname(pathIn)",
                path.basename(path.dirname(pathIn))
              );
              if (path.basename(path.dirname(pathIn)) != "output") {
                /*tempThis.assetRender(
                  tempThis.selectedDirectoryListItem.relativeFilePath,
                  false
                );*/
                electron.ipcRenderer.send("piece-preview-opened", tempThis.previewOptions);
              }
            }else{
          electron.ipcRenderer.send("piece-preview-opened", tempThis.previewOptions);
            }
          }

        })
        .on("error", function (error) {
          console.error("Error happened", error);
        });
      
      electron.ipcRenderer.send("menu-item-toggled", {menuItemID:"save_open_file", enabled:false});
      electron.ipcRenderer.send("menu-item-toggled", {menuItemID:"save_project", enabled:true});
      electron.ipcRenderer.send("project-file-opened", path.dirname(filePath));
    },
    openProjectDirectory(directoryPath) {
      //create root folder asset

      this.Files = {
        FilesList: [],
        label: path.basename(this.rootDirectoryPath),
        relativeFilePath: "/",
        fileName: "",
        depth: 0,
        children: {},
        category: assetCategories.DIRECTORY,
        isDirectory: true,
        index: {},
      };
      this.Files.index[this.Files.relativeFilePath] = this.Files;
      //this.openDirectory(directoryPath, rootAsset);
    },
    getRootDirectoryRelativePath(filePath) {
      return filePath.replace(this.rootDirectoryPath, "");
    },
    openDirectory(directoryPath, parentAsset) {
      /*
      fs.readdir(directoryPath, (err, files) => {
        if (err) console.log(err);
        else {
          //console.log("\nCurrent directory filenames:");
          //for every file in the dir directoryPath
          files.reverse().forEach((file) => {
            var fileDirectoryPath = path.join(directoryPath, file);
            //console.log(fileDirectoryPath);
            var newPiece = undefined;
            var assetDepth = 1;
            if (parentAsset != undefined) {
              assetDepth = parentAsset.depth + 1;
            }
            if (fs.lstatSync(fileDirectoryPath).isDirectory()) {
              //console.log("isDirectory", fileDirectoryPath);
              //add as dir
              newPiece = this.addAsset(
                parentAsset,
                assetCategories.DIRECTORY,
                fileDirectoryPath,
                assetFilenames.DIRECTORY,
                file,
                assetDepth
              );
              if (newPiece != undefined) {
                //console.log("piece undefined", fileDirectoryPath);
              }
              newPiece.expanded = true;
              this.openDirectory(fileDirectoryPath, newPiece);
            } else {
              //console.log("directoryPath.replace(this.rootDirectoryPath,'')", directoryPath, this.rootDirectoryPath, directoryPath.replace(this.rootDirectoryPath,''))
              //add as file
              newPiece = this.addAsset(
                parentAsset,
                getAssetCategory(file),
                this.getRootDirectoryRelativePath(directoryPath),
                file,
                file,
                assetDepth
              );
            }
          });
        }
      }); //s
      */
    },
    newFileDialog() {
      dialog
        .showSaveDialog({
          title: "Create a new HTML or CSS file.",
          properties: ["createDirectory"],
          defaultPath:this.rootDirectoryPath
        })
        .then((results) => {
          console.log("newFile", results.filePath);
          fs.writeFileSync(path.join(results.filePath),"");
          this.openFile(path.join(results.filePath));
        });
    },
    createFileObject(label, relativeFilePath, isDirectory) {
      return {
        label: label,
        relativeFilePath: path.join(relativeFilePath),
        fileName: path.basename(relativeFilePath),
        category: getAssetCategory(relativeFilePath),
        isDirectory: isDirectory,
        children: {},
      };
    },
    getOrCreateFileByPath(relativeFilePath, tempThis) {
      //console.log("getOrCreateFileByPath", relativeFilePath);
      if (tempThis == undefined) {
        tempThis = this;
      }
      //split the path into an array of tokens
      var fileTokens = relativeFilePath.split(path.sep);
      //remove root node
      fileTokens.shift();
      //console.log("fileTokens", fileTokens);
      //create target from root
      var target = tempThis.Files;
      var targetPath = target.relativeFilePath;
      //for every token starting at first
      fileTokens.forEach((fileToken) => {
        //fileToken = path.join(path.sep, fileToken);
        targetPath = path.join(targetPath, fileToken);
        if (target.children[fileToken] != undefined) {
          //console.log("already exists", fileToken);
          target = target.children[fileToken];
        } else {
          //console.log("creating", fileToken);
          var isDirectory = false;
          if (
            fs
              .lstatSync(path.join(this.rootDirectoryPath, targetPath))
              .isDirectory()
          ) {
            isDirectory = true;
          }
          this.$set(
            target.children,
            fileToken,
            tempThis.createFileObject(fileToken, targetPath, isDirectory)
          );
          target = target.children[fileToken];
          tempThis.$set(tempThis.Files.index, targetPath, target);
        }
      });
      return target;
    },
    removeFileByPath(relativeFilePath, tempThis) {
      //console.log("removing", relativeFilePath);
      //get target from index
      var target = tempThis.Files.index[relativeFilePath];
      if (target != undefined) {
        //console.log("found", relativeFilePath);
        //run this function on all children recursively
        //find the parent
        var parent =
          tempThis.Files.index[path.dirname(target.relativeFilePath)];
        //console.log("parent of ", path.dirname(target.relativeFilePath),"is", parent);
        //delete this child from parent
        if (parent != undefined) {
          var pointer = path.basename(relativeFilePath);
          //console.log("pointer", pointer);
          //console.log("deleting", pointer, "from", parent.relativeFilePath);
          tempThis.$delete(parent.children, pointer);
        }
        tempThis.$delete(tempThis.Files.index, relativeFilePath);
      } else {
        //("did not find", relativeFilePath);
      }
    },
    addDataSheet(label) {
      var parentId = undefined;
      if (parent != undefined) {
        parentId = parent.id;
      }
      var output = {
        id: uniqueId("data-tab-") + label,
        label: label,
        active: true,
      };
      this.DataSheets.push(output);

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
      //this.$refs.editor.codemirror.clearHistory();
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
      var spreadsheetData = JSON.parse(output);
      this.DataSheets = [];
      for (var key in spreadsheetData) {
        console.log(key + " -> " + spreadsheetData[key]);
        this.addDataSheet(key);
      }
      console.log("this.DataSheets", this.DataSheets);
      this.switchTabsInSpreadsheet(this.DataSheets[0].label);
    },
    switchTabsInSpreadsheet(label) {
      var output = this.loadFile(this.openFile);
      console.log(JSON.parse(output)[label]);
      this.spreadsheet = this.jsonArrayTo2D(JSON.parse(output)[label]);
      if (this.$refs.deckoTable != undefined) {
        this.$refs.deckoTable.hotInstance.loadData(this.spreadsheet);
        this.$refs.deckoTable.hotInstance.updateSettings({
          colHeaders: true,
        });
      }
      console.log(this.spreadsheet);
    },
    saveOpenFile() {
      console.log(
        "saveOpenFile",
        path.join(this.rootDirectoryPath, this.openFile)
      );
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
      console.log("showImportAllWarning");
      this.$refs["import-modal"].show();
      this.importAllDataDialog();
    },
    showNewProjectModal() {
      console.log("showImportAllWarning");
      this.$refs["new-project-modal"].show();
      this.importAllDataDialog();
    },
    buildPieceFromData(pieceData) {
      var block = "";
      var p = pieceData[0];
      for (var key in p) {
        //console.log(key + " -> " + p[key]);
        block +=
          "\t<p>\n\t\t<span class='badge badge-primary'>" +
          key +
          "</span>{{ " +
          key +
          " }}\n\t</p>\n";
      }
      return (
        "<div class='card' style='width:2.5in; height:3.5in;'>\n" +
        block +
        "\n</div>"
      );
    },
    importAllDataDialog() {
      /*
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
              fs.writeFileSync(
                newFilePath,
                this.buildPieceFromData(jsonData[attributename])
              );
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
        });*/
    },
    search(input) {
      return Object.keys(this).every((key) => input[key] === this[key]);
    },
    dataSheetSelected(label) {
      console.log("dataSheetSelected", label);
      this.switchTabsInSpreadsheet(label);
    },
    searchAssets(query) {
      return this.Assets.filter(this.search, query);
    },
    assetSelected(id) {
      console.log("assetSelected", id);
       if (this.$refs.editor != undefined) {
         console.log("clearHistory", this.$refs.editor.codemirror);
      this.$refs.editor.codemirror.clearHistory();
       }
      this.selectedDirectoryListItem = this.Files.index[id];
      console.log(
        "this.selectedDirectoryListItem",
        this.selectedDirectoryListItem
      );
      this.updateMenu();
      this.assetRender(id, false);
    },
    getAssetById(id) {
      var match = this.Assets.find((obj) => {
        return obj.id === id;
      });
      return match;
    },
    updateMenu() {
      if (
        this.selectedDirectoryListItem.category ==
        (assetCategories.TEMPLATE || assetCategories.BOX)
      ) {
        Menu.getApplicationMenu()
          .getMenuItemById("file")
          .submenu.getMenuItemById("export_piece").enabled = true;
      } else {
        Menu.getApplicationMenu().getMenuItemById("file");
        //.submenu.getMenuItemById("export_piece").enabled = false;
      }
    },
    assetRender(id, arg) {
        electron.ipcRenderer.send("menu-item-toggled", {menuItemID:"save_open_file", enabled:false});
        electron.ipcRenderer.send("menu-item-toggled", {menuItemID:"export_piece", enabled:false});
      var match = this.Files.index[id];

      //if it's a dir, expand it
      //if it's a file, open it in editor
      //this.previewOptions.html = undefined;
      var fileExtension = getFileExtension(match.fileName);
      if (match.category == assetCategories.DATAFILE) {
        //this.openFilePathInSpreadSheet(match.relativeFilePath);
        electron.ipcRenderer.send("menu-item-toggled", {menuItemID:"save_open_file", enabled:true});
        this.cmOptions.mode = "json";
        this.openFilePathInEditor(match.relativeFilePath);
      } else if (match.category == assetCategories.STYLESHEET) {
        electron.ipcRenderer.send("menu-item-toggled", {menuItemID:"save_open_file", enabled:true});
        this.cmOptions.mode = "css";
        this.openFilePathInEditor(match.relativeFilePath);
        
      } else if (match.category == assetCategories.JSON) {
        this.cmOptions.mode = "javascript";
        this.openFilePathInEditor(match.relativeFilePath);
      } else if (match.category == assetCategories.TEXT) {
        electron.ipcRenderer.send("menu-item-toggled", {menuItemID:"save_open_file", enabled:true});
        this.cmOptions.mode = undefined;
        this.openFilePathInEditor(match.relativeFilePath);

      } else if (match.category == assetCategories.IMAGE) {
        this.selectedLocalFile =
          "safe-file-protocol://" +
          path.join(
            this.rootDirectoryPath,
            this.selectedDirectoryListItem.relativeFilePath
          );
      } else if (
        fileExtension == "html" ||
        match.category == assetCategories.BOX
      ) {
        electron.ipcRenderer.send("menu-item-toggled", {menuItemID:"save_open_file", enabled:true});
        electron.ipcRenderer.send("menu-item-toggled", {menuItemID:"export_piece", enabled:true});
        this.previewOptions.exportName = match.fileName.split(".").shift();
        if (match.category == assetCategories.TEMPLATE) {
          //console.log("openFilePathInEditor", match.filePath);
          this.cmOptions.mode = "htmlmixed";
          this.openFilePathInEditor(match.relativeFilePath);

          //get template and read it
          //var templateFilePath = this.Assets.filter(({ parentId, category }) => parentId == id && category == assetCategories.template);
          var templateFilePath = match.relativeFilePath;
          var templateContent = this.loadFile(templateFilePath);

          //read datafile
          var datafileContent = JSON.parse(
            this.loadFile(this.datafileFilePath)
          );
          var extractedTemplate = this.extractBlocks(templateContent, ["head"]);
          this.previewOptions.html = "";
          //console.log("templateContent", templateContent);
          var template = Handlebars.compile(extractedTemplate.html);
          this.previewOptions.body = template(datafileContent);
          this.previewOptions.head = extractedTemplate.head;
          this.previewOptions.box = undefined;
        } else if (match.category == assetCategories.BOX) {
          this.cmOptions.mode = { name: "javascript", json: true };
          this.openFilePathInEditor(match.relativeFilePath);

          //get template and read it
          this.previewOptions.body = undefined;
          this.previewOptions.box = JSON.parse(
            this.loadFile(match.relativeFilePath)
          );
        }

        electron.ipcRenderer.send("piece-preview-opened", this.previewOptions);

        /*
          setTimeout(function () {
                        // In embedder page.
            const webview = document.querySelector("webview");
            console.log("webview", webview);
            webview.addEventListener("ipc-message", (event) => {
              var webviewMessage = console.log("JSON.parse(event.chanel)", JSON.parse(event.channel));
              //contextMenu.popup();
              // Prints "pong"
            });
            webview.send("pinga");
          }, 25);
*/

        //console.log("rendered html", this.preview);

      } else if (match.category == assetCategories.DIRECTORY) {
        //console.log("CLICKED DIRECTORY");
        match.expanded = !match.expanded;
        this.toggleDirectoryChildVisibility(match.id, match.expanded);
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

