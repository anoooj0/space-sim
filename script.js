// ===================== THREE.JS SCENE SETUP =====================

// Create an empty 3D scene - this is the container for all 3D objects
const scene = new THREE.Scene();

// Create a camera with 75° field of view, aspect ratio, near plane (0.1), far plane (50000)
// Near/far planes define what distances the camera can see
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  50000
);

// Create the WebGL renderer with antialiasing enabled for smoother edges
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Set the renderer to fill the entire browser window
renderer.setSize(window.innerWidth, window.innerHeight);

// Set background color to black (space color) using hex color 0x000000
renderer.setClearColor(0x000000);

// Add the renderer's canvas element to the HTML container div
document.getElementById("container").appendChild(renderer.domElement);

// ===================== SHIP DATA OBJECT =====================

// Create ship object to store all ship-related data and physics properties
const ship = {
  mesh: null, // Will hold the 3D ship geometry after creation
  velocity: new THREE.Vector3(0, 0, 0), // Current movement vector (x, y, z speeds)
  acceleration: 0, // Current forward/backward acceleration value
  maxSpeed: 200, // Base maximum speed limit for the ship
  speedMode: 1, // Current speed multiplier (1=slow, 2=medium, 3=fast)
  rotationSpeed: 0.02, // How fast the ship rotates when turning
};

// ===================== SPACESHIP CREATION =====================

// GLTF Loader for importing 3D models
const loader = new THREE.GLTFLoader();

function createSpaceship() {
  // Create main ship group to hold all parts
  ship.mesh = new THREE.Group();
  
  // Try to load a 3D model first, fallback to procedural if not found
  loadSpaceshipModel();
}

