const createHtmlElement = require('create-html-element');

export function buildWebPage(css, scripts, body) {
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

  export const assetCategories = {
    DIRECTORY: "directory",
    TEMPLATE: "template",
    STYLESHEET: "stylesheet",
    DATAFILE: "datafile",
    IMAGE:"image",
    OTHER: "other",
  };
  

  export const assetCategoryExtensions = {
    DIRECTORY: "",
    TEMPLATE: ["html"],
    STYLESHEET: ["css"],
    DATAFILE: ["json"],
    IMAGE: ["jpg","jpeg","png","svg"],
  };

  export const assetFilenames = {
    DIRECTORY: "",
    TEMPLATE: "template.html",
    STYLESHEET: "stylesheet.css",
    DATAFILE: "datafile.json",
  };
  
  export const staticStrings = {
    DECKODIRNAME: "decko",
  };