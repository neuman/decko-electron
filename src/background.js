'use strict'


import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const createHtmlElement = require('create-html-element');
const electron = require('electron');
const path = require('path')
var mime = require('mime-types')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])



function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      webviewTag: true,
      browserviewTag: true,
      enableRemoteModule: true,
      allowRunningInsecureContent: true,
      webSecurity: false,
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()


  var menu = electron.Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Project',
          click: function () {
            win.webContents.send('openProject', 'Hello World!');
          }
        },
        {
          label: 'New Project',
          click: function () {
            win.webContents.send('hello', 'Hello World!');
          }
        },
        {
          label: 'New File',
          click: function () {
            win.webContents.send('newFile', 'Hello World!');
          }
        }
      ]
    }
  ]);

  electron.Menu.setApplicationMenu(menu);

  const { app, Menu } = require('electron')

  const isMac = process.platform === 'darwin'

  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      id: 'file',
      label: 'File',
      submenu: [
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: function () {
            win.webContents.send('openProject', '');
          }
        },
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+M',
          click: function () {
            win.webContents.send('newProject', '');
          }
        },
        {
          label: 'Save Project',
          id: 'save_project',
          enabled: false,
          click: function () {
            win.webContents.send('saveProject', '');
          }
        },
        { type: 'separator' },
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: function () {
            win.webContents.send('newFile', '');
          }
        },
        {
          label: 'Save Open File',
          id: 'save_open_file',
          accelerator: 'CmdOrCtrl+S',
          enabled: false,
          click: function () {
            win.webContents.send('saveOpenFile', '');
          }
        },
        { type: 'separator' },
        {
          label: 'Generate Default Templates',
          click: function () {
            win.webContents.send('autoGenerateTemplates', '');
          }
        },
        { type: 'separator' },
        {
          label: 'Debug Action',
          click: function () {
            win.webContents.send('debugAction', '');
          }
        },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'editMenu' }
    {
      id: 'editor',
      label: 'Editor',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startspeaking' },
              { role: 'stopspeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ]),
        { type: 'separator' },
        {
          label: 'Toggle Wrapping',
          click: function () {
            win.webContents.send('toggleLineWrapping', '');
          }
        },
        {
          label: 'Format Selection',
          id: 'format_document',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: function () {
            win.webContents.send('formatOpenFile', '');
          }
        }
      ]
    },
    
    // { role: 'viewMenu' }
    {
      id: 'preview',
      label: 'Preview',
      submenu: [
        {
          label: 'Export Piece ',
          id: 'export_piece',
          click: function () {
            //generateServer(currentArg, true);
            win.webContents.send('exportOpenFile', '');
          }
        },
        { type: 'separator' },
        {
          label: 'Magnetize',
          click: function () {
            win.webContents.send('magnetizeOpenFile', '');
          }
        },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Debug Preview',
          accelerator: 'CmdOrCtrl+D',
          click: function () {
            win.webContents.send('openWebViewDevTools', '');
          }
        },
      ]
    },
    // { role: 'windowMenu' }
    {
      id: 'window',
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ]),
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
      ]
    },
    {
      id: 'help',
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ]

  menu = electron.Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // Name the protocol whatever you want
  const protocolName = 'safe-file-protocol'

  protocol.registerFileProtocol(protocolName, (request, callback) => {
    const url = request.url.replace(`${protocolName}://`, '')
    try {
      return callback(decodeURIComponent(url))
    }
    catch (error) {
      // Handle the error as needed
      console.error(error)
    }
  })



})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


const http = require('http');

const hostname = '127.0.0.1';
var port = 3000;

var server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end('<head><style>body {background-color: #181818;color:#ffffff;font-family: "Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; font-size: 0.9375rem; font-weight: 400;}</style></head><body>JSON Invalid</body>\n');
});
console.log('made new server');

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Goodbye world!\n');
});

const { ipcMain } = require('electron')
//import fs from "fs";
const fse = require('fs')
import copy from 'recursive-copy';


ipcMain.on('asynchronous-message', (event, arg) => {
  port += 1;
  console.log('background.js asynchronous-message', arg);
  //console.log(arg) // prints "ping"
  server.removeAllListeners();
  server.close();
  server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Goodbye world!\n');
  });

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });

  win.webContents.send('setIframeURL', 'http://' + hostname + ':' + port + '/');
  event.reply('asynchronous-reply', server.connections)
})

function loadFile(filePath) {
  var output = undefined;
  output = fse.readFileSync(filePath, "utf8", (err, data) => {
    if (err) throw err;
    //console.log(data);
    output = data;
  });
  return output
}

var rootDirectoryPath = undefined;
ipcMain.on('project-file-opened', (event, arg) => {
  port += 1;
  rootDirectoryPath = arg;
  console.log(arg) // prints "ping";
  event.returnValue = arg;
})

