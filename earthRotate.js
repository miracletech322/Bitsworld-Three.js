import { doc } from "firebase/firestore";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );
const secondCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true});


// Track if we're in spaceship mode
let inSpaceshipMode = false;

let zoomCount = 0;
const maxZoomCount = 2;  // Stop spaceship after two zooms
let lastZoomTime = 0;
const zoomTimeout = 500; // Timeout in ms to reset zoom count

const secondControls = new OrbitControls(secondCamera, renderer.domElement);
secondControls.enableZoom = true; // Enable zoom control
secondControls.enablePan = false; // Disable panning (so only rotation works)
secondControls.enableRotate = true; // Allow rotation




camera.position.set(20, 10, 10);
secondCamera.position.set(0, 50, 750); // Set a different view position for the second camera
// Set target for second camera to stop zooming into the center

// Set target for second camera to stop zooming into the center
secondControls.target.set(100, 50, 0); // Example coordinates (100, 50, 0)
secondControls.update();


let spaceshipSpeed = 1;
let zoomSpeed = 0.05;
let moveDirection = 0; // 1 = forward, -1 = backward



let coilRotationSpeed = 0.0005;
let sunRotationSpeed = 10;
let spin = true;
let earthOrbitSpeed = 0.000125;
let earthRotationSpeed = 0.005;
let moonRotationSpeed = 0.005;

let activeCamera = camera;


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Set up renderer for shadow mapping
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);

// Skybox
const cubeTextureLoader = new THREE.CubeTextureLoader();
const cubeMap = cubeTextureLoader.load([
  "/textures/skybox/px.png",
  "/textures/skybox/nx.png",
  "/textures/skybox/py.png",
  "/textures/skybox/ny.png",
  "/textures/skybox/pz.png",
  "/textures/skybox/nz.png",
]);
scene.background = cubeMap;

// Directional light
const sunlight = new THREE.DirectionalLight(0xffffff, 1);
sunlight.position.set(10, 10, 10);
sunlight.castShadow = true;

// Set up shadow properties for the sunlight
sunlight.shadow.mapSize.width = 2048;
sunlight.shadow.mapSize.height = 2048;
sunlight.shadow.camera.near = 0;
sunlight.shadow.camera.far = 500;
sunlight.shadow.camera.left = -50;
sunlight.shadow.camera.right = 50;
sunlight.shadow.camera.top = 50;
sunlight.shadow.camera.bottom = -50;
sunlight.shadow.bias = -0.0001;

scene.add(sunlight);

// const sphereSize = 5;
// const pointLightHelper = new THREE.PointLightHelper( light, sphereSize );
// scene.add( pointLightHelper );

// const helper = new THREE.CameraHelper( light.shadow.camera );
// scene.add( helper );

