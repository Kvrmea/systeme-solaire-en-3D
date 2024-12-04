// Stockage des relations 
const planetData = {};
console.log(planetData)

// Variable pour suivre une planète
let followingPlanet = null;

// Scène, caméra et rendu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Utiliser le conteneur pour le canvas
const container = document.getElementById("three-container")
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Chargement des textures
const textureLoader = new THREE.TextureLoader();
const galaxyTexture = textureLoader.load('images/stars.jpg');  // Galaxie

// Créer la sphère géante (arrière-plan)
const backgroundGeometry = new THREE.SphereGeometry(500, 64, 64); // Sphère géante
const backgroundMaterial = new THREE.MeshBasicMaterial({
    map: galaxyTexture, // Texture de la galaxie
    side: THREE.BackSide // Afficher l'extérieur de la sphère
});
const backgroundSphere = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
scene.add(backgroundSphere); // Ajouter la sphère à la scène

// Chargement des textures des planètes et des anneaux
const planetTextures = {
    mercure: textureLoader.load('images/texture_mercury.jpg'),
    venus: textureLoader.load('images/texture_venus.jpg'),
    terre: textureLoader.load('images/texture_earth.jpg'),
    mars: textureLoader.load('images/texture_mars.jpg'),
    jupiter: textureLoader.load('images/texture_jupiter.jpg'),
    saturne: textureLoader.load('images/texture_saturn.jpg'),
    uranus: textureLoader.load('images/texture_uranus.jpg'),
    neptune: textureLoader.load('images/texture_neptune.jpg'),
    moon: textureLoader.load('images/texture_moon.jpg')
};

// Texture de l'anneau de Saturne
const ringTexture = textureLoader.load('images/texture_saturn_ring.png');

// Chargement de la texture du soleil
const sunTexture = textureLoader.load('images/texture_sun.jpg')

// Création du Soleil
const sunGeometry = new THREE.SphereGeometry(7, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Contrôles interactifs
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Position de la caméra
camera.position.set(0, 10, 50); // Positionne la caméra
camera.lookAt(0, 0, 0);

// Ajout de la lumière
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10).normalize();
scene.add(directionalLight);

// Liste des planètes avec leurs données et vitesses orbitales approximatives
const planets = [
    { name: 'Mercure', size: 0.5, distance: 8, speed: 0.010 },  // Mercure plus rapide
    { name: 'Venus', size: 0.9, distance: 11, speed: 0.005 },
    { name: 'terre', size: 1, distance: 14, speed: 0.002 },
    { name: 'Mars', size: 0.8, distance: 17, speed: 0.0018 },
    { name: 'Jupiter', size: 3, distance: 22, speed: 0.0013 },
    { name: 'Saturne', size: 2.5, distance: 28, speed: 0.0009 },
    { name: 'Uranus', size: 2, distance: 35, speed: 0.0007 },
    { name: 'Neptune', size: 2, distance: 42, speed: 0.0005 }  // Neptune plus lent
];

// Création des planètes et de leurs orbites
const planetMeshes = [];
planets.forEach(planet => {
    const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
    const material = new THREE.MeshLambertMaterial({ map: planetTextures[planet.name.toLowerCase()] });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = planet.name.toLowerCase();

    mesh.position.x = planet.distance;  // Position initiale sur l'orbite

    // Définir un angle initial (aléatoire ou fixe)
    planet.angle = Math.random() * Math.PI * 2; // Positionne la planète sur son orbite à un endroit aléatoire

    // Créer l'orbite
    const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.1, planet.distance + 0.1, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2; // Aligner l'orbite à l'horizontale
    scene.add(orbit);

    scene.add(mesh);
    planetData[planet.name.toLowerCase()] = mesh;
    planetMeshes.push({ mesh, distance: planet.distance, speed: planet.speed, angle: planet.angle }); // Stocker l'angle initial
});

