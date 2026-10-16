// =====================================
// PURE STYLE | CLOTHING INVENTORY
// =====================================

// API address
const API_URL = "http://127.0.0.1:8000/clothes";

// Select elements from the HTML page
const clothingList = document.querySelector("#clothing-list");
const inventoryStatus = document.querySelector("#inventory-status");
const clothingForm = document.querySelector("#clothing-form");
const formStatus = document.querySelector("#form-status");

// Sample clothing objects used if the API is unavailable
const sampleClothes = [
    {
        clothing_id: 1,
        name: "Classic T-Shirt",
        brand: "Pure Basics",
        color: "Black",
        size: "M",
        quantity: 20,
        price: 850
    },
    {
        clothing_id: 2,
        name: "Slim-Fit Jeans",
        brand: "Urban Wear",
        color: "Blue",
        size: "32",
        quantity: 12,
        price: 2500
    },
    {
        clothing_id: 3,
        name: "Classic Hoodie",
        brand: "Street Mode",
        color: "Grey",
        size: "L",
        quantity: 15,
        price: 1800
    }
];

// Get a field even if the API uses an alternative field name
function getValue(item, names) {
    for (const name of names) {
        if (item[name] !== undefined && item[name] !== null) {
            return item[name];
        }
    }

    return "";
}

// Format prices using Kenyan number formatting
function formatPrice(price) {
    const amount = Number(price);

    return Number.isFinite(amount)
        ? amount.toLocaleString("en-KE", {
            maximumFractionDigits: 2
        })
        : (price || "—");
}

// Render the clothing objects into the HTML table
function displayClothes(clothes) {
    // Clear existing rows before rendering new ones
    clothingList.replaceChildren();

    // Display a message if no items exist
    if (!Array.isArray(clothes) || clothes.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.textContent = "No clothing items are available.";

        row.appendChild(cell);
        clothingList.appendChild(row);

        return;
    }

    // Loop through every clothing item
    clothes.forEach(function (item, index) {
        const row = document.createElement("tr");

        // Values for the seven table columns
        const values = [
            getValue(item, ["clothing_id", "id", "item_id"])
                || String(index + 1).padStart(3, "0"),

            getValue(item, ["name", "item_name", "title"]),

            getValue(item, ["brand"]),

            getValue(item, ["color", "colour"]),

            getValue(item, ["size"]),

            getValue(item, ["quantity", "stock", "stock_quantity"]),

            formatPrice(getValue(item, ["price", "unit_price"]))
        ];

        // Create a table cell for each value
        values.forEach(function (value) {
            const cell = document.createElement("td");

            cell.textContent = value === "" ? "—" : value;

            row.appendChild(cell);
        });

        // Add the completed row to the table
        clothingList.appendChild(row);
    });
}

// Fetch clothing items from the FastAPI backend
async function loadClothes() {
    inventoryStatus.textContent = "Loading clothing items...";

    try {
        const response = await fetch(API_URL);

        // Check whether the request was successful
        if (!response.ok) {
            throw new Error("API returned status " + response.status);
        }

        // Convert the response into JavaScript data
        const data = await response.json();

        // Accept either a direct list or a list inside a common wrapper
        const clothes = Array.isArray(data)
            ? data
            : (data.items || data.clothes || data.results || []);

        // Display the clothing received from the API
        displayClothes(clothes);

        inventoryStatus.textContent =
            "Showing clothing items loaded from the API.";

        console.log("Clothing loaded from API:", clothes);

    } catch (error) {
        // If the API fails, show the sample clothing instead
        console.error("Could not load clothing from API:", error);

        displayClothes(sampleClothes);

        inventoryStatus.textContent =
            "API unavailable. Showing sample items instead.";
    }
}

// Handle the Add Item form
clothingForm.addEventListener("submit", function (event) {
    // Prevent the browser from reloading the page
    event.preventDefault();

    formStatus.textContent =
        "The form is not connected to a POST endpoint yet. No item has been saved.";
});

// Load clothing when the page opens
loadClothes();