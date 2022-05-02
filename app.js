// Initialize player movement keys
let movementKeys = {
  87: false,
  83: false,
  65: false,
  68: false,
};

// Creates scene
const scene = new THREE.Scene();

// Creates main camera
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
camera.position.set(0, 2, 5);

// Creates top-down camera
const topDownCamera = new THREE.PerspectiveCamera(90, aspect, 0.1, 500);
topDownCamera.position.set(0, 10, 0);
topDownCamera.lookAt(0, 0, -5);

// Creates and loads audio source
const listener = new THREE.AudioListener();
const backgroundMusic = new THREE.Audio(listener);
const ballRoll = new THREE.Audio(listener);
const donutSound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

// Background music
audioLoader.load("./audio/music/08. World 3 - Ocean.flac", function (buffer) {
  backgroundMusic.setBuffer(buffer);
  backgroundMusic.setLoop(true);
  backgroundMusic.setVolume(0.4);
  backgroundMusic.play();
});

// Rolling sound
audioLoader.load("./audio/sfx/ballRoll.wav", function (buffer) {
  ballRoll.setBuffer(buffer);
  ballRoll.setLoop(false);
  ballRoll.setVolume(0.6);
  ballRoll.playbackRate = 0.65;
});

// Donut sound
audioLoader.load("./audio/sfx/donutsound.wav", function (buffer) {
  donutSound.setBuffer(buffer);
  donutSound.setLoop(false);
  donutSound.setVolume(0.6);
});

// Creates renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Loads textures
const ballTexture = new THREE.TextureLoader().load(
  "./assets/textures/ballTexture.png"
);
const skybox = new THREE.TextureLoader().load(
  "./assets/textures/Tex_0015_0.png"
);
const groundTexture = new THREE.TextureLoader().load(
  "./assets/textures/Natural_walnut.webp"
);
const donutTexture = new THREE.TextureLoader().load(
  "./assets/textures/istockphoto-941286158-612x612.jpeg"
);

// Creates skyboxd
scene.background = skybox;

// Creates player model
const playerGeometry = new THREE.SphereGeometry(1, 32, 16);
const playerMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  map: ballTexture,
});
playerMaterial.transparent = true;
playerMaterial.opacity = 1;
playerMaterial.roughness = 0.1;
const ball = new THREE.Mesh(playerGeometry, playerMaterial);

// Creates donut
const donutGeometry = new THREE.TorusGeometry(0.5, 0.25, 10, 30);
const donutMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  map: donutTexture,
});
const donut = new THREE.Mesh(donutGeometry, donutMaterial);
donut.position.set(5, 0, -5);

// Creates plane geometry
const groundGeometry = new THREE.PlaneGeometry(40, 60);
const groundMaterial = new THREE.MeshLambertMaterial({
  map: groundTexture,
  side: THREE.DoubleSide,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x -= 300;
ground.position.y = -1;

// Third person view
camera.lookAt(0, 1, 0);

// Creates lighting
const ambientLight = new THREE.AmbientLight(0x707070);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20, 30, -5);
light.castShadow = true;

// Adds everything to scene
camera.add(topDownCamera);
camera.add(listener);
scene.add(camera);
scene.add(skybox);
scene.add(ball);
scene.add(donut);
scene.add(ground);
scene.add(ambientLight);
scene.add(light);

// Resize page
const insetWidth = window.innerHeight / 4;
const insetHeight = window.innerHeight / 4;
function resize() {
  // Main camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Top-down camera
  topDownCamera.aspect = insetWidth / insetHeight;
  topDownCamera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

// Creates render on page
function animate() {
  requestAnimationFrame(animate);
  gameLoop();
  donut.rotation.x += 0.02;
  donut.rotation.y += 0.02;

  //Donut collision (doesnt work)
  if (
    ball.position.x <= donut.position.x &&
    ball.position.x > donut.position.x - 1 &&
    ball.position.z <= donut.position.z &&
    ball.position.z > donut.position.z - 1
  ) {
    scene.remove(donut);
    donutSound.play();
  }

  // Camera angles
  camera.position.x = ball.position.x;
  camera.position.z = ball.position.z + 5;

  //Diagonal rotation (doesnt work)
  // if (movementKeys["87"]) {
  //   if (movementKeys["65"]) {
  //     camera.rotation.y += 0.01;
  //   } else if (movementKeys["68"]) {
  //     camera.rotation.y -= 0.01;
  //   }
  // }

  // Third person camera
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);

  // Top-down camera
  renderer.clearDepth();
  renderer.setScissorTest(true);
  renderer.setScissor(
    window.innerWidth - insetWidth - 16,
    window.innerHeight - insetHeight - 16,
    insetWidth,
    insetHeight
  );
  renderer.setViewport(
    window.innerWidth - insetWidth - 16,
    window.innerHeight - insetHeight - 16,
    insetWidth,
    insetHeight
  );
  renderer.render(scene, topDownCamera);
  renderer.setScissorTest(false);
}
animate();

// Player movement
function keyDown(event) {
  movementKeys[event.keyCode] = true;
  //console.log(event.keyCode);
}

function keyUp(event) {
  movementKeys[event.keyCode] = false;
}
window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);
function gameLoop() {
  // W
  if (movementKeys["87"]) {
    ball.position.z -= 0.2;
    ball.rotation.x -= 0.1;
    if (!ballRoll.isPlaying) {
      ballRoll.play();
    }
  }

  // S
  if (movementKeys["83"]) {
    ball.position.z += 0.2;
    ball.rotation.x += 0.1;
    if (!ballRoll.isPlaying) {
      ballRoll.play();
    }
  }

  // D
  if (movementKeys["68"]) {
    ball.position.x += 0.2;
    ball.rotation.z -= 0.1;
    if (!ballRoll.isPlaying) {
      ballRoll.play();
    }
  }

  // A
  if (movementKeys["65"]) {
    ball.position.x -= 0.2;
    ball.rotation.z += 0.1;
    if (!ballRoll.isPlaying) {
      ballRoll.play();
    }
  }
}
