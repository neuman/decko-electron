
var $ = require("jquery");

const { remote, webFrame } = require("electron");
const { getCurrentWebContents, Menu, MenuItem } = remote;
//
let rightClickPosition;
//
const contextMenu = new Menu();
const menuItem = new MenuItem({
  label: "Inspect Preview Element",
  click: () => {
    let factor = webFrame.getZoomFactor();
    let x = Math.round(rightClickPosition.x * factor);
    let y = Math.round(rightClickPosition.y * factor);
    getCurrentWebContents().inspectElement(x, y);
  },
});
contextMenu.append(menuItem);
//
window.addEventListener(
  "contextmenu",
  (event) => {
    event.preventDefault();
    rightClickPosition = { x: event.x, y: event.y };
    contextMenu.popup();
  },
  false
);

magnetize = function () {
  $('*').toggleClass('no_corners');
  $('*').not('.magnetic_faceup').not('.magnetic_skip').toggleClass('magnetic_ignore');
  $('.magnetic_remove').remove();
  $('svg').attr('fill', 'black');
  $('.magnetic_faceup').toggleClass('magnetic_faceup_highlight');
  //$('.magnetic_faceup').html('');
  $('.magnetic_faceup').append('<div class="vector_line"></div>');
  $('*[card-type]').each(function () {
    $(this).attr("card-type", $(this).attr("card-type") + "-magnetic");
  });
}

export_all = function () {
  //$('body').prep
  var elements = $('body').children();
  var index = 0;

  var doNext = null;
  doNext = function () {
    var element = elements.eq(index);
    console.log('exporting element', element);
    $(element).addClass('scale-up');
    // do work 
    window.scrollTo(0, 0);
    html2canvas(element[0],
      {
        backgroundColor: null,
        allowTaint: true,
      }).then(function (canvas) {
        document.body.appendChild(canvas);
        var dataURL = canvas.toDataURL();
        index++;
        $.ajax({
          type: "POST",
          url: "/" + $(element).attr("card-type") + "-" + index,
          data: {
            imgBase64: dataURL
          }
        }).done(function (o) {
          console.log('saved');
          // If you want the file to be visible in the browser 
          // - please modify the callback in javascript. All you
          // need is to return the url to the file, you just saved 
          // and than put the image in your browser.
        });


        $(canvas).remove();
        $(element).removeClass('scale-up');
      });
    //timer again
    if (index < elements.length - 1) {
      setTimeout(doNext, 100);
    }
  }
  doNext();
}

$(document).ready(function () {
  console.log("inside iframe loaded")
  parent.console.log("inside iframe loaded TRANS")
  if (arg.doMagnetize) {
    console.log("doMagnetize == true");
    magnetize();
  }
  if (arg.doExport) {
    export_all();
  }else{
    $('body').children().attr("float","left");
  }

  const { ipcRenderer } = require('electron')
  ipcRenderer.on('pinga', () => {
    ipcRenderer.sendToHost('ponga')
  })

  window.addEventListener(
  "contextmenu",
    (event) => {
      event.preventDefault();
      rightClickPosition = { x: event.x, y: event.y };
      console.log(rightClickPosition)
      ipcRenderer.sendToHost(JSON.stringify({x:event.x, y:event.y}))
    },
    false
);


});