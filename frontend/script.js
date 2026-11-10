/* ==========================================
   PURE STYLE - CLOTHING STORE
   ========================================== */

// Backend API address
const API_BASE_URL = "https://pure-style-api.onrender.com";
// Get the HTML elements
const clothingList = document.querySelector("#clothing-list");
const inventoryStatus = document.querySelector("#inventory-status");
const clothingForm = document.querySelector("#clothing-form");
const formStatus = document.querySelector("#form-status");
const submitButton = clothingForm
    ? clothingForm.querySelector('button[type="submit"]')
    : null;
/* ==========================================
   ACCOUNT AND AUTHENTICATION ELEMENTS
   ========================================== */

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const accountStatus = document.querySelector("#account-status");
const loggedInAccount = document.querySelector("#logged-in-account");
const accountWelcome = document.querySelector("#account-welcome");
const logoutButton = document.querySelector("#logout-button");

const adminOnlySections = document.querySelectorAll("[data-admin-only]");

// Store the login session for the current browser tab.
const getAuthToken = () => sessionStorage.getItem("access_token");

const getAuthHeaders = () => {
    const token = getAuthToken();

    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
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
   ACCOUNT LOGIN AND REGISTRATION
   ========================================== */

function updateAccountDisplay(user) {
    const accountForms = document.querySelector("#account-forms");
    const isLoggedIn = Boolean(user);
    const isAdmin = isLoggedIn && user.role === "admin";

    if (accountForms) {
        accountForms.hidden = isLoggedIn;
    }

    if (loggedInAccount) {
        loggedInAccount.hidden = !isLoggedIn;
    }

    if (accountWelcome && isLoggedIn) {
        accountWelcome.textContent = `Welcome, ${user.email}! Your role: ${user.role}.`;
    }

    adminOnlySections.forEach((section) => {
        section.hidden = !isAdmin;
    });

    if (accountStatus && isLoggedIn) {
        accountStatus.textContent = "You are successfully logged in.";
    }
}

// Log in an existing customer or administrator
async function loginAccount(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            username: email,
            password: password,
        }),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    const tokenData = await response.json();

    sessionStorage.setItem("access_token", tokenData.access_token);

    const userResponse = await fetch(`${API_BASE_URL}/me`, {
        headers: getAuthHeaders(),
    });

    if (!userResponse.ok) {
        sessionStorage.removeItem("access_token");
        throw new Error(await getErrorMessage(userResponse));
    }

    const user = await userResponse.json();

    updateAccountDisplay(user);
}

// Connect the login form
if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        accountStatus.textContent = "Signing you in...";

        const email = document.querySelector("#login-email").value.trim();
        const password = document.querySelector("#login-password").value;

        try {
            await loginAccount(email, password);

            loginForm.reset();
        } catch (error) {
            console.error("Login failed:", error);
            accountStatus.textContent = "Login failed: " + error.message;
        }
    });
}

