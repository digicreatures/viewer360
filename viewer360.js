function setup_viewers360() {
  var e = document.getElementsByClassName("viewer360");
  for (var i = 0; i < e.length; ++i) {
    setup_viewer360(e[i]);
  }
}

function setup_viewer360(canvas) {
  // panorama background
  var panorama = canvas.dataset.panorama;
  var panoramaRotate = canvas.dataset.effect == "rotation";

  if (panorama == undefined) {
    console.log("Missing panorama data!");
    return;
  }

  // setting up the renderer
  var renderer = new THREE.WebGLRenderer({canvas: canvas});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // creating a new scene
  var scene = new THREE.Scene();

  // adding a camera
  var camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 1, 1000);
  camera.target = new THREE.Vector3(0, 0, 0);

  var textureLoader = new THREE.TextureLoader();

  textureLoader.load(panorama, function (texture){
      // creation of a big sphere geometry
      var sphere = new THREE.SphereGeometry(100, 100, 40);
      sphere.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

      // creation of the sphere material
      var sphereMaterial = new THREE.MeshBasicMaterial();

      var sphereMaterial = new THREE.MeshBasicMaterial();
      sphereMaterial.map = texture;
      // geometry + material = mesh (actual object)
      var sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
      scene.add(sphereMesh);
      render();
  })


  var longitude = 0;
  var latitude = 0;
  var deltaLongitude = 0;
  var deltaLatitude = 0;
  var savedX;
  var savedY;

  function render(){

    requestAnimationFrame(render);

    if (panoramaRotate && deltaLongitude == 0 && deltaLatitude == 0) {
      longitude += 0.1;
    }

    var currentLongitude = longitude + deltaLongitude;
    // limiting latitude from -85 to 85 (cannot point to the sky or under your feet)
    var currentLatitude = Math.max(-85, Math.min(85, latitude + deltaLatitude));

    // moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
    camera.target.x = -500 * Math.sin(THREE.Math.degToRad(90 - currentLatitude)) * Math.cos(THREE.Math.degToRad(currentLongitude));
    camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - currentLatitude));
    camera.target.z = -500 * Math.sin(THREE.Math.degToRad(90 - currentLatitude)) * Math.sin(THREE.Math.degToRad(currentLongitude));
    camera.lookAt(camera.target);

    // calling again render function
    renderer.render(scene, camera);
  }

  canvas.addEventListener("mousedown", onDocumentMouseDown, false);
  canvas.addEventListener("resize", onCanvasResize, false);

  // when the mouse is pressed, we switch to manual control and save current coordinates
  function onDocumentMouseDown(event){
    event.preventDefault();
    document.addEventListener("mousemove", onDocumentMouseMove, false);
    document.addEventListener("mouseup", onDocumentMouseUp, false);

    savedX = event.clientX;
    savedY = event.clientY;
    deltaLatitude = 0;
    deltaLongitude = 0;
  }

  // when the mouse moves, if in manual contro we adjust coordinates
  function onDocumentMouseMove(event){
      deltaLongitude = (savedX - event.clientX) * 0.1;
      deltaLatitude = (event.clientY - savedY) * 0.1;
  }

  // when the mouse is released, we turn manual control off
  function onDocumentMouseUp(event){
    document.removeEventListener("mousemove", onDocumentMouseMove);
    document.removeEventListener("mouseup", onDocumentMouseUp);
    longitude += deltaLongitude;
    latitude += deltaLatitude;
    deltaLatitude = 0;
    deltaLongitude = 0;
  }

  function onCanvasResize(event) {
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 1, 1000);
  }

}

window.addEventListener("load", setup_viewers360);
