document.getElementById("openSidebar").addEventListener("click", function () {
  document.querySelector(".sidebar").classList.add("show");
});

document.getElementById("closeSidebar").addEventListener("click", function () {
  document.querySelector(".sidebar").classList.remove("show");
});

// output button click and output text home will show date and time disaster will show a random disaster
document.querySelectorAll(".output-btn").forEach((button) => {
  let currentIndex = 0;
  button.addEventListener("click", function () {
    const parentBox = button.closest(".box");
    const outputText = parentBox.querySelector("#output-text");
    const disasterImage = parentBox.querySelector("img");

    if (parentBox.classList.contains("home-box")) {
      const date = new Date();
      outputText.textContent = `Date: ${date.toLocaleDateString()} Time: ${date.toLocaleTimeString()}`;
    } else if (parentBox.classList.contains("disaster-box")) {
      const disasters = [
        {
          name: "Earthquake",
          image:
            "https://static.timesofisrael.com/www/uploads/2023/03/33AN3EN-highres-1024x640.jpg",
        },
        {
          name: "Tornado",
          image:
            "https://media.spokesman.com/photos/2016/05/09/APTOPIX_Severe_Weather.JPG.jpg",
        },
        {
          name: "Flood",
          image:
            "https://questionofcities.org/wp-content/uploads/2023/06/As-floods-ravage-cities-the-game-changer-is-to-plan-with-nature.png",
        },
        {
          name: "Tsunami",
          image:
            "https://i.natgeofe.com/n/0f9e3b7a-d3ca-4418-8e61-f605b4e04bc5/02-rikuzentakata-japan.jpg",
        },
        {
          name: "Storm",
          image:
            "https://cdn.europosters.eu/image/750/posters/electric-strom-i453.jpg",
        },
      ];
      const currentDisaster = disasters[currentIndex];
      outputText.textContent = currentDisaster.name;
      disasterImage.src = currentDisaster.image;
      disasterImage.style.borderRadius = "50%";
      disasterImage.style.width = "150px";
      disasterImage.style.height = "150px";
      currentIndex = (currentIndex + 1) % disasters.length;
    }
  });
});

// card digestar explaination
function checkLocation() {
  const popup = document.getElementById("location-popup");
  popup.style.display = "flex";
}

function closePopup() {
  const popup = document.getElementById("location-popup");
  popup.style.display = "none";
}
