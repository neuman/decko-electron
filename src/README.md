# To Build Decko Locally
#### Ignore this section unless you want to make changes to Decko itself. 


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Build Deb
npm run electron:build -- --linux deb

### Build Exe
electron:build -- --linux deb --win nsis

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Menu Items
- File
- - New Folder: Select Location, Choose Name, Create Structure with Empty data.json, empty styles.css
- - Open Folder: Select Location, load data.json, look for changes, update structure, update auto-generated-templates
- - Import Data: update json.data, update structure, update auto-generated-templates
- - Save: save current file
- - Save All: save all files
- Template
- - Format: auto format html
- Export
- - Export Selected
- - Export Magnetic
- - Export All
- - Print Export