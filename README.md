# About
Decko is an all-in-one platform for using web technologies like HTML, CSS, and JS to prototype and publish board games. Because the system is template based, changes to the template file ripple to every card, piece or board automatically.
![space-1.jpg](docs/images/SplashScreen.png)

# Quick Start
1. Get decko now for Linux and Windows [here](https://github.com/neuman/decko-electron/releases). 
1. Launch Decko and go to 'File > New Project' and select 'Classic Card Deck' then choose a project name to create a fresh sample project. 
1. Using the file tree, open 'project.xlsx' then click the 'open file' button which appears in the preview pane. Any changes you make here will be reflected immediately. 
1. Using the file tree, oprn 'templates/cards.html' to see changes. 
1. Using the file tree, open 'templates/boxart.html' then export piece. After doing this, 'box.dkob' will have the cover art populated and will be able to render. 



## Features
| | |
|---|---|
|Write templates with real HTML and use inline or referenced CSS files. | ![space-1.jpg](docs/images/Template.png) |
|Render components directly from excel. | ![space-1.jpg](docs/images/GenerateFromSpreadsheetData.png) |
|Export individual images of components for easy upload to printers or virtual gaming systems.  | ![space-1.jpg](docs/images/ExportDirectoryOfImages.png) |
|Export print-and-play style component sheets in color or printer-optimized black and white.| ![space-1.jpg](docs/images/ExportPrintAndPlay.png) |
|Support for Markdown inside of excel data. | ![space-1.jpg](docs/images/MarkdownSupport.png) |
|Create 3D renderings of your game box from html templates. Export image snapshots from any angle. | ![space-1.jpg](docs/images/BoxRenderer.png) |
|See changes instantly when changing any file in your game directory. Even works with changes made with external editors like vscode, photoshop, and excel. | ![space-1.jpg](docs/images/BoxArt.png) |
|Use built in chrome devtools you're used to for working with HTML/CSS/JS.| ![space-1.jpg](docs/images/DevTools.png) |

## Development Flow
Using Decko to make a game is very similar to building a web application with just a data model, and a view layer.To get started you only need to have an idea of the game's data model, custom visual designs can come later or not at all. 

- Build a Data Model.
    - Data is stored in a spreadsheet file inside the game directory. Each tab represents a component, each column represents a component attribute with the column headers as the name.
- Make Templates
    - Decko is capable of generating default, fully enumerated templates from any data model. To do so go to 'File > Generate Default Templates'
    - The recommended procedure is to generate default templates and then make alterations.
- Iterate
    - Any changes you save to the excel, template, or css files will be reflected immediately. 
    - Templates are always displayed in the preview pane whenever they are being edited. As a convenience, templates will remain in the preview pane until displaced by the next file with a preview, this allows for quick css editing with instant preview. 
- Publish
    - Templates can be exported 1 file per component instance while their file is being edited. To do so go to 'Preview > Export Piece'
    - Templates can be exported in print-and-play mode while their file is being edited. To do so go to 'Preview > Print'. You may choose to print to file in order to save your file as pdf.
    
## Directory Structure
- #### Styles
    - **bootstrap.css:** Bootstrap is a framework which provides a way to build responsive web content. 
    - **decko.css:** This file fontains css for decko to use in printing, previewing and export. Only mess with these if you know what you're doing.
    - **custom.css:** This is where you should put the specifics of your project.


- #### Templates
    - Templates are written [handlebars style](https://handlebarsjs.com/guide/) and must have a '.html' extension.
```handlebars
    {{ variable }}
```    
     - CSS and Javascript files can be linked following normal html syntax within the head block. 

```handlebars
  {{#block head}}
    <link rel="stylesheet" href="styles/bootstrap.css">
    <link rel="stylesheet" href="styles/decko.css">
    <link rel="stylesheet" href="styles/project.css">
    <link rel="stylesheet" href="fontawesome/css/all.css">
  {{/block}}  
```
