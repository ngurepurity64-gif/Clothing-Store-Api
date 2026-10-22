const API_URL = "http://127.0.0.1:8000/clothes";

const clothingList = document.querySelector("#clothing-list");
const inventoryStatus = document.querySelector("#inventory-status");
const clothingForm = document.querySelector("#clothing-form");
const formStatus = document.querySelector("#form-status");
const submitButton = clothingForm.querySelector('button[type="submit"]');

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

function getValue(item, names) {
for (const name of names) {
if (item[name] !== undefined && item[name] !== null) {
return item[name];
}
}

return "";

}

function formatPrice(price) {
const amount = Number(price);

return Number.isFinite(amount)
    ? amount.toLocaleString("en-KE", {
        maximumFractionDigits: 2
    })
    : (price || "—");

}

function displayClothes(clothes) {
clothingList.replaceChildren();

if (!Array.isArray(clothes) || clothes.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 7;
    cell.textContent = "No clothing items are available.";

    row.appendChild(cell);
    clothingList.appendChild(row);
    return;
}

clothes.forEach((item, index) => {
    const row = document.createElement("tr");

    const values = [
        getValue(item, ["clothing_id", "id", "item_id"]) ||
            String(index + 1).padStart(3, "0"),
        getValue(item, ["name", "item_name", "title"]),
        getValue(item, ["brand"]),
        getValue(item, ["color", "colour"]),
        getValue(item, ["size"]),
        getValue(item, ["quantity", "stock", "stock_quantity"]),
        formatPrice(getValue(item, ["price", "unit_price"]))
    ];

    values.forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value === "" ? "—" : String(value);
        row.appendChild(cell);
    });

    clothingList.appendChild(row);
});

}

async function loadClothes() {
inventoryStatus.textContent = "Loading clothing items...";

try {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("API returned status " + response.status);
    }

    const data = await response.json();

    const clothes = Array.isArray(data)
        ? data
        : (data.items || data.clothes || data.results || []);

    if (!Array.isArray(clothes)) {
        throw new Error("The API response did not contain a clothing list.");
    }

    displayClothes(clothes);

    inventoryStatus.textContent =
        "Showing clothing items loaded from the API.";

    console.log("Clothing loaded from API:", clothes);

} catch (error) {
    console.error("Could not load clothing from API:", error);

    displayClothes(sampleClothes);

    inventoryStatus.textContent =
        "API unavailable. Showing sample items instead.";
}

}

async function getErrorMessage(response) {
try {
const data = await response.json();

    if (typeof data.detail === "string") {
        return data.detail;
    }

    if (Array.isArray(data.detail)) {
        return data.detail
            .map(error => error.msg || "Invalid input")
            .join(". ");
    }

    if (typeof data.message === "string") {
        return data.message;
    }

} catch (error) {
    console.warn("Could not read the API error response.");
}

return "Request failed with status " + response.status + ".";

}

clothingForm.addEventListener("submit", async function (event) {
event.preventDefault();

formStatus.textContent = "";

const token = window.prompt(
    "Enter your API access token to add a clothing item:"
);

if (token === null || token.trim() === "") {
    formStatus.textContent =
        "No access token entered. The item has not been saved.";
    return;
}

const item = {
    name: document.querySelector("#name").value.trim(),
    brand: document.querySelector("#brand").value.trim(),
    color: document.querySelector("#colour").value.trim(),
    size: document.querySelector("#size").value,
    quantity: Number(document.querySelector("#quantity").value),
    price: Number(document.querySelector("#price").value)
};

if (
    !item.name ||
    !item.brand ||
    !item.color ||
    !item.size ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 0 ||
    !Number.isFinite(item.price) ||
    item.price < 0
) {
    formStatus.textContent =
        "Please enter valid details for every field.";
    return;
}

submitButton.disabled = true;
submitButton.innerHTML = "Adding item...";

formStatus.textContent = "Saving your clothing item...";

try {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token.trim()
        },
        body: JSON.stringify(item)
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    clothingForm.reset();

    await loadClothes();

    formStatus.textContent =
        "Item added successfully and the collection has been refreshed.";

} catch (error) {
    console.error("Could not add clothing item:", error);

    formStatus.textContent =
        "Could not save the item: " + error.message +
        " Check your access token and backend connection.";

} finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Add Item <span>→</span>';
}

});

loadClothes();