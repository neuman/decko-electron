
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
var renderer;
render_box = function () {
  const canvas = document.querySelector('#threeCanvas');
  //var context = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
  renderer = new THREE.WebGLRenderer({ canvas, preserveDrawingBuffer: true, alpha: true });

  const fov = 75;
  const aspect = 4;  // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = arg.box.camera.z;
  camera.position.x = arg.box.camera.x;
  camera.position.y = arg.box.camera.y;

  var controls = new THREE.OrbitControls(camera, renderer.domElement);


  const scene = new THREE.Scene();
  window.scene = scene;
  window.camera = camera;

  const cubes = [];  // just an array we can use to rotate the cubes
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  var frontTexture = loader.load(arg.box.front);
  var topTexture = loader.load(arg.box.top);
  var bottomTexture = loader.load(arg.box.bottom);
  var backTexture = loader.load(arg.box.back);
  var leftTexture = loader.load(arg.box.left);
  //backTexture.rotation = 10;
  var rightTexture = loader.load(arg.box.right);
  var materials = [
    new THREE.MeshBasicMaterial({ map: frontTexture }),
    new THREE.MeshBasicMaterial({ map: backTexture }),
    new THREE.MeshBasicMaterial({ map: topTexture }),
    new THREE.MeshBasicMaterial({ map: bottomTexture }),
    new THREE.MeshBasicMaterial({ map: leftTexture }),
    new THREE.MeshBasicMaterial({ map: rightTexture })
  ];

  materials.forEach(element => {
    element.map.wrapS = element.map.wrapT = THREE.RepeatWrapping;
    element.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    element.map.repeat.set(1, 1);
  });
  var faceMaterial = new THREE.MeshFaceMaterial(materials);
  loadManager.onLoad = () => {
    console.log(materials);
    materials[2].map.rotation = THREE.MathUtils.degToRad(-90);
    materials[2].needsUpdate = true;
    materials[3].map.rotation = THREE.MathUtils.degToRad(-90);
    materials[3].needsUpdate = true;
    materials[4].map.rotation = THREE.MathUtils.degToRad(-90);
    materials[4].needsUpdate = true;
    materials[5].map.rotation = THREE.MathUtils.degToRad(90);
    materials[5].needsUpdate = true;
    var boxFrontHeight;
    var boxFrontWidth;
    if (frontTexture.image.width < frontTexture.image.height) {
      boxFrontWidth = 1;
      boxFrontHeight = frontTexture.image.width / frontTexture.image.height;
    } else {
      boxFrontWidth = frontTexture.image.height / frontTexture.image.width;
      boxFrontHeight = 1;
    }

    const boxWidth = frontTexture.image.width;
    const boxHeight = frontTexture.image.height;
    const boxDepth = 1;
    const geometry = new THREE.BoxBufferGeometry(boxFrontWidth, boxFrontHeight, boxDepth);

    const cube = new THREE.Mesh(geometry, faceMaterial);
    scene.add(cube);
    console.log("add cube");
    cubes.push(cube);  // add to our list of cubes to rotate
  };


  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    controls.update();

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

$(document).ready(function () {
  console.log('arg', arg);
  if (arg.body != undefined) {

    if (arg.doMagnetize) {
      console.log("doMagnetize == true");
      magnetize();
    }
    if (arg.doExport) {
      export_all();
    } else {
      $('body').children().attr("float", "left");
    }
  }

  console.log("inside iframe loaded")
  parent.console.log("inside iframe loaded TRANS")

  if (arg.box != undefined) {
    console.log("doBox == true");
    render_box();
    if (arg.doExport) {
      window.setTimeout(function () {
        var dataURL = renderer.domElement.toDataURL();
        $.ajax({
          type: "POST",
          url: "/" + "box_cover",
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
      }, 100);


    }

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
      ipcRenderer.sendToHost(JSON.stringify({ x: event.x, y: event.y }))
    },
    false
  );


});