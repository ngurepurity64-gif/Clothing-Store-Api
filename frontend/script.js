/* ==========================================
   PURE STYLE - CLOTHING STORE
   ========================================== */

// Backend API address
const API_URL = "http://127.0.0.1:8000/clothes";

// Get the HTML elements
const clothingList = document.querySelector("#clothing-list");
const inventoryStatus = document.querySelector("#inventory-status");
const clothingForm = document.querySelector("#clothing-form");
const formStatus = document.querySelector("#form-status");
const submitButton = clothingForm
    ? clothingForm.querySelector('button[type="submit"]')
    : null;

// Product images.
// Save these images inside frontend/images/
const clothingImages = {
    1: "images/black-jacket.jpg",
    2: "images/trousers.jpg",
    3: "images/pleated-skirt.jpg",
    4: "images/white-sneakers.jpg",
    5: "images/denim-jacket.jpg",
    6: "images/floral-dress.jpg",
    7: "images/grey-hoodie.jpg",
    8: "images/blue-jeans.jpg",
    9: "images/black-tshirt.jpg",
};

/* ==========================================
   HELPER FUNCTIONS
   ========================================== */

// Get a value using any of the possible property names
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
            maximumFractionDigits: 2,
        })
        : price || "—";
}

// Show an error message returned by the API
async function getErrorMessage(response) {
    try {
        const data = await response.json();

        if (typeof data.detail === "string") {
            return data.detail;
        }

        if (Array.isArray(data.detail)) {
            return data.detail
                .map((error) => error.msg || "Invalid input")
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

/* ==========================================
   DISPLAY CLOTHING AS PRODUCT CARDS
   ========================================== */

function displayClothes(clothes) {
    if (!clothingList) return;

    // Clear the previous product cards
    clothingList.replaceChildren();

    if (!Array.isArray(clothes) || clothes.length === 0) {
        const message = document.createElement("p");

        message.className = "inventory-empty";
        message.textContent = "No clothing items are available.";

        clothingList.appendChild(message);
        return;
    }

    clothes.forEach((item, index) => {
        // Read the clothing details from the API
        const clothingId = Number(getValue(item, ["clothing_id", "id", "item_id"]));

        const name = getValue(item, ["name", "item_name", "title"]);
        const brand = getValue(item, ["brand"]);
        const color = getValue(item, ["color", "colour"]);
        const size = getValue(item, ["size"]);
        const quantity = getValue(item, ["quantity", "stock", "stock_quantity"]);
        const price = getValue(item, ["price", "unit_price"]);

        // Create the product card
        const card = document.createElement("article");
        card.className = "product-card";

        // Create the product image
        const image = document.createElement("img");

        image.className = "product-image";
        image.src = clothingImages[clothingId] || "images/black-tshirt.jpg";
        image.alt = name || "Clothing product";
        image.loading = "lazy";

        // Display a fallback if the image cannot be loaded
        image.addEventListener(
            "error",
            function () {
                image.removeAttribute("src");
                image.alt = "Product image unavailable";
                image.classList.add("image-unavailable");
            },
            { once: true },
        );

        // Product information
        const details = document.createElement("div");
        details.className = "product-details";

        const brandText = document.createElement("p");
        brandText.className = "product-brand";
        brandText.textContent = brand || "PURE STYLE";

        const title = document.createElement("h3");
        title.className = "product-name";
        title.textContent = name || "Unnamed item";

        const colorSize = document.createElement("p");
        colorSize.className = "product-description";
        colorSize.textContent =
            "Color: " + (color || "—") + " | Size: " + (size || "—");

        const stock = document.createElement("p");
        stock.className = "product-stock";
        stock.textContent = "Available stock: " + quantity;

        const priceText = document.createElement("p");
        priceText.className = "product-price";
        priceText.textContent = "KSh " + formatPrice(price);

        // Order button
        const orderButton = document.createElement("button");

        orderButton.type = "button";
        orderButton.textContent =
            Number(quantity) > 0 ? "Order Now" : "Out of Stock";
        orderButton.className = "order-button";
        orderButton.dataset.clothingId = String(clothingId);

        // Prevent ordering items that are out of stock
        if (Number(quantity) <= 0) {
            orderButton.disabled = true;
        }

        // Connect the button to the existing ordering function
        orderButton.addEventListener("click", function () {
            const selectedId = Number(orderButton.dataset.clothingId);

            if (!selectedId) {
                alert("This clothing item has no valid ID.");
                return;
            }

            startOrder(selectedId);
        });

        // Put all the product details inside the card
        details.append(brandText, title, colorSize, stock, priceText, orderButton);

        card.append(image, details);
        clothingList.appendChild(card);
    });
}

/* ==========================================
   LOAD CLOTHING FROM THE DATABASE API
   ========================================== */

async function loadClothes() {
    if (inventoryStatus) {
        inventoryStatus.textContent = "Loading clothing items...";
    }

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("API returned status " + response.status);
        }

        const data = await response.json();

        const clothes = Array.isArray(data)
            ? data
            : data.items || data.clothes || data.results || [];

        if (!Array.isArray(clothes)) {
            throw new Error("The API response did not contain a clothing list.");
        }

        displayClothes(clothes);

        if (inventoryStatus) {
            inventoryStatus.textContent =
                "Showing clothing items loaded from the API.";
        }

        console.log("Clothing loaded from API:", clothes);
    } catch (error) {
        console.error("Could not load clothing from API:", error);

        if (clothingList) {
            clothingList.replaceChildren();

            const message = document.createElement("p");
            message.className = "inventory-empty";
            message.textContent =
                "Unable to load clothing. Please check that the backend " +
                "is running and the database is connected.";

            clothingList.appendChild(message);
        }

        if (inventoryStatus) {
            inventoryStatus.textContent = "Could not connect to the clothing API.";
        }
    }
}

/* ==========================================
   PLACE A CLOTHING ORDER
   ========================================== */

async function startOrder(clothingId) {
    // Ask how many items the customer wants
    const quantityInput = window.prompt(
        "How many items would you like to order?",
    );

    if (quantityInput === null) return;

    const quantity = Number(quantityInput);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity greater than zero.");
        return;
    }

    // Collect the customer's details
    const name = window.prompt("Enter your full name:");
    if (!name || !name.trim()) return;

    const phone = window.prompt("Enter your phone number:");
    if (!phone || !phone.trim()) return;

    const email = window.prompt("Enter your account email:");
    if (!email || !email.trim()) return;

    const password = window.prompt("Enter your account password:");
    if (!password) return;

    try {
        // First, try logging in to the existing account
        let response = await fetch("http://127.0.0.1:8000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                username: email.trim(),
                password: password,
            }),
        });

        // If login fails, offer to register a new account
        if (!response.ok) {
            const createAccount = window.confirm(
                "Login failed. Would you like to register a new account? " +
                "Use this only if you have not registered before.",
            );

            if (!createAccount) {
                throw new Error("Login failed. Check your email and password.");
            }

            response = await fetch("http://127.0.0.1:8000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password,
                }),
            });

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            // Log in after successful registration
            response = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    username: email.trim(),
                    password: password,
                }),
            });
        }

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const loginData = await response.json();
        const token = loginData.access_token;

        if (!token) {
            throw new Error("The API did not return an access token.");
        }

        const authHeaders = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        };

        // Create the customer record
        response = await fetch("http://127.0.0.1:8000/customers", {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
                name: name.trim(),
                phone: phone.trim(),
            }),
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const customer = await response.json();

        // Create an order for this customer
        response = await fetch("http://127.0.0.1:8000/orders", {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
                customer_id: customer.customer_id,
                order_date: new Date().toISOString().slice(0, 10),
            }),
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const order = await response.json();

        // Add the selected clothing to the order
        response = await fetch(
            `http://127.0.0.1:8000/orders/${order.order_id}/items`,
            {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    clothing_id: clothingId,
                    quantity: quantity,
                }),
            },
        );

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        // Refresh inventory to show the updated stock
        await loadClothes();

        alert(
            "Order placed successfully!\n" +
            "Your order number is: " +
            order.order_id,
        );
    } catch (error) {
        console.error("Order failed:", error);

        alert("Could not complete your order: " + error.message);
    }
}

