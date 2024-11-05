// !Scene, Camera, and Renderer Setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.5, 5000);
camera.position.z = 1000;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Raycaster and Mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const planetTooltip = document.getElementById('planet-tooltip');

// Lights
const ambientLight = new THREE.AmbientLight(0xffff00, 0.4);
scene.add(ambientLight);
const light = new THREE.PointLight(0xffffff, 1, 1000);
light.position.set(0, 0, 0);
scene.add(light);

// Sun with Glow
const sunTexture = new THREE.TextureLoader().load('../assets/image/sun.jpg');
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(new THREE.SphereGeometry(40, 64, 64), sunMaterial);
scene.add(sun);

// Star Field
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0x88ccff, size: 0.7 });
    const starCount = 1000;
    const positions = [];

    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.3) * 8000;
        const y = (Math.random() - 0.3) * 8000;
        const z = (Math.random() - 0.3) * 8000;
        positions.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}
createStarField();


// Nebula Background
const nebulaTexture = new THREE.TextureLoader().load('../assets/image/milky_way.jpg');
const nebulaMaterial = new THREE.MeshBasicMaterial({
    map: nebulaTexture,
    side: THREE.BackSide // Ensure the texture is visible from inside
});
const nebulaGeometry = new THREE.SphereGeometry(4000, 40, 40); // Large sphere surrounding the scene
const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
scene.add(nebula);

// Planets Data
const planetsData = [
    { name: "Mercury", distance: 80, size: 10, speed: 0.0015, texture: '../assets/image/mercury.jpg' },
    { name: "Venus", distance: 130, size: 12, speed: 0.002, texture: '../assets/image/venus.jpg' },
    { name: "Earth", distance: 180, size: 16, speed: 0.00175, texture: '../assets/image/earth.jpg', moons: 1 },
    { name: "Mars", distance: 250, size: 14, speed: 0.0015, texture: '../assets/image/mars.jpg', moons: 2 },
    { name: "Jupiter", distance: 350, size: 24, speed: 0.00125, texture: '../assets/image/jupiter.jpg', moons: 4 },
    { name: "Saturn", distance: 400, size: 20, speed: 0.001, texture: '../assets/image/saturn.jpg', moons: 6 },
    { name: "Uranus", distance: 500, size: 16, speed: 0.00075, texture: '../assets/image/uranus.jpg', moons: 3 },
    { name: "Neptune", distance: 600, size: 16, speed: 0.0006, texture: '../assets/image/neptune.jpg', moons: 1 },
    { name: "Pluto", distance: 800, size: 8, speed: 0.0004, texture: '../assets/image/dwarfPlanets/pluto.jpg', moons: 5 },
];

// Constants and Color Map for Orbit Lines
const orbitColors = {
    "Mercury": 0xaaaaaa,
    "Venus": 0xffa500,
    "Earth": 0x0000ff,
    "Mars": 0xff0000,
    "Jupiter": 0xffff00,
    "Saturn": 0xffd700,
    "Uranus": 0x00ffff,
    "Neptune": 0x00008b,
    "Pluto": 0x8b4513
};

// Adding Orbits
function createOrbit(distance, color) {
    const curve = new THREE.EllipseCurve(0, 0, distance, distance, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    const orbit = new THREE.Line(geometry, material);
    orbit.rotation.x = Math.PI / 2; // Rotate to lie on the x-z plane
    scene.add(orbit);
}

planetsData.forEach(planet => {
    createOrbit(planet.distance, orbitColors[planet.name]);
});

// Famous Satellites
const satellites = [
    { name: "Hubble", planet: "Earth", distance: 190, size: 3, speed: 0.0025, texture: '../assets/image/sun.jpg' },
    { name: "Voyager 1", planet: "Jupiter", distance: 500, size: 3, speed: 0.0009, texture: '../assets/image/sun.jpg' },
    { name: "Voyager 2", planet: "Saturn", distance: 600, size: 3, speed: 0.001, texture: '../assets/image/sun.jpg' },
    { name: "Cassini", planet: "Saturn", distance: 410, size: 3, speed: 0.00075, texture: '../assets/image/sun.jpg' }
];

const satelliteMeshes = [];
satellites.forEach(satellite => {
    const texture = new THREE.TextureLoader().load(satellite.texture);
    const satelliteMesh = new THREE.Mesh(new THREE.SphereGeometry(satellite.size, 16, 16), new THREE.MeshBasicMaterial({ map: texture }));
    satelliteMesh.userData = { ...satellite, angle: Math.random() * Math.PI * 2 };
    satelliteMeshes.push(satelliteMesh);
    scene.add(satelliteMesh);
});

// Planets
const planetMeshes = [];
planetsData.forEach(planet => {
    const texture = new THREE.TextureLoader().load(planet.texture);
    const planetMesh = new THREE.Mesh(new THREE.SphereGeometry(planet.size, 16, 16), new THREE.MeshBasicMaterial({ map: texture }));
    planetMesh.userData = { ...planet, angle: Math.random() * Math.PI * 2 };
    scene.add(planetMesh);
    planetMeshes.push(planetMesh);
});

// Animation Function
function animate() {
    requestAnimationFrame(animate);

    // Rotate planets and satellites
    planetMeshes.forEach(planet => {
        planet.userData.angle += planet.userData.speed;
        planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
        planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
    });

    satelliteMeshes.forEach(satellite => {
        const parentPlanet = planetMeshes.find(p => p.userData.name === satellite.userData.planet);
        satellite.userData.angle += satellite.userData.speed;
        satellite.position.x = parentPlanet.position.x + Math.cos(satellite.userData.angle) * satellite.userData.distance;
        satellite.position.z = parentPlanet.position.z + Math.sin(satellite.userData.angle) * satellite.userData.distance;
    });

    renderer.render(scene, camera);
}
animate();

// Raycaster for Tooltip and Clicks
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([sun, ...planetMeshes]);

    if (intersects.length > 0) {
        const celestialBody = intersects[0].object;
        if (celestialBody === sun) {
            planetTooltip.style.display = 'block';
            planetTooltip.style.top = `${event.clientY + 10}px`;
            planetTooltip.style.left = `${event.clientX + 10}px`;
            planetTooltip.innerHTML = `<strong>Sun</strong>`;
        } else {
            const { name, size, distance } = celestialBody.userData;
            planetTooltip.style.display = 'block';
            planetTooltip.style.top = `${event.clientY + 10}px`;
            planetTooltip.style.left = `${event.clientX + 10}px`;
            planetTooltip.innerHTML = `
                <strong>${name}</strong><br>
                Distance from Sun: ${distance} AU<br>
                Size: ${size} km
            `;
        }
    } else {
        planetTooltip.style.display = 'none';
    }
});