const earthMaterial = new THREE.ShaderMaterial({
  vertexShader: `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vSunDirection;

  uniform vec3 sunDirection;

  void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      // Transform sun direction to view space
      vSunDirection = (viewMatrix * vec4(sunDirection, 0.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,
  fragmentShader: `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vSunDirection;

  void main() {
      vec3 normal = normalize(vNormal);
      float intensity = dot(normal, normalize(vSunDirection));

      // Calculate latitude based on normal
      float latitude = acos(normal.y) / 3.14159265359;

      // Adjust the latitude to smoothly transition between day and night textures
      float transition = smoothstep(-0.1, 0.4, intensity);

      // Mix day and night textures based on latitude and transition
      vec3 dayColor = texture2D(dayTexture, vUv).rgb;
      vec3 nightColor = texture2D(nightTexture, vUv).rgb;
      vec3 finalColor = mix(nightColor, dayColor, transition);

      // Calculate the brightness of the earthlight texture based on latitude
      float earthlightBrightness = smoothstep(0.3, -0.9, intensity);

      // Mix earthlight texture with the final color for the dark side of the Earth
      finalColor += earthlightBrightness * texture2D(nightTexture, vUv).rgb;

      gl_FragColor = vec4(finalColor, 1.0);
  }
`,
  uniforms: {
      sunDirection: { value: new THREE.Vector3(0, 0, 0) },
      dayTexture: { value: new THREE.TextureLoader().load("/textures/Earth4kTexture.jpg") },
      nightTexture: { value: new THREE.TextureLoader().load("/textures/Night.jpeg") },
  },
});


// Create earth
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(4, 50, 50),
  earthMaterial
);
earth.position.set(0, 0, 0);
earth.castShadow = true; // Enable casting shadows for Earth
earth.receiveShadow = false; // Enable receiving shadows for Earth

// Create sun
const sunGeometry = new THREE.SphereGeometry(50, 64, 64);
const sunTailGeometry = new THREE.CylinderGeometry(0.3, 0.01, 1900, 32);

// Orange sun material
const sunTexture = new THREE.TextureLoader().load("/textures/Sun.jpeg");

const sunTailMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

// Emissive Sun Material (glowing effect)
const sunMaterial = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load('/textures/Sun.jpeg'),
  emissive: new THREE.Color(0xffdd33),  // Glow color (yellowish)
  emissiveIntensity: 1.0
});



const sunGlowMaterial = new THREE.ShaderMaterial({
  uniforms: {
    viewVector: { type: "v3", value: camera.position }
  },
  vertexShader: `
    uniform vec3 viewVector;
    varying float intensity;
    void main() {
      vec3 vNormal = normalize(normalMatrix * normal);
      vec3 vNormel = normalize(normal);
      intensity = pow(1.0 - dot(vNormal, viewVector), 6.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying float intensity;
    void main() {
      vec3 glowColor = vec3(1.0, 0.5, 0.0); // Glowing orange color
      gl_FragColor = vec4(glowColor, intensity * 0.5); // Adjust intensity for glow effect
    }
  `,
  side: THREE.BackSide, // Render on the back side of the geometry
  blending: THREE.AdditiveBlending,
  transparent: true
});





const sun = new THREE.Group();
const sunSphere = new THREE.Mesh(sunGeometry, sunMaterial);
sun.add(sunSphere);

const sunTail = new THREE.Mesh(sunTailGeometry, sunTailMaterial);
sunTail.position.set(0, -10000, 0);
sun.add(sunTail);

sun.position.set(0, 0, 0);

const light = new THREE.PointLight(0xffffff, 1, 0);
light.position.set(0, 0, 0);
light.castShadow = true;

sunSphere.add(light);

const coilRadius = 200;
const coilHeight = 2000;
const coilNumTurns = 1;
const coilSegments = 500;

const coilCurve = new THREE.CatmullRomCurve3();
for (let i = coilSegments; i >= 0; i--) {
  const t = i / coilSegments;
  const x = coilRadius * Math.cos(coilNumTurns * 2 * Math.PI * t);
  const y = coilHeight * t;
  const z = coilRadius * Math.sin(coilNumTurns * 2 * Math.PI * t);
  coilCurve.points.push(new THREE.Vector3(x, y, z));
}

const coilGeometry = new THREE.TubeGeometry(
  coilCurve,
  coilSegments,
  0.3,
  8,
  false
);
const coilMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const coilMesh = new THREE.Mesh(coilGeometry, coilMaterial);

coilMesh.rotation.y = -Math.PI / 0.0005;

const coilOffset = new THREE.Vector3(0, -2000, 0);
coilMesh.position.add(coilOffset);

scene.add(coilMesh);

const particleBoundingBoxGeometry = new THREE.BoxGeometry(2000, 2000, 2000);
const particleBoundingBoxMaterial = new THREE.MeshBasicMaterial({
  visible: false,
});
const particleBoundingBox = new THREE.Mesh(
  particleBoundingBoxGeometry,
  particleBoundingBoxMaterial
);
scene.add(particleBoundingBox);
particleBoundingBox.position.set(0, 0, 0);

const particleCount = 1500;
const particleMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  emmisive: 0xffffff,
  emmisiveIntensity: 1,
});

const particles = new THREE.Group();
const stars = new THREE.Group();

for (let i = 0; i < particleCount; i++) {
  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(.5, 10, 10),
    particleMaterial
  );
  particle.position.set(
    Math.random() * 2 - 1,
    Math.random() * 2000 - 1000,
    Math.random() * 2 - 1
  );
  particles.add(particle);
}

scene.add(particles);



const moonMaterial = new THREE.ShaderMaterial({
  vertexShader: `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vSunDirection;

  uniform vec3 sunDirection;

  void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      // Transform sun direction to view space
      vSunDirection = (viewMatrix * vec4(sunDirection, 0.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,
  fragmentShader: `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vSunDirection;

  void main() {
      vec3 normal = normalize(vNormal);
      float intensity = dot(normal, normalize(vSunDirection));

      // Calculate latitude based on normal
      float latitude = acos(normal.y) / 3.14159265359;

      // Adjust the latitude to smoothly transition between day and night textures
      float transition = smoothstep(-0.2, 0.4, intensity);

      // Mix day and night textures based on latitude and transition
      vec3 dayColor = texture2D(dayTexture, vUv).rgb;
      vec3 nightColor = texture2D(nightTexture, vUv).rgb;
      vec3 finalColor = mix(nightColor, dayColor, transition);

      // Calculate the brightness of the earthlight texture based on latitude
      float earthlightBrightness = smoothstep(0.5, 0.0, intensity);

      // Mix earthlight texture with the final color for the dark side of the Earth
      finalColor += earthlightBrightness * texture2D(nightTexture, vUv).rgb;

      gl_FragColor = vec4(finalColor, 1.0);
  }
`,
  uniforms: {
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      dayTexture: { value: new THREE.TextureLoader().load("/textures/Moonk.png") },
      nightTexture: { value: new THREE.TextureLoader().load("/textures/e1arthnight.jpg") },
  },
});


// Create earth
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  moonMaterial
);
moon.position.set(0, 0, 0);
moon.castShadow = true; // Enable casting shadows for moon
moon.receiveShadow = false; // Enable receiving shadows for moon




// Set the moon's initial position
const moonOrbitRadius = 20;
const moonOrbitSpeed = 0.001;

const starSizes = [0.5, 1.5, 2, 3];

const radiusThreshold = 250;

const starSpeedFactors = [];

const speedFactors = [0.03, 0.5, 1.0, 5.25, 7.0];

for (let i = 0; i < 1000; i++) {
  const speedFactor =
    speedFactors[Math.floor(Math.random() * speedFactors.length)];
  starSpeedFactors.push(speedFactor);
}

const colours = [
  new THREE.Color(0x0000ff),
  new THREE.Color(0xffffff),
  new THREE.Color(0xffff00),
  new THREE.Color(0xffa500),
  new THREE.Color(0xff0000),
];

for (let i = 0; i < 500; i++) {
  let x, y, z;
  do {
    x = (Math.random() - 0.5) * 2000;
    y = (Math.random() - 0.5) * 2000;
    const negativeFactor = Math.random() > 0.5 ? 1 : -1;
    z = negativeFactor * Math.random() * 2000;
  } while (Math.sqrt(x ** 2 + z ** 2) < radiusThreshold);

  const color = colours[Math.floor(Math.random() * colours.length)];
  const size = starSizes[Math.floor(Math.random() * starSizes.length)];
  const starMaterial = new THREE.MeshBasicMaterial({ color: color });
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(size, 10, 10),
    starMaterial
  );
  star.position.set(x, y, z);
  stars.add(star);
}

scene.add(stars);
scene.add(earth);
scene.add(sun);
scene.add(moon);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enabled = false;
controls.maxTargetRadius = 1000;
controls.update();

// Configure moon as a shadow caster
moon.castShadow = true;
moon.receiveShadow = true;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
let moved = false;


// Handle zoom for movement
function handleZoom(event) {
  const currentTime = Date.now();

  if (currentTime - lastZoomTime > zoomTimeout) {
    zoomCount = 0;  // Reset zoom count if too much time has passed
  }

  if (event.deltaY < 0) {
    // Zoom in (scroll up) = move forward
    moveDirection = 1;
  } else if (event.deltaY > 0) {
    // Zoom out (scroll down) = move backward
    moveDirection = -1;
  }

  zoomCount += 1;
  lastZoomTime = currentTime;

  // Check if the zoom count reaches the threshold to stop movement
  if (zoomCount >= maxZoomCount) {
    moveDirection = 0;  // Stop movement
    zoomCount = 0;  // Reset zoom count after stopping
  }
}

// Update spaceship controls based on zoom and mouse direction
function updateSpaceshipControls() {
  // Move forward/backward
  if (moveDirection !== 0) {
      secondCamera.position.add(secondCamera.getWorldDirection(new THREE.Vector3()).multiplyScalar(spaceshipSpeed * moveDirection));
  }
}

// Event listener for mouse wheel (zoom control)
window.addEventListener('wheel', (event) => {
  handleZoom(event);
});


function toggleCamera() {
  activeCamera = (activeCamera === camera) ? secondCamera : camera;
}

async function onMouseUp(event) {
  if (!moved) {
      var rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, activeCamera); // Use active camera
      var intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
          var point = intersects[0].point;

          // Check if the moon is clicked
          if (intersects[0].object === moon) {
              toggleCamera(); // Switch cameras
              toggleMusic();
          } else if (intersects[0].object === sunSphere) {
              toggleSun();
          } else if (intersects[0].object === earth) {
              toggleEarth();
        point = earth.worldToLocal(point).normalize();
        var lat = (Math.asin(point.y) * 180) / Math.PI;
        var lon = 90 - (Math.atan2(point.x, point.z) * 180) / Math.PI;

        console.log("lat: " + lat + ", lon: " + lon);

        let shortestDistance = 0;
        let closestCard = null;
        let closestCardImage = null;

        const [cards, images] = await window.getCardsInBoundary(lon, lat);
        cards.forEach((card, index) => {
          var r = 6371;
          var dLat = ((card.lat - lat) * Math.PI) / 180;
          var dLon = ((card.lon - lon) * Math.PI) / 180;

          var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat * Math.PI) / 180) *
              Math.cos((card.lat * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          var distance = r * c;

          if (closestCard == null || distance < shortestDistance) {
            closestCard = card;
            closestCardImage = images[index];
            shortestDistance = distance;
          }
        });
        
        OnFind(closestCard, closestCardImage);
      }
      return;
    }
  }
}