// Connect the registration form
if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        accountStatus.textContent = "Creating your account...";

        const name = document.querySelector("#register-name").value.trim();
        const phone = document.querySelector("#register-phone").value.trim();
        const email = document.querySelector("#register-email").value.trim();
        const password = document.querySelector("#register-password").value;

        try {
            // Create the customer account
            const registerResponse = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!registerResponse.ok) {
                throw new Error(await getErrorMessage(registerResponse));
            }

            // Log in the newly registered customer
            await loginAccount(email, password);

            // Create the customer's profile
            const profileResponse = await fetch(`${API_BASE_URL}/customers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    name: name,
                    phone: phone,
                }),
            });

            if (!profileResponse.ok) {
                throw new Error(await getErrorMessage(profileResponse));
            }

            registerForm.reset();

            accountStatus.textContent =
                "Your account and customer profile were created successfully!";
        } catch (error) {
            console.error("Registration failed:", error);
            accountStatus.textContent = "Registration failed: " + error.message;
        }
    });
}

// Log out the current user
if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("access_token");

        updateAccountDisplay(null);

        if (accountStatus) {
            accountStatus.textContent = "You have logged out successfully.";
        }
    });
}

// Restore the current login session when the page opens
async function initializeAccount() {
    const token = getAuthToken();

    if (!token) {
        updateAccountDisplay(null);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error("Your session has expired. Please log in again.");
        }

        const user = await response.json();

        updateAccountDisplay(user);
    } catch (error) {
        sessionStorage.removeItem("access_token");
        updateAccountDisplay(null);

        if (accountStatus) {
            accountStatus.textContent = error.message;
        }
    }
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

        const image = document.createElement("img");
        image.className = "product-image";

        image.src = item.image_url ? "./" + item.image_url.replace(/^\/+/, "") : "";

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
        const response = await fetch(API_BASE_URL + "/clothes");

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

/* ==========================================
   PLACE A CLOTHING ORDER
   ========================================== */
async function startOrder(clothingId) {
    const token = getAuthToken();

    // Require the customer to log in first
    if (!token) {
        alert("Please sign in or create an account before placing an order.");

        document.querySelector("#account")?.scrollIntoView({
            behavior: "smooth",
        });

        return;
    }

    const quantityInput = window.prompt(
        "How many items would you like to order?",
    );

    if (quantityInput === null) return;

    const quantity = Number(quantityInput);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity greater than zero.");
        return;
    }

    try {
        // Verify the logged-in user
        const userResponse = await fetch(`${API_BASE_URL}/me`, {
            headers: getAuthHeaders(),
        });

        if (!userResponse.ok) {
            throw new Error("Your session has expired. Please log in again.");
        }

        const user = await userResponse.json();

        if (user.role !== "customer") {
            throw new Error("Only customer accounts can place clothing orders.");
        }

        // Check whether the customer has a profile
        const profileResponse = await fetch(`${API_BASE_URL}/customers/me`, {
            headers: getAuthHeaders(),
        });

        // Create a profile if one does not exist
        if (profileResponse.status === 404) {
            const name = window.prompt("Enter your full name:");
            if (!name || !name.trim()) return;

            const phone = window.prompt("Enter your phone number:");
            if (!phone || !phone.trim()) return;

            const createProfileResponse = await fetch(`${API_BASE_URL}/customers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    name: name.trim(),
                    phone: phone.trim(),
                }),
            });

            if (!createProfileResponse.ok) {
                throw new Error(await getErrorMessage(createProfileResponse));
            }
        } else if (!profileResponse.ok) {
            throw new Error(await getErrorMessage(profileResponse));
        }

        // Complete the order using the existing function
        await completeOrder(clothingId, quantity, token);
    } catch (error) {
        console.error("Order error:", error);

        alert(error.message || "Something went wrong while placing your order.");
    }
}