function loadSpaceshipModel() {
  // Check if there's a spaceship model in the assets folder
  const modelPath = './assets/Baked_Animations_Intergalactic_Spaceships_Version_2.gltf'; // You can change this path
  
  loader.load(
    modelPath,
    // onLoad callback
    function(gltf) {
      console.log('Spaceship model loaded successfully!');
      
      // Get the model from the loaded GLTF
      const model = gltf.scene;
      
      // Scale the model to appropriate size (adjust as needed)
      model.scale.set(0.5, 0.5, 0.5); // Scale down the model (professional models are often large)
      
      // Position the model (adjust as needed)
      model.position.set(0, 0, 0);
      
      // Rotate the model to face forward if needed
      // model.rotation.y = Math.PI; // Uncomment if model faces backward
      
      // Enable shadows on the model
      model.traverse(function(child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Add the model to the ship group
      ship.mesh.add(model);
      
      // Store reference to the model for potential future use
      ship.model = model;
      
      // Add the ship group to the scene
      scene.add(ship.mesh);
      
      console.log('Spaceship model added to scene');
    },
    // onProgress callback
    function(progress) {
      console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
    },
    // onError callback
    function(error) {
      console.log('Error loading spaceship model:', error);
      console.log('Falling back to procedural spaceship...');
      
      // Fallback to procedural ship if model loading fails
      createProceduralSpaceship();
    }
  );
}

function createProceduralSpaceship() {
  // This is the original procedural ship creation code as fallback
  console.log('Creating procedural spaceship...');

  // === ENHANCED MATERIALS ===
  const metallicMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x8a9ba8,
    shininess: 300,
    specular: 0x666666,
    metalness: 0.8
  });

  const darkMetalMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x2c3e50,
    shininess: 200,
    specular: 0x444444,
    metalness: 0.9
  });

  const cockpitMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x1a1a2e,
    transparent: true,
    opacity: 0.85,
    shininess: 400,
    specular: 0x888888,
    metalness: 0.3
  });

  // === MAIN HULL (More Realistic Shape) ===
  // Create a more sophisticated hull using multiple parts
  const hullGeometry = new THREE.CylinderGeometry(0.4, 0.15, 3.5, 16);
  const hull = new THREE.Mesh(hullGeometry, metallicMaterial);
  // No rotation needed - ship faces forward by default
  hull.castShadow = true;
  hull.receiveShadow = true;
  ship.mesh.add(hull);

  // Hull nose cone
  const noseGeometry = new THREE.ConeGeometry(0.15, 0.8, 12);
  const nose = new THREE.Mesh(noseGeometry, metallicMaterial);
  nose.position.set(0, 0, 2.1); // Position along Z-axis (forward)
  // No rotation needed - cone points forward by default
  nose.castShadow = true;
  nose.receiveShadow = true;
  ship.mesh.add(nose);

  // Hull details - panels and ridges
  const panelGeometry = new THREE.BoxGeometry(0.05, 0.3, 2.5);
  const panelMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x34495e,
    shininess: 150,
    specular: 0x333333
  });

  // Top panel
  const topPanel = new THREE.Mesh(panelGeometry, panelMaterial);
  topPanel.position.set(0, 0.45, 0);
  // No rotation needed - box is already oriented correctly
  ship.mesh.add(topPanel);

  // Bottom panel
  const bottomPanel = new THREE.Mesh(panelGeometry, panelMaterial);
  bottomPanel.position.set(0, -0.45, 0);
  // No rotation needed - box is already oriented correctly
  ship.mesh.add(bottomPanel);

  // === ENHANCED COCKPIT ===
  const cockpitGeometry = new THREE.SphereGeometry(0.5, 16, 12, 0, Math.PI);
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  cockpit.position.set(0, 0, 1.4); // Position along Z-axis (forward)
  // No rotation needed - sphere hemisphere faces forward by default
  ship.mesh.add(cockpit);

  // Cockpit frame
  const frameGeometry = new THREE.TorusGeometry(0.52, 0.03, 8, 16, Math.PI);
  const frameMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x7f8c8d,
    shininess: 300,
    specular: 0x666666
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.set(0, 0, 1.4); // Position along Z-axis (forward)
  // No rotation needed - torus faces forward by default
  ship.mesh.add(frame);

  // === REALISTIC WINGS ===
  // Create swept-back wings with more detail
  const wingGeometry = new THREE.BoxGeometry(1.2, 0.15, 2.0);
  const wingMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x34495e,
    shininess: 200,
    specular: 0x444444
  });
  
  // Left wing with sweep
  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  leftWing.position.set(0, 0.7, -0.3); // Position along Z-axis (backward)
  leftWing.rotation.set(0, -0.2, 0); // Rotate around Y-axis for sweep
  ship.mesh.add(leftWing);
  
  // Right wing with sweep
  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  rightWing.position.set(0, -0.7, -0.3); // Position along Z-axis (backward)
  rightWing.rotation.set(0, 0.2, 0); // Rotate around Y-axis for sweep
  ship.mesh.add(rightWing);

  // Wing tips
  const wingTipGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.8);
  const leftWingTip = new THREE.Mesh(wingTipGeometry, darkMetalMaterial);
  leftWingTip.position.set(0, 1.2, -0.8); // Position along Z-axis (backward)
  leftWingTip.rotation.set(0, -0.2, 0); // Rotate around Y-axis for sweep
  ship.mesh.add(leftWingTip);

  const rightWingTip = new THREE.Mesh(wingTipGeometry, darkMetalMaterial);
  rightWingTip.position.set(0, -1.2, -0.8); // Position along Z-axis (backward)
  rightWingTip.rotation.set(0, 0.2, 0); // Rotate around Y-axis for sweep
  ship.mesh.add(rightWingTip);

  // === ENHANCED ENGINE SYSTEM ===
  // Main engine housing
  const engineHousingGeometry = new THREE.CylinderGeometry(0.25, 0.3, 1.0, 12);
  const engineHousingMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x2c3e50,
    shininess: 300,
    specular: 0x555555
  });

  // Left engine housing
  const leftEngineHousing = new THREE.Mesh(engineHousingGeometry, engineHousingMaterial);
  leftEngineHousing.position.set(0, 0.5, -1.8); // Position along Z-axis (backward)
  // No rotation needed - cylinder points forward by default
  ship.mesh.add(leftEngineHousing);

  // Right engine housing
  const rightEngineHousing = new THREE.Mesh(engineHousingGeometry, engineHousingMaterial);
  rightEngineHousing.position.set(0, -0.5, -1.8); // Position along Z-axis (backward)
  // No rotation needed - cylinder points forward by default
  ship.mesh.add(rightEngineHousing);

  // Engine nozzles with more detail
  const nozzleGeometry = new THREE.CylinderGeometry(0.12, 0.18, 0.8, 12);
  const nozzleMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x1a1a1a,
    shininess: 400,
    specular: 0x888888,
    metalness: 0.9
  });
  
  // Left engine nozzle
  const leftEngine = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
  leftEngine.position.set(0, 0.5, -2.4); // Position along Z-axis (backward)
  // No rotation needed - cylinder points forward by default
  ship.mesh.add(leftEngine);
  
  // Right engine nozzle
  const rightEngine = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
  rightEngine.position.set(0, -0.5, -2.4); // Position along Z-axis (backward)
  // No rotation needed - cylinder points forward by default
  ship.mesh.add(rightEngine);

  // Engine cooling fins
  const finGeometry = new THREE.BoxGeometry(0.02, 0.3, 0.4);
  const finMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x34495e,
    shininess: 200
  });

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const fin = new THREE.Mesh(finGeometry, finMaterial);
    fin.position.set(Math.cos(angle) * 0.25, 0.5 + Math.sin(angle) * 0.25, -1.8); // Position along Z-axis (backward)
    fin.rotation.x = Math.PI / 2; // Rotate to be perpendicular to engine
    fin.rotation.y = angle;
    ship.mesh.add(fin);

    const fin2 = new THREE.Mesh(finGeometry, finMaterial);
    fin2.position.set(Math.cos(angle) * 0.25, -0.5 + Math.sin(angle) * 0.25, -1.8); // Position along Z-axis (backward)
    fin2.rotation.x = Math.PI / 2; // Rotate to be perpendicular to engine
    fin2.rotation.y = angle;
    ship.mesh.add(fin2);
  }

  // === NAVIGATION LIGHTS (Enhanced) ===
  // Red light (port/left) - more realistic
  const redLightGeometry = new THREE.SphereGeometry(0.08, 8, 8);
  const redLightMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff0000,
    transparent: true,
    opacity: 0.9
  });
  const redLight = new THREE.Mesh(redLightGeometry, redLightMaterial);
  redLight.position.set(0, 1.0, 0.8); // Position along Z-axis (forward)
  ship.mesh.add(redLight);
  
  // Green light (starboard/right)
  const greenLightMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,
    transparent: true,
    opacity: 0.9
  });
  const greenLight = new THREE.Mesh(redLightGeometry, greenLightMaterial);
  greenLight.position.set(0, -1.0, 0.8); // Position along Z-axis (forward)
  ship.mesh.add(greenLight);

  // White strobe light on top
  const strobeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
  const strobeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.9
  });
  const strobeLight = new THREE.Mesh(strobeGeometry, strobeMaterial);
  strobeLight.position.set(0, 0, 0.5); // Position along Z-axis (forward)
  ship.mesh.add(strobeLight);

  // === ANTENNA AND SENSORS ===
  // Communication antenna
  const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.6, 6);
  const antennaMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x7f8c8d,
    shininess: 300
  });
  const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
  antenna.position.set(0, 0, 1.8); // Position along Z-axis (forward)
  // No rotation needed - cylinder points up by default
  ship.mesh.add(antenna);

  // Sensor array
  const sensorGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.2);
  const sensorMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x95a5a6,
    shininess: 400
  });
  const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
  sensor.position.set(0, 0, 1.9); // Position along Z-axis (forward)
  ship.mesh.add(sensor);

  // === ENHANCED ENGINE EFFECTS ===
  // More realistic engine glow with multiple layers
  const glowGeometry = new THREE.ConeGeometry(0.3, 1.5, 12);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.8
  });
  
  // Left engine glow
  const leftGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  leftGlow.position.set(0, 0.5, -2.8); // Position along Z-axis (backward)
  leftGlow.rotation.x = Math.PI / 2; // Rotate to point backward
  ship.mesh.add(leftGlow);
  
  // Right engine glow
  const rightGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  rightGlow.position.set(0, -0.5, -2.8); // Position along Z-axis (backward)
  rightGlow.rotation.x = Math.PI / 2; // Rotate to point backward
  ship.mesh.add(rightGlow);

  // Inner engine glow (hotter core)
  const innerGlowGeometry = new THREE.ConeGeometry(0.15, 1.0, 8);
  const innerGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9
  });

  const leftInnerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
  leftInnerGlow.position.set(0, 0.5, -2.6); // Position along Z-axis (backward)
  leftInnerGlow.rotation.x = Math.PI / 2; // Rotate to point backward
  ship.mesh.add(leftInnerGlow);

  const rightInnerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
  rightInnerGlow.position.set(0, -0.5, -2.6); // Position along Z-axis (backward)
  rightInnerGlow.rotation.x = Math.PI / 2; // Rotate to point backward
  ship.mesh.add(rightInnerGlow);

  // Store engine glows and navigation lights for animation
  ship.engineGlows = [leftGlow, rightGlow, leftInnerGlow, rightInnerGlow];
  ship.navLights = [redLight, greenLight, strobeLight];

  // Add the ship group to the scene
  scene.add(ship.mesh);
}

