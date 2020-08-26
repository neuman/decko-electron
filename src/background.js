'use strict'


import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const createHtmlElement = require('create-html-element');
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
      enableRemoteModule: true,
      allowRunningInsecureContent: true
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

  const electron = require('electron');
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
      label: 'File',
      submenu: [
        {
          label: 'Open Project',
          click: function () {
            win.webContents.send('openProject', '');
          }
        },
        {
          label: 'New Project',
          click: function () {
            win.webContents.send('newProject', '');
          }
        },
        {
          label: 'Save Project',
          click: function () {
            win.webContents.send('saveProject', '');
          }
        },
        { type: 'separator' },
        {
          label: 'Save Open File',
          accelerator: 'CmdOrCtrl+S',
          click: function () {
            win.webContents.send('saveOpenFile', '');
          }
        },
        { type: 'separator' },
        {
          label: 'Export All',
          enabled:false,
          click: function () {
            win.webContents.send('importAllData', '');
          }
        },
        {
          label: 'Export Open ',
          click: function () {
            //generateServer(currentArg, true);
            win.webContents.send('exportOpenFile', '');
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
    {
      label: 'Data',
      submenu: [
        {
          label: 'Import All',
          click: function () {
            win.webContents.send('importAllData', '');
          }
        }
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
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
          ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
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
          ])
      ]
    },
    {
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
  res.setHeader('Content-Type', 'text/plain');
  res.end('Panda, World!\n');
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
import fs from "fs";

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
  output = fs.readFileSync(filePath, "utf8", (err, data) => {
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

function generateServer(arg, doExport){
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
        fs.writeFile(rootDirectoryPath + '/' + request.url.split("/").pop() + ".png", base64Data, 'base64', function (err) {
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
          loadFile(rootDirectoryPath + '/jquery-3.5.1.min.js'),
          loadFile(rootDirectoryPath + '/html2canvas.js'),
          loadFile(rootDirectoryPath + '/canvas2image.js'),
        ];
        if(doExport){
          jsFiles.push(loadFile(rootDirectoryPath + '/export.js'))
        }
        var html = buildWebPage(
          [
            loadFile(rootDirectoryPath + '/style.css'),
            loadFile(rootDirectoryPath + '/all.css'),
            loadFile(rootDirectoryPath + '/custom.css')
          ],
          jsFiles,
          arg);
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(html);
      } else if (request.url.split(".").pop() in ["css","js"] ) {
        console.log('got filename, looking up...');
        response.statusCode = 200;
        console.log('Content-Type', mime.lookup(request.url.split("/").pop()));
        response.setHeader('Content-Type', mime.lookup(request.url.split("/").pop()));
        response.end(loadFile(rootDirectoryPath + request.url));
      } else {
        response.writeHead(200,{"Content-type":mime.lookup(request.url.split("/").pop())});
        var stream = fs.createReadStream(rootDirectoryPath + request.url);
        stream.pipe(response);
      }
    }
  });
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });

  win.webContents.send('setIframeURL', 'http://' + hostname + ':' + port + '/');

}
var currentArg;
ipcMain.on('piece-preview-opened', (event, arg, doExport) => {
  currentArg = arg;
  generateServer(arg, doExport);
  //console.log(arg) // prints "ping";
  event.returnValue = arg;
})

function buildWebPage(css, scripts, body) {
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
    html: createHtmlElement({
      name: 'head',
      html: css_block + scripts_block
    }) + body_block
  })

  return '<!DOCTYPE html>' + html;
}