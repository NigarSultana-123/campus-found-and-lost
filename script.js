let items = JSON.parse(localStorage.getItem("campusFindItems")) || [];

const itemForm = document.getElementById("itemForm");

itemForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const newItem = {
        id: Date.now(),
        type: document.getElementById("itemType").value,
        name: document.getElementById("itemName").value.trim(),
        category: document.getElementById("category").value,
        location: document.getElementById("location").value,
        date: document.getElementById("itemDate").value,
        contact: document.getElementById("contact").value.trim(),
        description: document.getElementById("description").value.trim(),
        recovered: false
    };

    items.push(newItem);

    saveItems();
    itemForm.reset();

    displayItems();
    updateDashboard();

    if (newItem.type === "Lost") {
        findMatches(newItem);
        generateRecoveryPlan(newItem);
    } else {
        showMessage("Found item reported successfully!");
    }

    document.getElementById("items").scrollIntoView({
        behavior: "smooth"
    });
});


function saveItems() {
    localStorage.setItem(
        "campusFindItems",
        JSON.stringify(items)
    );
}


function displayItems() {

    const container = document.getElementById("itemsContainer");

    const searchText =
        document.getElementById("searchInput").value.toLowerCase();

    const category =
        document.getElementById("filterCategory").value;

    const location =
        document.getElementById("filterLocation").value;

    const filteredItems = items.filter(function (item) {

        const matchesSearch =
            item.name.toLowerCase().includes(searchText) ||
            item.description.toLowerCase().includes(searchText);

        const matchesCategory =
            category === "All" ||
            item.category === category;

        const matchesLocation =
            location === "All" ||
            item.location === location;

        return matchesSearch &&
               matchesCategory &&
               matchesLocation;
    });

    container.innerHTML = "";

    if (filteredItems.length === 0) {

        container.innerHTML = `
            <div class="item-card">
                <h3>No items found</h3>
                <p>Try changing your search or filters.</p>
            </div>
        `;

        return;
    }

    filteredItems.forEach(function (item) {

        const card = document.createElement("div");

        card.className = "item-card";

        const statusClass =
            item.type === "Lost"
                ? "status-lost"
                : "status-found";

        card.innerHTML = `
            <span class="status ${statusClass}">
                ${item.type}
            </span>

            <h3>${item.name}</h3>

            <p>
                <strong>Category:</strong>
                ${item.category}
            </p>

            <p>
                <strong>Location:</strong>
                ${item.location}
            </p>

            <p>
                <strong>Date:</strong>
                ${item.date}
            </p>

            <p>
                ${item.description}
            </p>

            <p>
                <strong>Contact:</strong>
                ${item.contact}
            </p>

            ${
                item.recovered
                    ? `
                        <p class="recovered">
                            ✅ Item Recovered
                        </p>
                    `
                    : `
                        <button
                            class="recover-btn"
                            onclick="markRecovered(${item.id})">
                            Mark as Recovered
                        </button>
                    `
            }
        `;

        container.appendChild(card);
    });
}


// SMART MATCH

function findMatches(lostItem) {

    const possibleMatches = items.filter(function (item) {

        if (item.type !== "Found" || item.recovered) {
            return false;
        }

        const lostName = lostItem.name.toLowerCase();
        const foundName = item.name.toLowerCase();

        const nameWords = lostName.split(" ");

        const nameMatch = nameWords.some(function (word) {

            return word.length > 2 &&
                   foundName.includes(word);
        });

        const categoryMatch =
            lostItem.category === item.category;

        const locationMatch =
            lostItem.location === item.location;

        return nameMatch ||
               (categoryMatch && locationMatch);
    });

    displayMatches(possibleMatches, lostItem);
}


// DISPLAY SMART MATCH

function displayMatches(matches, lostItem) {

    const container =
        document.getElementById("matchContainer");

    if (matches.length === 0) {

        container.innerHTML = `
            <div class="no-match">

                <div class="match-icon">
                    🔍
                </div>

                <h3>No possible match found</h3>

                <p>
                    No matching found item was identified yet.
                </p>

            </div>
        `;

        document.getElementById("smartMatch").scrollIntoView({
            behavior: "smooth"
        });

        return;
    }

    container.innerHTML = "";

    matches.forEach(function (match) {

        let score = 0;
        let reasons = [];

        const lostName =
            lostItem.name.toLowerCase();

        const foundName =
            match.name.toLowerCase();

        if (
            lostName.includes(foundName) ||
            foundName.includes(lostName)
        ) {
            score += 50;
            reasons.push("✓ Item name matches");
        }

        if (lostItem.category === match.category) {
            score += 25;
            reasons.push("✓ Same category");
        }

        if (lostItem.location === match.location) {
            score += 25;
            reasons.push("✓ Same campus location");
        }

        if (score > 100) {
            score = 100;
        }

        const card = document.createElement("div");

        card.className = "match-card";

        card.innerHTML = `
            <div class="match-header">

                <h3>
                    🤖 Possible Match Found
                </h3>

                <span class="confidence">
                    ${score}% Match
                </span>

            </div>

            <h3>${match.name}</h3>

            <div class="match-details">

                <div class="match-detail">
                    <small>Category</small>
                    <strong>${match.category}</strong>
                </div>

                <div class="match-detail">
                    <small>Location</small>
                    <strong>${match.location}</strong>
                </div>

                <div class="match-detail">
                    <small>Date Found</small>
                    <strong>${match.date}</strong>
                </div>

            </div>

            <div class="match-reasons">

                <strong>
                    Why this may be a match:
                </strong>

                ${reasons.map(function (reason) {
                    return `<p>${reason}</p>`;
                }).join("")}

            </div>

            <div class="match-success">

                💡 A possible match has been identified.
                Check the Found Items section for contact details.

            </div>
        `;

        container.appendChild(card);
    });

    document.getElementById("smartMatch").scrollIntoView({
        behavior: "smooth"
    });
}