/* ==========================================
   ADD NEW CLOTHING
   ========================================== */

if (clothingForm) {
    clothingForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (formStatus) {
            formStatus.textContent = "";
        }

        const token = window.prompt(
            "Enter your API access token to add a clothing item:",
        );

        if (token === null || token.trim() === "") {
            if (formStatus) {
                formStatus.textContent =
                    "No access token entered. The item has not been saved.";
            }
            return;
        }

        const item = {
            name: document.querySelector("#name").value.trim(),
            brand: document.querySelector("#brand").value.trim(),
            color: document.querySelector("#colour").value.trim(),
            size: document.querySelector("#size").value,
            quantity: Number(document.querySelector("#quantity").value),
            price: Number(document.querySelector("#price").value),
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
            if (formStatus) {
                formStatus.textContent = "Please enter valid details for every field.";
            }
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Adding item...";
        }

        if (formStatus) {
            formStatus.textContent = "Saving your clothing item...";
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token.trim(),
                },
                body: JSON.stringify(item),
            });

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            clothingForm.reset();

            await loadClothes();

            if (formStatus) {
                formStatus.textContent =
                    "Item added successfully and the collection has been refreshed.";
            }
        } catch (error) {
            console.error("Could not add clothing item:", error);

            if (formStatus) {
                formStatus.textContent =
                    "Could not save the item: " +
                    error.message +
                    " Check your access token and backend connection.";
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = "Add Item <span>→</span>";
            }
        }
    });
}

