// !Scene, Camera, and Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.z = 600;

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
        const x = (Math.random() - 0.5) * 8000;
        const y = (Math.random() - 0.5) * 8000;
        const z = (Math.random() - 0.5) * 8000;
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
const nebulaGeometry = new THREE.SphereGeometry(4000, 32, 32); // Large sphere surrounding the scene
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
    { name: "Pluto", distance: 800, size: 8, speed: 0.0004, texture: '../assets/image/pluto.jpg', moons: 5 },
];

// Saturn Ring
const saturnRingTexture = new THREE.TextureLoader().load('../assets/image/saturn-ring.jpg');
const saturnRingGeometry = new THREE.RingGeometry(22, 30, 64);
const saturnRingMaterial = new THREE.MeshBasicMaterial({ map: saturnRingTexture, side: THREE.DoubleSide, transparent: true });
const saturnRing = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
saturnRing.rotation.x = Math.PI / 2;
saturnRing.position.set(
    planetsData.find(planet => planet.name === "Saturn").distance,
    0,
    0
);
scene.add(saturnRing);

// Planets
const planetMeshes = [];
planetsData.forEach(planet => {
    const texture = new THREE.TextureLoader().load(planet.texture);
    const planetMesh = new THREE.Mesh(new THREE.SphereGeometry(planet.size, 16, 16), new THREE.MeshBasicMaterial({ map: texture }));
    planetMesh.userData = { ...planet, angle: Math.random() * Math.PI * 2 };
    scene.add(planetMesh);
    planetMeshes.push(planetMesh);

    // Add Moon to Earth
    if (planet.name === "Earth") {
        const moonTexture = new THREE.TextureLoader().load('../assets/image/moon.jpg');
        const moon = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 16), new THREE.MeshBasicMaterial({ map: moonTexture }));
        moon.position.set(36, 0, 0);
        moon.userData = {
            angle: Math.random() * Math.PI * 2,
            distance: 36,
            speed: 0.003,
        };
        planetMesh.add(moon);
        let moonAngle = 0;
        function rotateMoon() {
            moonAngle += 0.01;
            moon.position.x = Math.cos(moonAngle) * moon.userData.distance;
            moon.position.z = Math.sin(moonAngle) * moon.userData.distance;
            requestAnimationFrame(rotateMoon);
        }
        rotateMoon();
    }
});

// Asteroid Belt
const asteroidCount = 500;
for (let i = 0; i < asteroidCount; i++) {
    const asteroid = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xaaaaaa })
    );
    const angle = Math.random() * Math.PI * 2;
    const radius = 400 + Math.random() * 60;
    asteroid.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 5, Math.sin(angle) * radius);
    asteroid.userData = { angle: angle, distance: radius, speed: 0.001 };
    scene.add(asteroid);
}

// Animation Function
function animate() {
    requestAnimationFrame(animate);

    // Rotate Sun
    sun.rotation.y += 0.0005;

    // Rotate Planets
    planetMeshes.forEach(planet => {
        planet.userData.angle += planet.userData.speed;
        planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
        planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;

        // Rotate Moon
        if (planet.name === "Earth") {
            const moon = planet.children[0];
            moon.userData.angle += moon.userData.speed;
            moon.position.x = Math.cos(moon.userData.angle) * moon.userData.distance;
            moon.position.z = Math.sin(moon.userData.angle) * moon.userData.distance;
        }
    });

    // Rotate Asteroids
    scene.children.forEach(object => {
        if (object.userData && object.userData.speed) {
            object.userData.angle += object.userData.speed;
            object.position.x = Math.cos(object.userData.angle) * object.userData.distance;
            object.position.z = Math.sin(object.userData.angle) * object.userData.distance;
        }
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
    zoom = Math.min(Math.max(0.1, zoom), 2);
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
    const starMaterial = new THREE.PointsMaterial({ vertexColors: true, size: 0.7 });
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





