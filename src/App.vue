<template>
  <div id="app" class="h-100">
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
          @asset-contexted="assetContexted"
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
            v-else-if="
              this.selectedDirectoryListItem.category == 'deprecated_datafile'
            "
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
      <p>Use the File menu to create a new project or open an existing one.</p>
    </div>
  </div>
</template>
1
<script>
const prompt = require("electron-prompt");
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
const excelToJson = require("convert-excel-to-json");

const { remote, webFrame } = require("electron");
const { getCurrentWebContents, Menu, MenuItem } = remote;
//
const markdownContextMenu = Menu.buildFromTemplate([
  { label: "Open File", click() {} },
  { type: "separator" },
  { label: "Cut", role: "cut" },
  { label: "Copy", role: "copy" },
  { label: "Paste", role: "paste" },
  { label: "Select All", role: "selectall" },
]);

window.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  //console.log(event);
    markdownContextMenu.popup();
});
import {
  assetCategories,
  assetFilenames,
  staticStrings,
  assetCategoryExtensions,
  getAssetCategory,
  getFileExtension,
  getFileTitle,
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
      this.openProjectFile("/home/neuman/Documents/emilydemo/project.dko");
    }
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
    electron.ipcRenderer.removeAllListeners("autoGenerateTemplates");
    electron.ipcRenderer.on("autoGenerateTemplates", (event, arg) => {
      this.showAutoGenerateDialog();
    });
    electron.ipcRenderer.removeAllListeners("exportOpenFile");
    electron.ipcRenderer.on("exportOpenFile", (event, arg) => {
      this.exportOpenFile();
    });
    electron.ipcRenderer.removeAllListeners("magnetizeOpenFile");
    electron.ipcRenderer.on("magnetizeOpenFile", (event, arg) => {
      this.magnetizeOpenFile();
    });
    electron.ipcRenderer.removeAllListeners("printizeOpenFile");
    electron.ipcRenderer.on("printizeOpenFile", (event, arg) => {
      this.printizeOpenFile();
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
      document.querySelector("webview").openDevTools({ mode: "undocked" });
    });
    electron.ipcRenderer.removeAllListeners("openWebViewPrintDialog");
    electron.ipcRenderer.on("openWebViewPrintDialog", (event, arg) => {
      console.log("openWebViewPrintDialog");
      document.querySelector("webview").executeJavaScript("window.print(); ");
      console.log("getWebContents", document.querySelector("webview"));
    });
  },
  updated() {},
  data() {
    return {
      rootDirectoryPath: undefined,
      selectedDirectoryListItem: undefined,
      projectName: undefined,
      name: undefined,
      nameState: undefined,
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
      datafileContent: undefined,
      previewOptions: {
        doExport: false,
        doMagnetize: false,
        doPrintize: false,
        html: undefined,
        templateFilePath: undefined,
      },
      paneDragging: false,
      contextedAsset: undefined,
      newProjectSrcDir: undefined,
    };
  },
  methods: {
    checkFormValidity() {
      const valid = this.$refs.form.checkValidity();
      this.nameState = valid;
      return valid;
    },
    resetModal() {
      this.name = "";
      this.nameState = null;
    },
    handleOk(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault();
      // Trigger submit handler
      this.newProjectHandleSubmit();
    },
    newProjectHandleSubmit() {
      // Exit when the form isn't valid
      if (!this.checkFormValidity()) {
        return;
      }
      // Push the name to submitted names
      //this.submittedNames.push(this.name)
      this.projectName = this.name;
      this.newProjectDialog();
      // Hide the modal manually
      this.$nextTick(() => {
        this.$bvModal.hide("modal-prevent-closing");
      });
    },
    debugAction() {
      console.log("DEBUG");

      //console.log(electron.ipcRenderer.sendSync("get-text-asset", {filePath:"project.css"}));
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
    showContextedAssetInFolder() {
      electron.shell.showItemInFolder(
        path.join(this.rootDirectoryPath, this.contextedAsset)
      );
    },
    duplicateContextedAsset() {
      var newFilePath =
        getFileTitle(this.contextedAsset) +
        " - Copy." +
        getFileExtension(this.contextedAsset);
      dialog
        .showSaveDialog({
          title: "Select where to duplicate " + this.contextedAsset + " to.",
          defaultPath: path.join(this.rootDirectoryPath, newFilePath),
          buttonLabel: "Duplicate",
          showOverwriteConfirmation: true,
          properties: ["createDirectory"],
        })
        .then((results) => {
          if (
            fs
              .lstatSync(path.join(this.rootDirectoryPath, this.contextedAsset))
              .isDirectory()
          ) {
            electron.ipcRenderer.send("copy-dir", {
              srcDir: path.join(this.rootDirectoryPath, this.contextedAsset),
              destDir: results.filePath,
              deleteOriginal: false,
            });
          } else {
            fs.copyFile(
              path.join(this.rootDirectoryPath, this.contextedAsset),
              results.filePath,
              (err) => {
                if (err) {
                  console.log("Error Found:", err);
                } else {
                  fs.rmSync(
                    path.join(this.rootDirectoryPath, this.contextedAsset),
                    { recursive: true, force: true }
                  );
                }
              }
            );
          }
        });
    },
    renameContextedAsset() {
      var newFilePath = this.contextedAsset;
      if (
        fs
          .lstatSync(path.join(this.rootDirectoryPath, this.contextedAsset))
          .isDirectory()
      ) {
        var newParentDirPath = path
          .join(this.rootDirectoryPath, newFilePath)
          .split(path.sep);
        console.log("newParentDirPath:", newParentDirPath);
        newParentDirPath.pop();
        console.log("newParentDirPath:", newParentDirPath);
        newParentDirPath = newParentDirPath.join(path.sep);
        console.log("newParentDirPath:", newParentDirPath);
        newFilePath = path.join(path.join(newParentDirPath), newFilePath);
        newFilePath = newParentDirPath;
        console.log("newFilePath:", newFilePath);
      } else {
        newFilePath = path.join(this.rootDirectoryPath, newFilePath);
      }
      dialog
        .showSaveDialog({
          title: "Select what to rename " + this.contextedAsset + " to.",
          defaultPath: newFilePath,
          buttonLabel: "Rename",
          showOverwriteConfirmation: true,
          properties: ["createDirectory"],
        })
        .then((results) => {
          if (
            fs
              .lstatSync(path.join(this.rootDirectoryPath, this.contextedAsset))
              .isDirectory()
          ) {
            electron.ipcRenderer.send("copy-dir", {
              srcDir: path.join(this.rootDirectoryPath, this.contextedAsset),
              destDir: results.filePath,
              deleteOriginal: true,
            });
          } else {
            fs.copyFile(
              path.join(this.rootDirectoryPath, this.contextedAsset),
              results.filePath,
              (err) => {
                if (err) {
                  console.log("Error Found:", err);
                } else {
                  fs.unlinkSync(
                    path.join(this.rootDirectoryPath, this.contextedAsset),
                    () => {
                      console.log("File Deleted!");
                    }
                  );
                }
              }
            );
          }
        });
    },
    showContextDeleteDialog() {
      dialog
        .showMessageBox(null, {
          message: "Are you sure you want to delete " + this.contextedAsset,
          buttons: ["Yes", "Cancel"],
          defaultId: 0, // bound to buttons array
          cancelId: 1, // bound to buttons array
        })
        .then((result) => {
          if (result.response === 0) {
            // bound to buttons array
            if (
              fs
                .lstatSync(
                  path.join(this.rootDirectoryPath, this.contextedAsset)
                )
                .isDirectory()
            ) {
              fs.rmdir(
                path.join(this.rootDirectoryPath, this.contextedAsset),
                { recursive: true, force: true },
                (err) => {
                  if (err) console.log(err);
                }
              );
            } else {
              fs.unlink(
                path.join(this.rootDirectoryPath, this.contextedAsset),
                (err) => {
                  if (err) console.log(err);
                }
              );
            }
          } else if (result.response === 1) {
            // bound to buttons array
            console.log("Cancel button clicked.");
          }
        });
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
    loadDataFileContent(filePath) {
      console.log("loadDataFileContent:", filePath);
      return excelToJson({
        source: fs.readFileSync(filePath), // fs.readFileSync return a Buffer
        columnToKey: {
          "*": "{{columnHeader}}",
        },
        header: {
          // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
          rows: 1, // 2, 3, 4, etc.
        },
      });
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
    printizeOpenFile() {
      this.previewOptions.doExport = false;
      this.previewOptions.doPrintize = !this.previewOptions.doPrintize;
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
      var newProjectSrcDir;
      dialog
        .showMessageBox(null, {
          message: "What kind of new project would you like to create?",
          buttons: ["Empty Project", "Classic Card Deck"],
          defaultId: 0, // bound to buttons array
          cancelId: 1, // bound to buttons array
        })
        .then((result) => {
          if (result.response === 0) {
            newProjectSrcDir = "blank_assets";
          } else if (result.response === 1) {
            newProjectSrcDir = "sample_assets";
          }
          this.newProjectSaveDialog(newProjectSrcDir);
        });
    },
    newProjectSaveDialog(newProjectSrcDir) {
      dialog
        .showSaveDialog({
          title: "Select which directory to create your new project in.",
          properties: ["createDirectory"],
        })
        .then((results) => {
          console.log("newProject:", results.filePath);
          var directoryPath = path.dirname(results.filePath);
          this.rootDirectoryPath = results.filePath;
          electron.ipcRenderer.send("copy-default-project", {
            destDir: results.filePath,
            srcDir: newProjectSrcDir,
          });
          electron.ipcRenderer.send(
            "project-file-opened",
            this.rootDirectoryPath
          );
          this.openProjectFile(results.filePath + "/project.dko");
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
      this.rootDirectoryPath = path.dirname(filePath);
      this.datafileFilePath = path.join(this.rootDirectoryPath, "project.xlsx");
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
        })
        .on("change", function (pathIn) {
          console.log("File", pathIn, "has been changed");
          tempThis.handleFileChange(pathIn);
          if (tempThis.selectedDirectoryListItem != undefined) {
            if (
              [
                assetCategories.TEMPLATE,
                assetCategories.BOX,
                assetCategories.DATAFILE,
                assetCategories.STYLESHEET,
              ].includes(tempThis.selectedDirectoryListItem.category)
            ) {
              console.log(pathIn, "has been changed");
              if (path.basename(path.dirname(pathIn)) != "output") {
                //if the changed item is not in the output file rerender the selected asset
                tempThis.assetRender(
                  tempThis.selectedDirectoryListItem.relativeFilePath,
                  false
                );
              }
            }
          }
        })
        .on("error", function (error) {
          console.error("Error happened", error);
        });

      electron.ipcRenderer.send("menu-item-toggled", {
        menuItemID: "save_open_file",
        enabled: false,
      });
      electron.ipcRenderer.send("menu-item-toggled", {
        menuItemID: "save_project",
        enabled: true,
      });
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
          defaultPath: this.rootDirectoryPath,
        })
        .then((results) => {
          console.log("newFile", results.filePath);
          fs.writeFileSync(path.join(results.filePath), "");
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
    renderLastTemplatePreview(match) {
      var templateContent = this.loadFile(this.previewOptions.templateFilePath);

      //read datafile
      this.datafileContent = this.loadDataFileContent(this.datafileFilePath);
      var extractedTemplate = this.extractBlocks(templateContent, ["head"]);
      this.previewOptions.html = "";
      //console.log("templateContent", templateContent);
      var template = Handlebars.compile(extractedTemplate.html);
      this.previewOptions.body = template(this.datafileContent);
      this.previewOptions.head = extractedTemplate.head;
      this.previewOptions.box = undefined;
      electron.ipcRenderer.send("piece-preview-opened", this.previewOptions);
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
    autoGenerateTemplates() {
      this.datafileContent = this.loadDataFileContent(this.datafileFilePath);
      console.log("autoGenerateTemplates");
      console.log(this.datafileContent);
      for (const sheetName in this.datafileContent) {
        console.log(sheetName);
        //create new template named {{sheetname}}.html if not existing already
        if (!fs.existsSync(path.join(this.rootDirectoryPath, "templates"))) {
          fs.mkdirSync(path.join(this.rootDirectoryPath, "templates"));
        }
        var newTemplateFileName = sheetName + ".html";
        var newTemplateFilePath = path.join(
          this.rootDirectoryPath,
          sheetName + ".html"
        );
        //if (!fs.existsSync(newTemplateFilePath)) {
        var newTemplate = fs.readFileSync(
          this.getPublicPath(
            path.join("blank_assets", "templates", "blank.html")
          )
        );
        //}
        var rows = this.datafileContent[sheetName];
        if (rows.length >= 1) {
          var headerRow = rows[0];
          console.log("headerRow", headerRow);
          var cardBodyHTML = "\n";
          for (const column in headerRow) {
            console.log("column", column);
            cardBodyHTML += createHtmlElement({
              name: "p",
              html: "<b>"+column + "</b>: {{ " + column + " }}",
            }) + "\n";
          }
          newTemplate +=
            "\n{{#each " +
            sheetName +
            "}}\n" +
            createHtmlElement({
              name: "div",
              attributes: {
                class: "card exportable preview",
                style:"width:2.5in; height:3.5in;",
              },

              html: cardBodyHTML,
            }) +
            "\n{{/each}}";
        }
        try {
          fs.writeFileSync(newTemplateFilePath, newTemplate);
        } catch (e) {
          console.log("could't copy file: " + newTemplateFilePath);
        }
      }
      /*
      var headers = excelToJson({
        source: fs.readFileSync(this.datafileFilePath), // fs.readFileSync return a Buffer
      });
      console.log("headers: ", headers);
      for (const key1 in headers) {
        console.log(`${key1}: ${headers[key1]}`);
        keyValues = headers[key1];
        for (const key2 in keyValues) {
          console.log(`${key2}: ${keyValues[key2]}`);
        }
      }*/
      /* //create empty template file
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
      }*/
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
    showAutoGenerateDialog() {
      dialog
        .showMessageBox(null, {
          message:
            "This will generate a file for each sheet in your project.xlsx file. They will be named 'templates" +
            path.sep +
            "{{sheetname}}.html' if one does not already exist.",
          buttons: ["Cancel", "Generate Templates"],
          defaultId: 0, // bound to buttons array
          cancelId: 1, // bound to buttons array
        })
        .then((result) => {
          if (result.response === 1) this.autoGenerateTemplates();
        });
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
    assetContexted(id) {
      console.log("assetContexted", id);
      this.contextedAsset = id;
      var assetListContextMenu = Menu.buildFromTemplate([
        {
          label: "Open Containing Folder",
          click: this.showContextedAssetInFolder,
        },
        {
          label: "Rename",
          click: this.renameContextedAsset,
        },
        {
          label: "Duplicate",
          click: this.duplicateContextedAsset,
        },
        {
          label: "Delete",
          click: this.showContextDeleteDialog,
        },
      ]);
      assetListContextMenu.popup();
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
          .getMenuItemById("preview")
          .submenu.getMenuItemById("export_piece").enabled = true;
      } else {
        Menu.getApplicationMenu().getMenuItemById("file");
        //.submenu.getMenuItemById("export_piece").enabled = false;
      }
    },
    assetRender(id, arg) {
      electron.ipcRenderer.send("menu-item-toggled", {
        menuItemID: "save_open_file",
        enabled: false,
      });
      electron.ipcRenderer.send("menu-item-toggled", {
        menuItemID: "export_piece",
        enabled: false,
      });
      var match = this.Files.index[id];

      //if it's a dir, expand it
      //if it's a file, open it in editor
      //this.previewOptions.html = undefined;
      var fileExtension = getFileExtension(match.fileName);
      if (match.category == assetCategories.DATAFILE) {
        //this.openFilePathInSpreadSheet(match.relativeFilePath);
        electron.ipcRenderer.send("menu-item-toggled", {
          menuItemID: "save_open_file",
          enabled: true,
        });
        this.cmOptions.mode = "json";
        this.openFilePathInEditor(match.relativeFilePath);
      } else if (match.category == assetCategories.STYLESHEET) {
        electron.ipcRenderer.send("menu-item-toggled", {
          menuItemID: "save_open_file",
          enabled: true,
        });
        this.cmOptions.mode = "css";
        this.openFilePathInEditor(match.relativeFilePath);

        this.renderLastTemplatePreview();
      } else if (match.category == assetCategories.JSON) {
        this.cmOptions.mode = "javascript";
        this.openFilePathInEditor(match.relativeFilePath);
      } else if (match.category == assetCategories.TEXT) {
        electron.ipcRenderer.send("menu-item-toggled", {
          menuItemID: "save_open_file",
          enabled: true,
        });
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
        electron.ipcRenderer.send("menu-item-toggled", {
          menuItemID: "save_open_file",
          enabled: true,
        });
        electron.ipcRenderer.send("menu-item-toggled", {
          menuItemID: "export_piece",
          enabled: true,
        });
        this.previewOptions.exportName = match.fileName.split(".").shift();
        if (match.category == assetCategories.TEMPLATE) {
          //console.log("openFilePathInEditor", match.filePath);
          this.cmOptions.mode = "htmlmixed";
          this.openFilePathInEditor(match.relativeFilePath);

          //generate preview
          this.previewOptions.templateFilePath = match.relativeFilePath;
          this.renderLastTemplatePreview();
        } else if (match.category == assetCategories.BOX) {
          this.cmOptions.mode = { name: "javascript", json: true };
          this.openFilePathInEditor(match.relativeFilePath);

          this.previewOptions.body = undefined;
          this.previewOptions.box = JSON.parse(
            this.loadFile(match.relativeFilePath)
          );
          electron.ipcRenderer.send(
            "piece-preview-opened",
            this.previewOptions
          );
        }

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