// ===================== STARFIELD CREATION =====================

function createStarfield() {
  // Create buffer geometry for efficient rendering of many points
  const starGeometry = new THREE.BufferGeometry();

  // Number of stars to generate
  const starCount = 30000;

  // Create array to hold all star positions (3 numbers per star: x,y,z)
  const positions = new Float32Array(starCount * 3);

  // Loop through every 3rd index (each star needs x,y,z coordinates)
  for (let i = 0; i < starCount * 3; i += 3) {
    // Generate random X position between -10000 and +10000
    positions[i] = (Math.random() - 0.5) * 20000;

    // Generate random Y position between -10000 and +10000
    positions[i + 1] = (Math.random() - 0.5) * 20000;

    // Generate random Z position between -10000 and +10000
    positions[i + 2] = (Math.random() - 0.5) * 20000;
  }

  // Tell Three.js this array contains position data for the geometry
  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  // Create material for stars - white points that don't change size with distance
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff, // White color
    size: 2, // Pixel size of each star
    sizeAttenuation: false, // Stars stay same size regardless of distance
  });

  // Create points object (like mesh but for point clouds)
  const stars = new THREE.Points(starGeometry, starMaterial);

  // Add stars to scene
  scene.add(stars);
}

// ===================== SOLAR SYSTEM CREATION =====================