// Click Event Handler
window.addEventListener('click', (event) => {
    const intersects = raycaster.intersectObjects([sun, ...planetMeshes], false);
    if (intersects.length > 0) {
        const celestialBody = intersects[0].object;
        const name = celestialBody === sun ? 'sun' : celestialBody.userData.name.toLowerCase();
        window.location.href = `${name}.html`;
    }
});

// Mouse Drag Rotation
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
}
function onMouseMove(event) {
    if (!isDragging) return;
    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
    };
    scene.rotation.y += deltaMove.x * 0.002;
    scene.rotation.x += deltaMove.y * 0.002;
    previousMousePosition = { x: event.clientX, y: event.clientY };
}
function onMouseUp() { isDragging = false; }
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);
// Scroll Zoom
let zoom = 1;
window.addEventListener('wheel', (event) => {
    zoom += event.deltaY * -0.0005;
    zoom = Math.min(1, Math.max(0.1, zoom)); // Only limit the minimum zoom level
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
});

// Resize Handling
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// More Stars with Varying Colors
// Enhanced Star Field with Varied Colors
function createEnhancedStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        size: 0.7,
        sizeAttenuation: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        map: new THREE.TextureLoader().load('../assets/image/circle.png'),
    });
    const starCount = 1500;
    const positions = [];
    const colors = [];

    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 8000;
        const y = (Math.random() - 0.5) * 8000;
        const z = (Math.random() - 0.5) * 8000;
        positions.push(x, y, z);

        // Assign random colors
        const color = new THREE.Color(Math.random(), Math.random(), Math.random());
        colors.push(color.r, color.g, color.b);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const enhancedStars = new THREE.Points(starGeometry, starMaterial);
    scene.add(enhancedStars);
}
createEnhancedStarField();



// Create a draggable zoom slider UI
const sliderContainer = document.createElement('div');
sliderContainer.style.position = 'absolute';
sliderContainer.style.top = '10px';
sliderContainer.style.right = '10px';
sliderContainer.style.width = '60px';
sliderContainer.style.height = '200px';
sliderContainer.style.background = 'rgba(255, 255, 255, 0.1)';
sliderContainer.style.borderRadius = '10px';
sliderContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
sliderContainer.style.display = 'flex';
sliderContainer.style.alignItems = 'center';
sliderContainer.style.justifyContent = 'center';

const slider = document.createElement('input');
slider.type = 'range';
slider.min = '0.1';
slider.max = '2';
slider.step = '0.01';
slider.value = zoom;
slider.style.transform = 'rotate(-90deg)';
slider.style.width = '250px';
slider.style.appearance = 'none';
slider.style.background = 'transparent';
slider.style.cursor = 'pointer';

slider.style.outline = 'none';
slider.style.borderRadius = '5px';
slider.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
slider.style.transition = 'box-shadow 0.3s ease';

slider.addEventListener('input', (event) => {
zoom = parseFloat(event.target.value);
camera.zoom = zoom;
camera.updateProjectionMatrix();
slider.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.7)';
});

slider.addEventListener('mouseenter', () => {
slider.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.7)';
});

slider.addEventListener('mouseleave', () => {
slider.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
});

sliderContainer.appendChild(slider);
document.body.appendChild(sliderContainer);

