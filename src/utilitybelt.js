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
    JSON: "json",
    BOX:"box",
    TEXT:"text",
  };
  

  export const assetCategoryExtensions = {
    DIRECTORY: [""],
    TEMPLATE: ["html"],
    STYLESHEET: ["css","scss"],
    DATAFILE: ["dkod"],
    IMAGE: ["jpg","jpeg","png","svg"],
    JSON: ["json", "dko", "js"],
    BOX: ["dkob"],
    TEXT:["txt","md"],
  };

  export const assetFilenames = {
    DIRECTORY: "",
    TEMPLATE: "template.html",
    STYLESHEET: "stylesheet.css",
    DATAFILE: "datafile.dkod",
  };

  export function getAssetCategory(fileName) {
    var output = "";
    if (
      assetCategoryExtensions.DIRECTORY.includes(
        getFileExtension(fileName)
      )
    ) {
      return assetCategories.DIRECTORY;
    } else if (
      assetCategoryExtensions.TEMPLATE.includes(
        getFileExtension(fileName)
      )
    ) {
      return assetCategories.TEMPLATE;
    } else if (
      assetCategoryExtensions.STYLESHEET.includes(
        getFileExtension(fileName)
      )
    ) {
      return assetCategories.STYLESHEET;
    } else if (
      assetCategoryExtensions.DATAFILE.includes(
        getFileExtension(fileName)
      )
    ) {
      return assetCategories.DATAFILE;
    } else if (
      assetCategoryExtensions.BOX.includes(
        getFileExtension(fileName)
      )
    ) {
      return assetCategories.BOX;
    } else if (
      assetCategoryExtensions.IMAGE.includes(getFileExtension(fileName))
    ) {
      return assetCategories.IMAGE;
    }else if (
      assetCategoryExtensions.JSON.includes(getFileExtension(fileName))
    ) {
      return assetCategories.JSON;
    }else if (
      assetCategoryExtensions.TEXT.includes(getFileExtension(fileName))
    ) {
      return assetCategories.TEXT;
    } else {
      return assetCategories.OTHER;
    }
  }
  
  export const staticStrings = {
    DECKODIRNAME: "decko",
  };

  export function getFileExtension(filePath) {
    return filePath.split(".").pop();
  }

  export function getFileTitle(filePath) {
    var extension = getFileExtension(filePath);
    return filePath.slice(0, -1*(extension.length+1));
  }