// Ajouter l'anneau de Saturne
const saturn = planetMeshes.find(p => p.mesh.material.map === planetTextures.saturne);
if (saturn) {
    const ringGeometry = new THREE.RingGeometry(3, 5, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // Aligner l'anneau avec l'équateur de Saturne
    ring.position.set(0, 0, 0); // Positionner l'anneau autour de Saturne
    saturn.mesh.add(ring); // Ajouter l'anneau comme enfant de Saturne
}

// Création de la Lune
const moonGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const moonMaterial = new THREE.MeshLambertMaterial({ map: planetTextures.moon });
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

// Placer la Lune autour de la Terre
const earth = planetMeshes.find(p => p.mesh.material.map === planetTextures.terre);
if (earth) {
    moon.position.x = earth.mesh.position.x + 2; // La Lune se trouve à 2 unités de la Terre
}

// Fonction d'animation avec les mouvements orbitaux
function animate() {
    requestAnimationFrame(animate);

    // Rotation du Soleil
    if (sun) {
        sun.rotation.y += 0.005;
    }

    planetMeshes.forEach(planet => {
        // Mettre à jour l'angle de la planète avec sa vitesse spécifique
        planet.angle += planet.speed;  // L'angle change avec la vitesse de la planète
    
        // Calculer la position en x et z avec un mouvement orbital indépendant
        planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
        planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
    
        // Rotation des planètes autour d'elles-mêmes (optionnel)
        planet.mesh.rotation.y += 0.01; // Cela fait tourner la planète sur elle-même
    });

    // Mouvement de la Lune autour de la Terre
    const earth = planetMeshes.find(planet => planet.mesh.name === "terre");
    if (earth) {
        moon.position.x = earth.mesh.position.x + Math.cos(Date.now() * 0.001 * 0.9) * 2;
        moon.position.z = earth.mesh.position.z + Math.sin(Date.now() * 0.001 * 0.9) * 2;
    }

    // Suivre une planète si elle est définie
    if (followingPlanet) {
        const planetMesh = planetData[followingPlanet];
        if (planetMesh) {
            const offset = { x: 5, y: 5, z: 5 };
            camera.position.set (
                planetMesh.position.x + offset.x,
                planetMesh.position.y + offset.y,
                planetMesh.position.z + offset.z
            );
            camera.lookAt(planetMesh.position);
        }
    }
    // Rendu de la scène
    renderer.render(scene, camera);
}
// Appeler la fonction animate pour démarrer l'animation
animate();

// Fonction permattant de déplacer la caméra
function moveCameraToPlanet(planetName) {
    const targetMesh = planetData[planetName.toLowerCase()];
    if (targetMesh) {
        followingPlanet = planetName.toLowerCase(); // Active le suivi de la planète
        const duration = 2000;
        const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
        const endPos = { x: targetMesh.position.x * 1.5, y: targetMesh.position.y + 5, z: targetMesh.position.z * 1.5 };

        let startTime = null;

        function animateCamera(time) {
            if (!startTime) startTime = time;
            const elapsedTime = time - startTime;

            const t = Math.min(elapsedTime / duration, 1);
            camera.position.x = startPos.x + (endPos.x - startPos.x) * t;
            camera.position.y = startPos.y + (endPos.y - startPos.y) * t;
            camera.position.z = startPos.z + (endPos.z - startPos.z) * t;

            if (t < 1) {
                requestAnimationFrame(animateCamera);
            } else {
                camera.lookAt(targetMesh.position); // Point de la caméra sur la planète
                controls.target.copy(targetMesh.position); // Déplace le contrôle de la caméra
            }
        }

        requestAnimationFrame(animateCamera);
    } else {
        console.warn(`Planète "${planetName}" introuvable dans le 3D.`);
    }
}

function resetCamera() {
    const duration = 2000;
    const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const endPos = { x: 0, y: 10, z: 50 }; // Vue par défaut
    
    let startTime = null;

    function animateCameraReset(time) {
        if (!startTime) startTime = time;
        const elapsedTime = time - startTime;

        const t = Math.min(elapsedTime / duration, 1);
        camera.position.x = startPos.x + (endPos.x - startPos.x) * t;
        camera.position.y = startPos.y + (endPos.y - startPos.y) * t;
        camera.position.z = startPos.z + (endPos.z - startPos.z) * t;

        if (t < 1) {
            requestAnimationFrame(animateCameraReset);
        } else {
            controls.target.set(0, 0, 0); // Recentrer le contrôle
            controls.update();
        }
    }

    requestAnimationFrame(animateCameraReset);
}