// MARK AS RECOVERED

function markRecovered(id) {

    const item = items.find(function (item) {
        return item.id === id;
    });

    if (item) {

        item.recovered = true;

        saveItems();
        displayItems();
        updateDashboard();
    }
}


// DASHBOARD

function updateDashboard() {

    const lost = items.filter(function (item) {
        return item.type === "Lost" && !item.recovered;
    }).length;

    const found = items.filter(function (item) {
        return item.type === "Found" && !item.recovered;
    }).length;

    const recovered = items.filter(function (item) {
        return item.recovered;
    }).length;

    const pending = items.filter(function (item) {
        return !item.recovered;
    }).length;

    document.getElementById("lostCount").textContent = lost;
    document.getElementById("foundCount").textContent = found;
    document.getElementById("recoveredCount").textContent = recovered;
    document.getElementById("pendingCount").textContent = pending;
}


// MESSAGE

function showMessage(message) {
    alert(message);
}


// SEARCH

document
    .getElementById("searchInput")
    .addEventListener("input", displayItems);


// CATEGORY FILTER

document
    .getElementById("filterCategory")
    .addEventListener("change", displayItems);


// LOCATION FILTER

document
    .getElementById("filterLocation")
    .addEventListener("change", displayItems);

function generateRecoveryPlan(lostItem) {
  const container = document.getElementById("recoveryContainer");

  let steps = [];

  switch (lostItem.location) {

    case "Library":
      steps = [
        "Check the library reading and seating areas.",
        "Ask the library help desk about the lost item.",
        "Check with nearby staff or campus security.",
        "Review possible Smart Match results."
      ];
      break;

    case "Canteen":
      steps = [
        "Check the tables and seating area where you were sitting.",
        "Ask the canteen counter or staff.",
        "Check with nearby campus security.",
        "Review possible Smart Match results."
      ];
      break;

    case "Classroom":
      steps = [
        "Return to the classroom and check your desk area.",
        "Ask your lecturer or class representative.",
        "Check with the department office or security.",
        "Review possible Smart Match results."
      ];
      break;

    case "Hostel":
      steps = [
        "Check your room and nearby common areas.",
        "Ask the hostel warden or reception.",
        "Check with hostel security.",
        "Review possible Smart Match results."
      ];
      break;

    default:
      steps = [
        "Revisit the location where the item was last seen.",
        "Ask nearby staff or students if they found it.",
        "Check with the campus security or found-items desk.",
        "Review possible Smart Match results."
      ];
  }

  container.innerHTML = `
    <div class="recovery-card">

      <div class="recovery-card-header">
        <div>
          <span class="recovery-label">RECOVERY PLAN</span>
          <h3>${lostItem.name}</h3>
        </div>
        <div class="recovery-location">
          📍 ${lostItem.location}
        </div>
      </div>

      <p class="recovery-description">
        Suggested steps based on the last reported location of your item.
      </p>

      <div class="recovery-progress">
  <strong>Recovery Progress:</strong>
  <span id="progressText">0 / ${steps.length} completed</span>
</div>

<div class="recovery-steps">
  ${steps.map(function(step, index) {
    return `
      <label class="recovery-step">
        <input 
          type="checkbox" 
          class="recovery-checkbox"
          onchange="updateRecoveryProgress()"
        >
        <span class="step-number">${index + 1}</span>
        <span class="step-text">${step}</span>
      </label>
    `;
  }).join("")}
</div>

      <div class="recovery-tip">
        💡 <strong>Tip:</strong> Start with the last known location and
        contact nearby staff before checking other areas.
      </div>

    </div>
  `;

  document.getElementById("recoveryAssistant").scrollIntoView({
    behavior: "smooth"
  });
}
function updateRecoveryProgress() {
  const checkboxes = document.querySelectorAll(".recovery-checkbox");
  const completed = document.querySelectorAll(
    ".recovery-checkbox:checked"
  ).length;

  const progressText = document.getElementById("progressText");

  if (progressText) {
    progressText.textContent =
      completed + " / " + checkboxes.length + " completed";
  }
}
// START APPLICATION

displayItems();
updateDashboard();