const downListener = () => {
  moved = false;
};

const moveListener = () => {
  moved = true;
};

function OnFind(card, image) {
  console.log(card);
  document.getElementById("card-container").classList.remove("hidden");
  document.getElementById("card-name").innerHTML = card.name;
  document.getElementById("card-image").src = image;
  document.getElementById("card-description").innerHTML = card.description;
  document.getElementById("card-description").classList.add("hidden");
  document.getElementById("card-container").card = card;
  document.getElementById("front-card").classList.add("hidden");
  document.getElementById("back-card").classList.remove("hidden");
  document.getElementById("searchBackBtn").classList.remove("hidden");
  removeSearchListeners();
}

function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if (keyCode == 32) {
    spin = !spin;
  }
}

function onScroll(event) {
  var fov = camera.fov + event.deltaY * 0.05;
  camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
  camera.updateProjectionMatrix();
}

const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader();
const backgroundMusic = new THREE.Audio(listener);

audioLoader.load("/audio/Earth.mp3", function (buffer) {
  backgroundMusic.setBuffer(buffer);
  backgroundMusic.setLoop(true);
  backgroundMusic.setVolume(0.01);
  backgroundMusic.play();
});

const clickSound = new THREE.Audio(listener);
audioLoader.load("/audio/click earth.mp3", function (buffer) {
  clickSound.setBuffer(buffer);
  clickSound.setVolume(0.5);
});

