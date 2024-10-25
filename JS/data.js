fetch("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson")
  .then((response) => response.json())
  .then((data) => {
    const earthquakes = data.features; // Extract the relevant features
    earthquakes.forEach((disaster) => {
      const disasterInfo = {
        title: disaster.properties.title,
        mag: disaster.properties.mag,
        place: disaster.properties.place,
        time: new Date(disaster.properties.time).toLocaleString(),
      };
      displayDisaster(disasterInfo);
    });
  })
  .catch((error) => console.error("Error fetching data:", error));

// Function to dynamically create disaster cards
function displayDisaster(disaster) {
  const disasterList = document.getElementById("disasterAll");

  const card = document.createElement("div");
  card.className = "disaster-card";

  card.innerHTML = `
        <h2>${disaster.title}</h2>
        <p>Location: ${disaster.place}</p>
        <p>Magnitude: ${disaster.mag}</p>
        <p>Date: ${disaster.time}</p>
    `;

  disasterList.appendChild(card);
}
