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

function createSpaceship() {
  // Create main ship group to hold all parts
  ship.mesh = new THREE.Group();

  // === MAIN HULL ===
  const hullGeometry = new THREE.CylinderGeometry(0.3, 0.1, 3, 12);
  const hullMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x4a5568,
    shininess: 100,
    specular: 0x222222
  });
  const hull = new THREE.Mesh(hullGeometry, hullMaterial);
  hull.rotation.z = Math.PI / 2; // Point forward
  ship.mesh.add(hull);

  // === COCKPIT ===
  const cockpitGeometry = new THREE.SphereGeometry(0.4, 12, 8, 0, Math.PI);
  const cockpitMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x1a202c,
    transparent: true,
    opacity: 0.8,
    shininess: 150
  });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  cockpit.position.x = 1.2;
  cockpit.rotation.y = Math.PI / 2;
  ship.mesh.add(cockpit);

  // === WINGS ===
  const wingGeometry = new THREE.BoxGeometry(0.8, 0.1, 1.5);
  const wingMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x2d3748,
    shininess: 80
  });
  
  // Left wing
  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  leftWing.position.set(0, 0.6, 0);
  ship.mesh.add(leftWing);
  
  // Right wing
  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  rightWing.position.set(0, -0.6, 0);
  ship.mesh.add(rightWing);

  // === ENGINE NOZZLES ===
  const nozzleGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8);
  const nozzleMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x1a1a1a,
    shininess: 200,
    specular: 0x444444
  });
  
  // Left engine
  const leftEngine = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
  leftEngine.position.set(-1.3, 0.4, 0);
  leftEngine.rotation.z = Math.PI / 2;
  ship.mesh.add(leftEngine);
  
  // Right engine
  const rightEngine = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
  rightEngine.position.set(-1.3, -0.4, 0);
  rightEngine.rotation.z = Math.PI / 2;
  ship.mesh.add(rightEngine);

  // === NAVIGATION LIGHTS ===
  // Red light (port/left)
  const redLightGeometry = new THREE.SphereGeometry(0.05, 6, 6);
  const redLightMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff0000,
    transparent: true,
    opacity: 0.9
  });
  const redLight = new THREE.Mesh(redLightGeometry, redLightMaterial);
  redLight.position.set(0.5, 0.8, 0);
  ship.mesh.add(redLight);
  
  // Green light (starboard/right)
  const greenLightMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,
    transparent: true,
    opacity: 0.9
  });
  const greenLight = new THREE.Mesh(redLightGeometry, greenLightMaterial);
  greenLight.position.set(0.5, -0.8, 0);
  ship.mesh.add(greenLight);

  // === ENGINE EFFECTS ===
  // Main engine glow
  const glowGeometry = new THREE.ConeGeometry(0.25, 1.2, 8);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.7
  });
  
  // Left engine glow
  const leftGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  leftGlow.position.set(-2.1, 0.4, 0);
  leftGlow.rotation.z = -Math.PI / 2;
  ship.mesh.add(leftGlow);
  
  // Right engine glow
  const rightGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  rightGlow.position.set(-2.1, -0.4, 0);
  rightGlow.rotation.z = -Math.PI / 2;
  ship.mesh.add(rightGlow);

  // Store engine glows and navigation lights for animation
  ship.engineGlows = [leftGlow, rightGlow];
  ship.navLights = [redLight, greenLight];

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

// ===================== PLANET CREATION =====================

function createPlanets() {
  // Array of planet data: position [x,y,z], size (radius), color
  const planets = [
    { pos: [1000, 0, 0], size: 50, color: 0xff6666 }, // Red planet to the right
    { pos: [-800, 500, 1200], size: 30, color: 0x66ff66 }, // Green planet up-left-back
    { pos: [0, -1500, 800], size: 100, color: 0x6666ff }, // Large blue planet below-back
  ];

  // Loop through each planet definition
  planets.forEach((planet) => {
    // Create sphere geometry with radius, width segments, height segments
    const geometry = new THREE.SphereGeometry(planet.size, 32, 32);

    // Create Lambert material (responds to light) with planet's color
    const material = new THREE.MeshLambertMaterial({ color: planet.color });

    // Combine geometry and material into mesh
    const mesh = new THREE.Mesh(geometry, material);

    // Set planet position using spread operator to unpack [x,y,z] array
    mesh.position.set(...planet.pos);

    // Add planet to scene
    scene.add(mesh);
  });
}

// ===================== LIGHTING SETUP =====================

// Create ambient light - provides dim lighting to all objects equally
// Color 0x404040 = dark gray, intensity 0.4 = 40% brightness
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

// Create directional light - acts like sunlight from a specific direction
// Color 0xffffff = white, intensity 0.6 = 60% brightness
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);

// Position light source at coordinates (100, 100, 50)
directionalLight.position.set(100, 100, 50);
scene.add(directionalLight);

// ===================== INITIALIZE GAME OBJECTS =====================

// Call functions to create all 3D objects
createSpaceship(); // Build and add ship to scene
createStarfield(); // Generate and add 10000 stars
createPlanets(); // Create and add 3 planets

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
    
    ship.engineGlows.forEach((glow, index) => {
      // Animate engine glow opacity based on thrust
      glow.material.opacity = 0.3 + engineIntensity * 0.7 + Math.sin(time + index) * 0.1;
      
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

  // Calculate distance from origin (0,0,0) - useful for navigation
  const altitude = Math.round(pos.length());

  // Update speed display with current speed and mode
  document.getElementById(
    "speed"
  ).textContent = `Speed: ${speed} (Mode ${ship.speedMode})`;

  // Update position display with rounded X, Y, Z coordinates
  document.getElementById("position").textContent = `Position: (${Math.round(
    pos.x
  )}, ${Math.round(pos.y)}, ${Math.round(pos.z)})`;

  // Update distance from origin
  document.getElementById(
    "altitude"
  ).textContent = `Distance from Origin: ${altitude}`;
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