/* ==========================================
   SPECIAL ITEM REQUESTS
   ========================================== */

// API address
const REQUESTS_URL = "http://127.0.0.1:8000/item-requests";

// Get the special request form and its status message
const specialRequestForm = document.querySelector("#special-request-form");

const specialRequestStatus = document.querySelector("#special-request-status");

// Get the request management elements
const loadRequestsButton = document.querySelector("#load-item-requests");

const manageRequestsStatus = document.querySelector("#manage-requests-status");

const requestsList = document.querySelector("#item-requests-list");

/* ==========================================
   SUBMIT A SPECIAL ITEM REQUEST
   ========================================== */

if (specialRequestForm) {
    specialRequestForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        specialRequestStatus.textContent = "Submitting your request...";

        // Collect the customer's information
        const requestData = {
            customer_name: document
                .querySelector("#request-customer-name")
                .value.trim(),

            customer_phone: document
                .querySelector("#request-customer-phone")
                .value.trim(),

            item_name: document.querySelector("#request-item-name").value.trim(),

            brand: document.querySelector("#request-brand").value.trim() || null,

            color: document.querySelector("#request-color").value.trim() || null,

            size: document.querySelector("#request-size").value.trim() || null,

            quantity: Number(document.querySelector("#request-quantity").value),

            description:
                document.querySelector("#request-description").value.trim() || null,
        };

        // Check required information
        if (
            !requestData.customer_name ||
            !requestData.customer_phone ||
            !requestData.item_name ||
            !Number.isInteger(requestData.quantity) ||
            requestData.quantity <= 0
        ) {
            specialRequestStatus.textContent =
                "Please enter your name, phone, item name and a valid quantity.";
            return;
        }

        const requestButton = specialRequestForm.querySelector(
            'button[type="submit"]',
        );

        if (requestButton) {
            requestButton.disabled = true;
        }

        try {
            // Send the request to FastAPI
            const response = await fetch(REQUESTS_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            const savedRequest = await response.json();

            specialRequestForm.reset();

            specialRequestStatus.textContent =
                "Request submitted successfully! Request number: " +
                savedRequest.request_id +
                ". Current status: " +
                savedRequest.status +
                ".";
        } catch (error) {
            console.error("Special request failed:", error);

            specialRequestStatus.textContent =
                "Could not submit your request: " + error.message;
        } finally {
            if (requestButton) {
                requestButton.disabled = false;
            }
        }
    });
}