// Solar system data with realistic relative sizes and distances (scaled up for visibility)
const solarSystem = {
  sun: { radius: 35, distance: 0, color: 0xffaa44, emissive: 0xff4400, name: "Sun" },
  mercury: { radius: 12.5, distance: 50, color: 0x8c7853, speed: 0.02, name: "Mercury" },
  venus: { radius: 13.5, distance: 70, color: 0xffc649, speed: 0.015, name: "Venus" },
  earth: { radius: 14, distance: 90, color: 0x6b93d6, speed: 0.01, hasMoon: true, name: "Earth" },
  mars: { radius: 12.2, distance: 110, color: 0xc1440e, speed: 0.008, name: "Mars" },
  jupiter: { radius: 22, distance: 150, color: 0xd8ca9d, speed: 0.005, name: "Jupiter" },
  saturn: { radius: 20, distance: 190, color: 0xfad5a5, speed: 0.003, hasRings: true, name: "Saturn" },
  uranus: { radius: 15, distance: 230, color: 0x4fd0e7, speed: 0.002, name: "Uranus" },
  neptune: { radius: 14.5, distance: 270, color: 0x4b70dd, speed: 0.001, name: "Neptune" }
};

const planets = [];
const moons = [];

function createSolarSystem() {
  // Create the Sun
  createSun();
  
  // Create planets
  createPlanets();
  
  // Create asteroid belt
  createAsteroidBelt();
  
  // Create background nebula
  createNebula();
}

function createSun() {
  // Sun geometry
  const sunGeometry = new THREE.SphereGeometry(solarSystem.sun.radius, 32, 32);
  
  // Sun material with emission for glow effect
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: solarSystem.sun.color,
    emissive: solarSystem.sun.emissive,
    emissiveIntensity: 0.3
  });
  
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(0, 0, 0);
  sun.castShadow = false; // Sun doesn't cast shadows
  sun.receiveShadow = false;
  scene.add(sun);
  
  // Add sun glow effect
  const glowGeometry = new THREE.SphereGeometry(solarSystem.sun.radius * 1.2, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa44,
    transparent: true,
    opacity: 0.1
  });
  const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  sunGlow.position.set(0, 0, 0);
  scene.add(sunGlow);
  
  // Store sun for animation
  solarSystem.sun.mesh = sun;
  solarSystem.sun.glow = sunGlow;
}