// Create the order and add the selected clothing item
async function completeOrder(clothingId, quantity, token) {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    // First create the order
    const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            order_date: new Date().toISOString().slice(0, 10),
        }),
    });

    if (!orderResponse.ok) {
        throw new Error(await getErrorMessage(orderResponse));
    }

    const order = await orderResponse.json();

    // Then add the selected clothing item
    const itemResponse = await fetch(
        `${API_BASE_URL}/orders/${order.order_id}/items`,
        {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                clothing_id: clothingId,
                quantity: quantity,
            }),
        },
    );

    if (!itemResponse.ok) {
        throw new Error(await getErrorMessage(itemResponse));
    }

    alert("Your order has been placed successfully!");

    // Refresh the clothing collection
    await loadClothes();
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

        const token = getAuthToken();

        if (!token) {
            formStatus.textContent =
                "Please log in as an administrator before adding clothing.";
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
            const response = await fetch(API_BASE_URL + "/clothes", {
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
const REQUESTS_URL = API_BASE_URL + "/item-requests";

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

    const token = getAuthToken();

    if (!token) {
        manageRequestsStatus.textContent =
            "Please log in as an administrator to view special requests.";
        return;
    }

    if (manageRequestsStatus) {
        manageRequestsStatus.textContent = "Loading requests...";
    }

    try {
        const response = await fetch(REQUESTS_URL, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const requests = await response.json();

        displayItemRequests(requests, token);

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
   ADMIN: MANAGE CUSTOMERS
   ========================================== */

const loadCustomersButton = document.querySelector("#load-customers");
const manageCustomersStatus = document.querySelector("#manage-customers-status");
const customersList = document.querySelector("#customers-list");

async function loadCustomers() {
    if (!customersList || !manageCustomersStatus) return;

    if (!getAuthToken()) {
        manageCustomersStatus.textContent =
            "Please log in as an administrator to view customers.";
        return;
    }

    manageCustomersStatus.textContent = "Loading customers...";
    loadCustomersButton.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/customers`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const customers = await response.json();

        customersList.replaceChildren();

        if (!Array.isArray(customers) || customers.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 3;
            cell.textContent = "No customer profiles found.";

            row.appendChild(cell);
            customersList.appendChild(row);
        } else {
            customers.forEach((customer) => {
                const row = document.createElement("tr");

                [
                    customer.customer_id,
                    customer.name,
                    customer.phone,
                ].forEach((value) => {
                    const cell = document.createElement("td");
                    cell.textContent = String(value ?? "—");
                    row.appendChild(cell);
                });

                customersList.appendChild(row);
            });
        }

        manageCustomersStatus.textContent =
            `${customers.length} customer(s) loaded successfully.`;

    } catch (error) {
        console.error("Could not load customers:", error);

        manageCustomersStatus.textContent =
            "Could not load customers: " + error.message;
    } finally {
        loadCustomersButton.disabled = false;
    }
}

if (loadCustomersButton) {
    loadCustomersButton.addEventListener("click", loadCustomers);
}


/* ==========================================
   ADMIN: MANAGE ORDERS
   ========================================== */

const loadOrdersButton = document.querySelector("#load-orders");
const manageOrdersStatus = document.querySelector("#manage-orders-status");
const ordersList = document.querySelector("#orders-list");

async function loadOrders() {
    if (!ordersList || !manageOrdersStatus) return;

    if (!getAuthToken()) {
        manageOrdersStatus.textContent =
            "Please log in as an administrator to view orders.";
        return;
    }

    manageOrdersStatus.textContent = "Loading orders...";
    loadOrdersButton.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const orders = await response.json();

        const clothesResponse = await fetch(`${API_BASE_URL}/clothes`);

        if (!clothesResponse.ok) {
            throw new Error("Could not load clothing details.");
        }

        const clothes = await clothesResponse.json();

        const clothingMap = new Map(
            clothes.map((item) => [
                Number(item.clothing_id),
                item.name,
            ])
        );

        ordersList.replaceChildren();

        if (!Array.isArray(orders) || orders.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.textContent = "No orders have been placed yet.";

            row.appendChild(cell);
            ordersList.appendChild(row);
        } else {
            orders.forEach((order) => {
                const row = document.createElement("tr");

                const items = Array.isArray(order.items)
                    ? order.items
                    : [];

                const itemDetails = items.length
                    ? items.map((item) => {
                        const clothingName =
                            clothingMap.get(Number(item.clothing_id)) ||
                            `Unknown item (${item.clothing_id})`;

                        return `${clothingName} × ${item.quantity}`;
                    }).join(", ")
                    : "No items";

                const total = items.reduce((sum, item) => {
                    return sum +
                        Number(item.unit_price) * Number(item.quantity);
                }, 0);

                const values = [
                    order.order_id,
                    order.customer_id,
                    order.order_date,
                    itemDetails,
                    "KSh " + formatPrice(total),
                ];

                values.forEach((value) => {
                    const cell = document.createElement("td");
                    cell.textContent = String(value ?? "—");
                    row.appendChild(cell);
                });

                ordersList.appendChild(row);
            });
        }

        manageOrdersStatus.textContent =
            `${orders.length} order(s) loaded successfully.`;

    } catch (error) {
        console.error("Could not load orders:", error);

        manageOrdersStatus.textContent =
            "Could not load orders: " + error.message;
    } finally {
        loadOrdersButton.disabled = false;
    }
}

if (loadOrdersButton) {
    loadOrdersButton.addEventListener("click", loadOrders);
}

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
        const passwordWrapper = button.closest(".password-input-wrapper");
        const passwordInput = passwordWrapper.querySelector("input");

        const isPasswordHidden = passwordInput.type === "password";

        passwordInput.type = isPasswordHidden ? "text" : "password";

        button.textContent = isPasswordHidden ? "🙈" : "👁";
        button.setAttribute(
            "aria-label",
            isPasswordHidden ? "Hide password" : "Show password"
        );
        button.setAttribute("aria-pressed", String(isPasswordHidden));
    });
});

/* ==========================================
   CONNECT THE LOAD REQUESTS BUTTON
   ========================================== */

if (loadRequestsButton) {
    loadRequestsButton.addEventListener("click", loadItemRequests);
}

/* ==========================================
   LOAD THE CLOTHING WHEN THE PAGE OPENS
   ========================================== */

initializeAccount();
loadClothes();