/* ==========================================
   LOAD SPECIAL REQUESTS
   ========================================== */

async function loadItemRequests() {
    if (!requestsList) return;

    const token = window.prompt(
        "Enter your API access token to view special requests:",
    );

    if (token === null || !token.trim()) {
        if (manageRequestsStatus) {
            manageRequestsStatus.textContent =
                "Access token not entered. Requests were not loaded.";
        }
        return;
    }

    if (manageRequestsStatus) {
        manageRequestsStatus.textContent = "Loading requests...";
    }

    try {
        const response = await fetch(REQUESTS_URL, {
            headers: {
                Authorization: "Bearer " + token.trim(),
            },
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const requests = await response.json();

        displayItemRequests(requests, token.trim());

        if (manageRequestsStatus) {
            manageRequestsStatus.textContent =
                requests.length + " special request(s) loaded.";
        }
    } catch (error) {
        console.error("Could not load requests:", error);

        if (manageRequestsStatus) {
            manageRequestsStatus.textContent =
                "Could not load requests: " + error.message;
        }
    }
}

/* ==========================================
   DISPLAY REQUESTS IN THE TABLE
   ========================================== */

function displayItemRequests(requests, token) {
    if (!requestsList) return;

    requestsList.replaceChildren();

    if (!Array.isArray(requests) || requests.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 11;
        cell.textContent = "No special requests have been submitted.";

        row.appendChild(cell);
        requestsList.appendChild(row);
        return;
    }

    requests.forEach((request) => {
        const row = document.createElement("tr");

        const values = [
            request.request_id,
            request.customer_name,
            request.customer_phone,
            request.item_name,
            request.brand || "—",
            request.color || "—",
            request.size || "—",
            request.quantity,
            request.description || "—",
            request.status,
        ];

        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = String(value ?? "—");
            row.appendChild(cell);
        });

        // Create a status update button
        const actionCell = document.createElement("td");
        const statusButton = document.createElement("button");

        statusButton.type = "button";
        statusButton.textContent = "Update Status";
        statusButton.className = "order-button";

        statusButton.addEventListener("click", async function () {
            const newStatus = window.prompt(
                "Enter the new status: Pending, Accepted, or Rejected",
                request.status,
            );

            if (newStatus === null) return;

            const cleanStatus = newStatus.trim().toLowerCase();

            const allowedStatuses = {
                pending: "Pending",
                accepted: "Accepted",
                rejected: "Rejected",
            };

            if (!allowedStatuses[cleanStatus]) {
                alert("Please enter Pending, Accepted, or Rejected.");
                return;
            }

            statusButton.disabled = true;

            try {
                const updateResponse = await fetch(
                    REQUESTS_URL + "/" + request.request_id,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + token,
                        },
                        body: JSON.stringify({
                            status: allowedStatuses[cleanStatus],
                        }),
                    },
                );

                if (!updateResponse.ok) {
                    throw new Error(await getErrorMessage(updateResponse));
                }

                alert("Request status updated successfully.");

                // Refresh the table after updating
                await loadItemRequests();
            } catch (error) {
                console.error("Could not update request:", error);

                alert("Could not update status: " + error.message);
            } finally {
                statusButton.disabled = false;
            }
        });

        actionCell.appendChild(statusButton);
        row.appendChild(actionCell);

        requestsList.appendChild(row);
    });
}

/* ==========================================
   CONNECT THE LOAD REQUESTS BUTTON
   ========================================== */

if (loadRequestsButton) {
    loadRequestsButton.addEventListener("click", loadItemRequests);
}

/* ==========================================
   LOAD THE CLOTHING WHEN THE PAGE OPENS
   ========================================== */

loadClothes();