function createPlanets() {
  Object.keys(solarSystem).forEach(planetName => {
    if (planetName === 'sun') return;
    
    const planetData = solarSystem[planetName];
    
    // Create planet geometry
    const planetGeometry = new THREE.SphereGeometry(planetData.radius, 32, 32);
    
    // Create planet material
    const planetMaterial = new THREE.MeshPhongMaterial({
      color: planetData.color,
      shininess: 100,
      specular: 0x222222
    });
    
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(planetData.distance, 0, 0);
    planet.castShadow = true;
    planet.receiveShadow = true;
    scene.add(planet);
    
    // Store planet data for animation
    planetData.mesh = planet;
    planetData.angle = Math.random() * Math.PI * 2; // Random starting position
    planets.push(planetData);
    
    // Create moon for Earth
    if (planetName === 'earth' && planetData.hasMoon) {
      createMoon(planet);
    }
    
    // Create rings for Saturn
    if (planetName === 'saturn' && planetData.hasRings) {
      createRings(planet);
    }
  });
}

function createMoon(planet) {
  const moonGeometry = new THREE.SphereGeometry(0.8, 16, 16); // Scaled up moon
  const moonMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
  
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.set(planet.position.x + 6, 0, 0); // Scaled up distance
  moon.castShadow = true;
  moon.receiveShadow = true;
  scene.add(moon);
  
  moons.push({
    mesh: moon,
    parent: planet,
    distance: 6, // Scaled up distance
    angle: Math.random() * Math.PI * 2,
    speed: 0.05
  });
}

function createRings(planet) {
  const ringGeometry = new THREE.RingGeometry(planet.geometry.parameters.radius * 1.5, planet.geometry.parameters.radius * 2.5, 32);
  const ringMaterial = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  
  const rings = new THREE.Mesh(ringGeometry, ringMaterial);
  rings.rotation.x = Math.PI / 2;
  rings.position.copy(planet.position);
  scene.add(rings);
  
  planet.rings = rings;
}

function createAsteroidBelt() {
  const asteroidCount = 300; // More asteroids for better visibility
  const innerRadius = 130; // Between Mars and Jupiter (scaled up)
  const outerRadius = 170;
  
  for (let i = 0; i < asteroidCount; i++) {
    const asteroidGeometry = new THREE.SphereGeometry(
      Math.random() * 0.8 + 0.2, // Scaled up asteroid sizes
      8, 8
    );
    const asteroidMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      shininess: 50
    });
    
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    
    // Random position in belt
    const angle = Math.random() * Math.PI * 2;
    const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
    const height = (Math.random() - 0.5) * 30; // Scaled up height variation
    
    asteroid.position.set(
      Math.cos(angle) * distance,
      height,
      Math.sin(angle) * distance
    );
    
    asteroid.castShadow = true;
    asteroid.receiveShadow = true;
    scene.add(asteroid);
    
    // Store for animation
    asteroid.userData = {
      angle: angle,
      distance: distance,
      speed: 0.001 + Math.random() * 0.002
    };
  }
}