function playClickSound() {
  clickSound.play();
}

export function setupSearchListeners() {
  document.addEventListener("keydown", onDocumentKeyDown, false);
  document.addEventListener("wheel", onScroll, false);
  document.addEventListener("mouseup", onMouseUp, false);
  document.addEventListener("mousedown", downListener, false);
  document.addEventListener("mousemove", moveListener, false);
  controls.enabled = true;

  moon.cursor = "pointer";
  sun.cursor = "pointer";
}

export function removeSearchListeners() {
  document.removeEventListener("keydown", onDocumentKeyDown, false);
  document.removeEventListener("wheel", onScroll, false);
  document.removeEventListener("mouseup", onMouseUp, false);
  document.removeEventListener("mousedown", downListener, false);
  document.removeEventListener("mousemove", moveListener, false);
  controls.enabled = false;

  moon.cursor = "default";
  sun.cursor = "default";
}

export function spinOn() {
  spin = true;
}

window.spinOn = spinOn;
window.setupSearchListeners = setupSearchListeners;
window.removeSearchListeners = removeSearchListeners;

function toggleMusic() {
  playClickSound();
  if (backgroundMusic.isPlaying) {
    backgroundMusic.pause();
  } else {
    backgroundMusic.play();
  }
}

function toggleSun() {
  playClickSound();
  spin = !spin;

  if (!spin) {
    earthOrbitSpeed = 0;
  } else {
    earthOrbitSpeed = 0.000125;
  }
}

