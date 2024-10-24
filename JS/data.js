// Fetch Earthquake Data from USGS API
fetch("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson")
  .then((response) => response.json())
  .then((data) => {
    const earthquakes = data.features; // The actual earthquake data is in the 'features' property
    earthquakes.forEach((eq) => {
      const eqInfo = {
        title: eq.properties.title,
        mag: eq.properties.mag,
        place: eq.properties.place,
        time: new Date(eq.properties.time).toLocaleString(),
      };
      displayDisaster(eqInfo); // Call function to display each earthquake
    });
  })
  .catch((error) => console.error("Error fetching data:", error));

// Function to display each disaster dynamically
function displayDisaster(disaster) {
  const disasterList = document.getElementById("disasterAll"); // Get the container
  const card = document.createElement("div"); // Create a new div for the card
  card.className = "disaster-box"; // Add the class for styling
  card.innerHTML = `
        <h2>${disaster.title}</h2>
        <p>Location: ${disaster.place}</p>
        <p>Magnitude: ${disaster.mag}</p>
        <p>Date: ${disaster.time}</p>
      `;
  disasterList.appendChild(card); // Add the card to the container
}