function createNebula() {
  // Create a subtle nebula background
  const nebulaGeometry = new THREE.SphereGeometry(2000, 32, 32);
  const nebulaMaterial = new THREE.MeshBasicMaterial({
    color: 0x220044,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  
  const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
  scene.add(nebula);
}

// ===================== REALISTIC SOLAR LIGHTING SETUP =====================

// Create ambient light - very dim for space
const ambientLight = new THREE.AmbientLight(0x202040, 0.1);
scene.add(ambientLight);

// Create the Sun as the main light source
const sunLight = new THREE.PointLight(0xffaa44, 2, 1000);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 1000;
scene.add(sunLight);

// Store sun light for animation
solarSystem.sun.light = sunLight;

// Add subtle fill light for better visibility
const fillLight = new THREE.DirectionalLight(0x4a90e2, 0.2);
fillLight.position.set(50, 50, 50);
scene.add(fillLight);

// Enable shadows on the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ===================== INITIALIZE GAME OBJECTS =====================

// Call functions to create all 3D objects
createSpaceship(); // Build and add ship to scene
createStarfield(); // Generate and add 30000 stars
createSolarSystem(); // Create realistic solar system

// ===================== INITIAL POSITIONING =====================

// Place ship at world origin (center of coordinate system)
ship.mesh.position.set(0, 0, 0);

// Position camera behind and above ship (third-person view)
camera.position.set(0, 5, 10);

// Point camera to look at ship's position
camera.lookAt(ship.mesh.position);

// ===================== INPUT HANDLING SETUP =====================

// Object to track which keys are currently pressed (true/false for each key)
const keys = {};

// Object to track mouse state and position
const mouse = { x: 0, y: 0, isDown: false };

// Listen for key press events and mark key as pressed in keys object
document.addEventListener("keydown", (e) => (keys[e.code] = true));

// Listen for key release events and mark key as not pressed
document.addEventListener("keyup", (e) => (keys[e.code] = false));

// Handle mouse button press (left button = 0)
document.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    // Check if left mouse button
    mouse.isDown = true; // Mark mouse as pressed
    document.body.style.cursor = "grabbing"; // Change cursor to grabbing hand
  }
});

// Handle mouse button release
document.addEventListener("mouseup", (e) => {
  if (e.button === 0) {
    // Check if left mouse button
    mouse.isDown = false; // Mark mouse as released
    document.body.style.cursor = "default"; // Reset cursor to default
  }
});

// Handle mouse movement for looking around
document.addEventListener("mousemove", (e) => {
  if (mouse.isDown) {
    // Only rotate ship if mouse button is held down
    // Get mouse movement delta and scale down for smoother rotation
    const deltaX = e.movementX * 0.002; // Horizontal mouse movement
    const deltaY = e.movementY * 0.002; // Vertical mouse movement

    // Apply horizontal mouse movement to ship's Y rotation (turning left/right)
    ship.mesh.rotation.y -= deltaX;

    // Apply vertical mouse movement to ship's X rotation (pitching up/down)
    ship.mesh.rotation.x -= deltaY;

    // Clamp pitch rotation to prevent ship from flipping upside down
    // Math.max/min limits rotation between -90° and +90°
    ship.mesh.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, ship.mesh.rotation.x)
    );
  }
});

// ===================== MAIN GAME LOOP =====================

function animate() {
  // Request next frame from browser (usually 60 FPS)
  // This creates smooth animation by calling animate() repeatedly
  requestAnimationFrame(animate);

  // Process all keyboard input and update ship controls
  handleInput();

  // Update ship's physics (velocity, position, etc.)
  updateShip();

  // Move camera to follow ship
  updateCamera();

  // Update the HTML UI elements with current ship data
  updateUI();

  // Update solar system animation
  updateSolarSystem();

  // Render the 3D scene to the screen
  renderer.render(scene, camera);
}

// ===================== INPUT PROCESSING =====================

function handleInput() {
  // Create forward direction vector (negative Z = forward in Three.js)
  const forward = new THREE.Vector3(0, 0, -1);

  // Apply ship's current rotation to forward vector
  // This gives us the direction the ship is actually pointing
  forward.applyQuaternion(ship.mesh.quaternion);

  // Check for speed mode changes (1, 2, 3 keys)
  if (keys["Digit1"]) ship.speedMode = 1; // Slow mode
  if (keys["Digit2"]) ship.speedMode = 2; // Medium mode
  if (keys["Digit3"]) ship.speedMode = 3; // Fast mode

  // Store speed multiplier for easy access
  const speedMultiplier = ship.speedMode;

  // Handle forward/backward movement (W/S keys)
  if (keys["KeyW"]) {
    // Accelerate forward - positive acceleration scaled by speed mode
    ship.acceleration = 0.5 * speedMultiplier;
  } else if (keys["KeyS"]) {
    // Accelerate backward - negative acceleration (smaller for realism)
    ship.acceleration = -0.3 * speedMultiplier;
  } else {
    // No input = no acceleration (ship will coast due to momentum)
    ship.acceleration = 0;
  }

  // Handle ship rotation (A/D for turning, Q/E for rolling)
  if (keys["KeyA"]) ship.mesh.rotation.y += ship.rotationSpeed; // Turn left
  if (keys["KeyD"]) ship.mesh.rotation.y -= ship.rotationSpeed; // Turn right
  if (keys["KeyQ"]) ship.mesh.rotation.z += ship.rotationSpeed; // Roll left
  if (keys["KeyE"]) ship.mesh.rotation.z -= ship.rotationSpeed; // Roll right

  // Handle vertical rotation (Space/Shift for pitch up/down)
  if (keys["Space"]) ship.mesh.rotation.x += ship.rotationSpeed; // Pitch up
  if (keys["ShiftLeft"]) ship.mesh.rotation.x -= ship.rotationSpeed; // Pitch down

  // Prevent ship from doing complete loops - limit pitch to +/- 90 degrees
  ship.mesh.rotation.x = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, ship.mesh.rotation.x)
  );
}

