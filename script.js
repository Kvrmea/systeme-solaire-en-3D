const apiUrl = "data/planets.json";
const solarSystemApiUrl = "https://api.le-systeme-solaire.net/rest/bodies/";

async function solarSystem() {
    const [apiResponse, customDataResponse] = await Promise.all([fetch(solarSystemApiUrl), fetch(apiUrl)]);
    const apiData = await apiResponse.json();
    const customData = await customDataResponse.json();

    const planetsContainer = document.getElementById("planet-container");
    let planetsData = [];

    // Parcourt les corps célestes pour récupérer les planètes
    for (let i = 0; i < apiData.bodies.length; i++) {
        const { id, moons, gravity, isPlanet } = apiData.bodies[i];
        if (isPlanet && gravity) {
            const moonNames = moons && Array.isArray(moons) && moons.length > 0
                ? moons.slice(0, 10).map(lune => lune.moon).join(", ")
                : "Aucun satellite";

            planetsData.push({
                Nom: id,
                Lune: moonNames,
                Gravité: gravity,
            });
        }
    }

    // Trie par nom
    planetsData.sort((a, b) => a.Nom.localeCompare(b.Nom));

    // Affiche les planètes
    planetsData.forEach(planet => createPlanetElement(planet, customData, planetsContainer));
}

// Crée un élément de planète
function createPlanetElement(planet, customData, planetsContainer) {
    const planetDiv = document.createElement("div");
    planetDiv.textContent = planet.Nom;
    planetDiv.className = "planet-name";

    planetDiv.addEventListener("click", () => {
        const additionalData = customData.planets.find(p => p.name.toLowerCase() === planet.Nom.toLowerCase());

        // Masque la section des détails
        const planetDetail = document.getElementById("planet-detail");
        if (planetDetail) planetDetail.classList.add("hidden");

        // Affiche les détails fusionnés
        moveCameraToPlanet(planet.Nom.toLowerCase());
        showPlanetDetailsIn3D(planet, additionalData);

        // Scroll vers la section 3D
        const threeContainer = document.getElementById("three-container");
        if (threeContainer) {
            threeContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    // Ajoutez le menu des planètes dans le conteneur 3D
    const planetMenuContainer = document.getElementById("planet-container-3d");
    planetMenuContainer.appendChild(planetDiv);
}



// Fonction pour afficher les détails fusionnés dans la vue 3D
function showPlanetDetailsIn3D(planet, additionalData) {
    const infoPanel = document.getElementById("planet-info-3d");
    const nameElement = document.getElementById("planet-name-3d");
    const detailsElement = document.getElementById("planet-details-3d");

    const details = `
        <strong>Satellite :</strong> ${planet.Lune}<br>
        <strong>Gravité :</strong> ${planet.Gravité}<br>
        ${additionalData ? `
            <strong>Taille :</strong> ${additionalData.size}<br>
            <strong>Température :</strong> ${additionalData.temperature}<br>
            <strong>Vitesse orbitale :</strong> ${additionalData.orbitalSpeed}<br>
            <strong>Période orbitale :</strong> ${additionalData.orbitalPeriod}<br>
            <p><strong>Rotation orbitale :</strong> ${additionalData.rotationSpeed}</p>

        ` : "Informations supplémentaires indisponibles."}
    `;

    nameElement.textContent = planet.Nom;
    detailsElement.innerHTML = details;

    infoPanel.classList.remove("hidden");
}

// Masque le panneau lorsqu'on quitte une planète
function hidePlanetDetailsIn3D() {
    const infoPanel = document.getElementById("planet-info-3d");
    infoPanel.classList.add("hidden");
}

// Réinitialise la caméra et masque les détails
function stopFollowingPlanet() {
    followingPlanet = null;
    resetCamera();
    hidePlanetDetailsIn3D();
}

solarSystem();

document.getElementById("reset-camera").addEventListener("click", stopFollowingPlanet);