function generateServer(arg) {
  port += 1;
  server = http.createServer((request, response) => {
    if (request.method == 'POST') {
      console.log('POST', request.url);
      var body = ''
      request.on('data', function (data) {
        body += data
        //console.log('Partial body: ' + body)
      })
      request.on('end', function () {
        //console.log('Body: ' + body)
        var decodedBody = decodeURIComponent(body);
        var base64Data = decodedBody.split(';base64,').pop();
        //console.log('stripped body:',base64Data);
        //create output dir if doesn't exist
        if (!fse.existsSync(path.join(rootDirectoryPath, 'output'))) {
          fse.mkdirSync(path.join(rootDirectoryPath, 'output'));
        }
        fse.writeFile(path.join(rootDirectoryPath, 'output', request.url.split("/").pop() + ".png"), base64Data, 'base64', function (err) {
          console.log(err);
        });
        response.writeHead(200, { 'Content-Type': 'text/html' })
        response.end('post received')
      })
    } else {
      console.log('GET', request.url)
      if (request.url == "/") {
        console.log('got "/" building web page..');
        var jsFiles = [
          loadFile(getPublicPath(path.join('iframe_assets', 'jquery.js'))),
          loadFile(getPublicPath(path.join('iframe_assets', 'html2canvas.js'))),
          loadFile(getPublicPath(path.join('iframe_assets', 'canvas2image.js'))),
          loadFile(getPublicPath(path.join('iframe_assets', 'three.min.js'))),
          loadFile(getPublicPath(path.join('iframe_assets', 'orbit.js'))),
        ];
        jsFiles.push(loadFile(getPublicPath(path.join('iframe_assets', 'export.js',))));
        //var extracted = extractBlocks(arg.html, ["head"]);
        var html = "";
        if (arg.box == undefined) {
          jsFiles.push("var arg = " + JSON.stringify(arg));
          html = buildWebPage(
            [],
            jsFiles,
            arg.head,
            arg.body);
        } else {
          jsFiles.push("var arg = " + JSON.stringify(arg));
          html = buildWebPage(
            [loadFile(getPublicPath(path.join('iframe_assets', 'styles.css')))],
            jsFiles,
            "",
            "<canvas id='threeCanvas' class='exportable' style=' width: 100%; height: 100%;'></canvas><button class='export_ignore' onclick='export_all()'>Export</button>");
        }
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(html);
      } else if (request.url.split(".").pop() in ["css", "js"]) {
        console.log('got filename, looking up...');
        response.statusCode = 200;
        console.log('Content-Type', mime.lookup(request.url.split("/").pop()));
        response.setHeader('Content-Type', mime.lookup(request.url.split("/").pop()));
        response.end(loadFile(path.join(rootDirectoryPath, request.url)));
      } else {
        console.log('got other, looking up...');
        console.log(path.join(rootDirectoryPath, request.url));
        if ((fse.existsSync(path.join(rootDirectoryPath, request.url))) && (fse.lstatSync(path.join(rootDirectoryPath, request.url)).isDirectory() != true)) {
          response.writeHead(200, { "Content-type": mime.lookup(request.url.split("/").pop()) });
          //response.end("Test");
          var stream = fse.createReadStream(path.join(rootDirectoryPath, request.url));
          stream.pipe(response);
        }
        else {
          response.writeHead(404);
          response.end("File Not Found");
        }

      }
    }
  });
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });

  win.webContents.send('setIframeURL', 'http://' + hostname + ':' + port + '/');

}

const copyR = function (srcDir, dstDir) {
  var results = [];
  var list = fse.readdirSync(srcDir);
  var src, dst;
  list.forEach(function (file) {
    src = path.join(srcDir,file);
    dst = path.join(dstDir, file);
    //console.log(src);
    var stat = fse.statSync(src);
    if (stat && stat.isDirectory()) {
      try {
        console.log('creating dir: ' + dst);
        fse.mkdirSync(dst);
      } catch (e) {
        console.log('directory already exists: ' + dst);
      }
      results = results.concat(copyR(src, dst));
    } else {
      try {
        console.log('copying file: ' + dst);
        //fs.createReadStream(src).pipe(fs.createWriteStream(dst));
        fse.writeFileSync(dst, fse.readFileSync(src));
      } catch (e) {
        console.log('could\'t copy file: ' + dst);
      }
      results.push(src);
    }
  });
  return results;
}

ipcMain.on('copy-default-project', (event, arg) => {
  fse.mkdirSync(arg.destDir);
  copyR(getPublicPath(arg.srcDir), arg.destDir);
})

ipcMain.on('copy-dir', (event, arg) => {
  fse.mkdirSync(arg.destDir);
  copyR(arg.srcDir, arg.destDir);
  if(arg.deleteOriginal){
    fse.rmdir(arg.srcDir,{ recursive: true, force: true }, () => {
      console.log("Folder Deleted!");
    });
  }

})

ipcMain.on('get-text-asset', (event, arg) => {
  //currentArg = arg;
  event.returnValue = loadFile(getPublicPath(path.join('default_assets', arg.filePath)));
})


ipcMain.on('menu-item-toggled', (event, arg) => {
  electron.Menu.getApplicationMenu().getMenuItemById(arg.menuItemID).enabled = arg.enabled;
  event.returnValue = arg;
})


//var currentArg;
ipcMain.on('piece-preview-opened', (event, arg) => {
  //currentArg = arg;
  generateServer(arg);
  //console.log(arg) // prints "ping";
  event.returnValue = arg;
})

function buildWebPage(css, scripts, head, body) {
  var css_block = "";
  css.forEach(element => {
    css_block += createHtmlElement({
      name: 'style',
      html: element
    })
  });

  var scripts_block = "";
  scripts.forEach(element => {
    css_block += createHtmlElement({
      name: 'script',
      attributes: {
        type: 'text/javascript'
      },
      html: element
    })
  });


  var body_block = createHtmlElement({
    name: 'body',
    html: body
  });

  var html = createHtmlElement({
    name: 'html',
    attributes: {
      'pointer-events': 'none'
    },
    html: createHtmlElement({
      name: 'head',
      html: css_block + scripts_block + head
    }) + body_block
  })

  return '<!DOCTYPE html>' + html;
}

function getPublicPath(relativePath) {
  if (app.isPackaged === false) {
    return path.join(process.cwd(), "public", relativePath);
  } else {
    return path.join(__dirname, relativePath);
  }
}