// ===================== SHIP PHYSICS UPDATE =====================

function updateShip() {
  // Get the direction ship is currently pointing
  const forward = new THREE.Vector3(0, 0, -1); // Start with "forward" direction
  forward.applyQuaternion(ship.mesh.quaternion); // Rotate by ship's orientation

  // Create acceleration vector in the forward direction
  const accelVector = forward.clone().multiplyScalar(ship.acceleration);

  // Add acceleration to current velocity (this is how real physics works)
  ship.velocity.add(accelVector);

  // Apply drag/friction - multiply velocity by 0.98 to slowly reduce speed
  // This prevents infinite acceleration and makes ship feel more realistic
  ship.velocity.multiplyScalar(0.98);

  // Calculate current speed (magnitude of velocity vector)
  const currentSpeed = ship.velocity.length();

  // Enforce maximum speed limit based on current speed mode
  if (currentSpeed > ship.maxSpeed * ship.speedMode) {
    // If over speed limit, normalize velocity (make it length 1)
    // then scale back to maximum allowed speed
    ship.velocity.normalize().multiplyScalar(ship.maxSpeed * ship.speedMode);
  }

  // Update ship's 3D position by adding velocity vector
  // This moves the ship through 3D space based on its current velocity
  ship.mesh.position.add(ship.velocity);

  // === DYNAMIC ENGINE EFFECTS ===
  if (ship.engineGlows) {
    // Calculate engine intensity based on acceleration
    const engineIntensity = Math.abs(ship.acceleration) / 2.0;
    const time = Date.now() * 0.005; // Time for animation
    
    // Handle outer engine glows (first 2 elements)
    ship.engineGlows.slice(0, 2).forEach((glow, index) => {
      // Animate engine glow opacity based on thrust
      glow.material.opacity = 0.2 + engineIntensity * 0.6 + Math.sin(time + index) * 0.1;
      
      // Scale engine flames based on acceleration
      const scale = 0.8 + engineIntensity * 0.5 + Math.sin(time * 2 + index) * 0.1;
      glow.scale.set(scale, scale, scale);
      
      // Change color based on thrust intensity
      if (ship.acceleration > 0) {
        // Forward thrust - blue to white
        glow.material.color.setHSL(0.6, 1 - engineIntensity * 0.3, 0.5 + engineIntensity * 0.3);
      } else if (ship.acceleration < 0) {
        // Reverse thrust - red
        glow.material.color.setHSL(0, 1, 0.5 + engineIntensity * 0.3);
      } else {
        // Idle - dim blue
        glow.material.color.setHSL(0.6, 0.8, 0.3);
      }
    });

    // Handle inner engine glows (hotter core - last 2 elements)
    ship.engineGlows.slice(2, 4).forEach((glow, index) => {
      // More intense animation for inner core
      glow.material.opacity = 0.4 + engineIntensity * 0.5 + Math.sin(time * 3 + index) * 0.2;
      
      // Scale inner core flames
      const scale = 0.9 + engineIntensity * 0.3 + Math.sin(time * 4 + index) * 0.15;
      glow.scale.set(scale, scale, scale);
      
      // Inner core is always white/blue-white
      if (ship.acceleration > 0) {
        glow.material.color.setHSL(0.6, 0.2, 0.8 + engineIntensity * 0.2);
      } else if (ship.acceleration < 0) {
        glow.material.color.setHSL(0.1, 0.8, 0.7 + engineIntensity * 0.3);
      } else {
        glow.material.color.setHSL(0.6, 0.1, 0.6);
      }
    });
  }

  // === ANIMATED NAVIGATION LIGHTS ===
  if (ship.navLights) {
    const blinkTime = Date.now() * 0.003;
    ship.navLights.forEach((light, index) => {
      // Create blinking effect with different timing for each light
      const blink = Math.sin(blinkTime + index * Math.PI) > 0.5 ? 1 : 0.3;
      light.material.opacity = blink;
    });
  }
}