function toggleEarth() {
  playClickSound();
}

function animate() {
  requestAnimationFrame(animate);
  // Calculate distance between camera and earth
  const distance = camera.position.distanceTo(earth.position);

  updateSpaceshipControls();

  

 // Define the threshold distance where the speed doubles
 const speedThreshold = 550;

 // Define the normal and faster orbit speeds
 const normalmoonSpeed = 0.00125; // Normal orbit speed
 const fasterSpeed = 0.0095; // Faster orbit speed

// Define the normal and doubled orbit speeds
const normalSpeed = 0.000125; // Normal orbit speed
const doubledSpeed = normalSpeed * 8; // Double the normal speed

// Calculate orbit speed based on distance
let moonOrbitSpeed;
if (distance <= speedThreshold) {
    moonOrbitSpeed = normalmoonSpeed; // Use normal speed within the threshold
} else {
    moonOrbitSpeed = fasterSpeed; // Use faster speed beyond the threshold
}

// Calculate orbit speed based on distance
if (distance <= speedThreshold) {
  earthOrbitSpeed = normalSpeed; // Use normal speed within the threshold
} else {
  earthOrbitSpeed = doubledSpeed; // Double the speed beyond the threshold
}
 
 
 
  // Toggle visibility of sun tail based on distance
  sunTail.visible = distance >= 1550;
  coilMesh.visible = distance >= 550;
  // coilMesh.visible = distance >= 350;
  particles.visible = distance >= 700;
  particles.children.forEach((particle) => {
    particle.position.y -= 0.5; // Move particles on the y-axis
    if (particle.position.y < 5000) {
      particle.position.set(
        Math.random() * 2 - 1,
        Math.random() * 2000 - 2000,
        Math.random() * 2 - 5
      );
    }
  });
  // Move and respawn stars
  stars.children.forEach((star, index) => {
    // Move stars on the y-axis with variable speed
    star.position.y -= 0.09 * starSpeedFactors[index];
    // Respawn stars when they leave the bounding box
    if (star.position.y < -1000) {
      let x, z;
      do {
        x = (Math.random() - 0.5) * 2000;
        z = (Math.random() - 0.5) * 2000;
      } while (Math.sqrt(x ** 2 + z ** 2) < radiusThreshold);
      star.position.set(x, 1000, z);
    }
  });

  if (spin) {
    const time = Date.now();
    const rotationAngle = earthOrbitSpeed * time;
    sun.rotation.x -= sunRotationSpeed;
    earth.rotation.y += earthRotationSpeed;
    moon.rotation.y += moonRotationSpeed;
    
    // Calculate Earth's position based on orbit speed
    earth.position.x = 200 * Math.cos(rotationAngle);
    earth.position.z = 200 * Math.sin(rotationAngle);

    // Update earth sunDirection uniform relative to earth's position
    earthMaterial.uniforms.sunDirection.value = new THREE.Vector3(
      sun.position.x - earth.position.x,
      sun.position.y - earth.position.y,
      sun.position.z - earth.position.z
    ).normalize();

    // Update earth sunDirection uniform relative to earth's position
    moonMaterial.uniforms.sunDirection.value = new THREE.Vector3(
      sun.position.x - moon.position.x,
      sun.position.y - moon.position.y,
      sun.position.z - moon.position.z
    ).normalize();

    moon.position.x =
      earth.position.x +
      moonOrbitRadius * Math.cos(moonOrbitSpeed * Date.now());

    moon.position.z =
      earth.position.z +
      moonOrbitRadius * Math.sin(moonOrbitSpeed * Date.now());


    coilMesh.position.x = sun.position.x;
    coilMesh.position.z = sun.position.z;
    // Rotation should make sure that the top of the coil is always coming out of the earth
    coilMesh.rotation.y = -rotationAngle;
  }
  renderer.render(scene, activeCamera);
  controls.target = earth.position;
  controls.update();
}

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  secondCamera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  secondCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