// ===================== CAMERA UPDATE =====================

function updateCamera() {
  // Define camera offset from ship (behind and above for third-person view)
  const offset = new THREE.Vector3(0, 3, 8); // 3 units up, 8 units back

  // Rotate offset by ship's orientation so camera follows ship's rotation
  offset.applyQuaternion(ship.mesh.quaternion);

  // Position camera at ship position + rotated offset
  camera.position.copy(ship.mesh.position).add(offset);

  // Always look at the ship
  camera.lookAt(ship.mesh.position);
}

// ===================== UI UPDATE =====================

function updateUI() {
  // Calculate current speed and round to whole number for display
  const speed = Math.round(ship.velocity.length());

  // Get ship's current 3D position
  const pos = ship.mesh.position;

  // Calculate distance from sun (origin) - useful for navigation
  const distanceFromSun = Math.round(pos.length());

  // Find nearest planet
  let nearestPlanet = "Space";
  let nearestDistance = Infinity;
  
  planets.forEach(planet => {
    if (planet.mesh) {
      const distance = pos.distanceTo(planet.mesh.position);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPlanet = planet.name || "Unknown";
      }
    }
  });

  // Update speed display with current speed and mode
  document.getElementById(
    "speed"
  ).textContent = `Speed: ${speed} (Mode ${ship.speedMode})`;

  // Update position display with rounded X, Y, Z coordinates
  document.getElementById("position").textContent = `Position: (${Math.round(
    pos.x
  )}, ${Math.round(pos.y)}, ${Math.round(pos.z)})`;

  // Update distance from sun and nearest planet
  document.getElementById(
    "altitude"
  ).textContent = `Distance from Sun: ${distanceFromSun} | Near: ${nearestPlanet}`;
}

// ===================== SOLAR SYSTEM ANIMATION =====================

function updateSolarSystem() {
  // Animate planets in their orbits
  planets.forEach(planet => {
    if (planet.mesh) {
      planet.angle += planet.speed;
      planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
      planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
      
      // Update rings position for Saturn
      if (planet.rings) {
        planet.rings.position.copy(planet.mesh.position);
      }
    }
  });
  
  // Animate moons
  moons.forEach(moon => {
    moon.angle += moon.speed;
    moon.mesh.position.x = moon.parent.position.x + Math.cos(moon.angle) * moon.distance;
    moon.mesh.position.z = moon.parent.position.z + Math.sin(moon.angle) * moon.distance;
  });
  
  // Animate asteroids
  scene.children.forEach(child => {
    if (child.userData && child.userData.angle !== undefined) {
      child.userData.angle += child.userData.speed;
      child.position.x = Math.cos(child.userData.angle) * child.userData.distance;
      child.position.z = Math.sin(child.userData.angle) * child.userData.distance;
    }
  });
  
  // Animate sun glow
  if (solarSystem.sun.glow) {
    solarSystem.sun.glow.rotation.y += 0.001;
  }
}

// ===================== WINDOW RESIZE HANDLING =====================

// Listen for browser window resize events
window.addEventListener("resize", () => {
  // Update camera aspect ratio to match new window dimensions
  camera.aspect = window.innerWidth / window.innerHeight;

  // Tell camera to recalculate its projection matrix with new aspect ratio
  camera.updateProjectionMatrix();

  // Resize renderer to match new window size
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===================== START THE SIMULATION =====================

// Begin the game loop - this starts the entire simulation running
animate();
