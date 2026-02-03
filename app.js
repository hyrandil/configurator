const catalog = [
  {
    id: "cpu",
    title: "vCPU",
    description: "Skaliert lineare Unit-Preise",
    type: "range",
    unit: "vCPU",
    min: 1,
    max: 64,
    step: 1,
    value: 4,
    unitPrice: 12,
  },
  {
    id: "ram",
    title: "RAM",
    description: "Preis pro GB mit Staffelung",
    type: "range",
    unit: "GB",
    min: 4,
    max: 256,
    step: 4,
    value: 16,
    unitPrice: 3.5,
    tiers: [
      { upTo: 64, price: 3.5 },
      { upTo: 128, price: 3.0 },
      { upTo: Infinity, price: 2.6 },
    ],
  },
  {
    id: "gpu",
    title: "GPU",
    description: "Optionen mit Fixpreis",
    type: "select",
    unit: "Option",
    value: "none",
    options: [
      { value: "none", label: "Keine GPU", price: 0 },
      { value: "a10", label: "NVIDIA A10", price: 180 },
      { value: "l40", label: "NVIDIA L40", price: 420 },
    ],
  },
  {
    id: "storage",
    title: "Storage",
    description: "SSD-Tier mit Mindestpreis",
    type: "range",
    unit: "TB",
    min: 1,
    max: 20,
    step: 1,
    value: 2,
    unitPrice: 35,
    minimum: 90,
  },
  {
    id: "support",
    title: "Support",
    description: "Service-Level & SLA",
    type: "select",
    unit: "Tier",
    value: "business",
    options: [
      { value: "starter", label: "Starter (8x5)", price: 49 },
      { value: "business", label: "Business (12x5)", price: 129 },
      { value: "enterprise", label: "Enterprise (24x7)", price: 249 },
    ],
  },
];

const state = {
  selected: ["cpu", "ram", "gpu"],
  discount: 5,
  minimumCharge: 149,
};

const elementList = document.getElementById("elementList");
const canvas = document.getElementById("canvas");
const summaryDetails = document.getElementById("summaryDetails");
const subtotalEl = document.getElementById("subtotal");
const discountEl = document.getElementById("discount");
const minimumEl = document.getElementById("minimum");
const totalEl = document.getElementById("total");
const discountRange = document.getElementById("discountRange");
const discountValue = document.getElementById("discountValue");
const minimumCharge = document.getElementById("minimumCharge");
const toast = document.getElementById("toast");

const formatMoney = (value) => `${value.toFixed(2)} €`;

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast.hideTimeout);
  toast.hideTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
};

const tieredPrice = (item, quantity) => {
  if (!item.tiers) {
    return quantity * item.unitPrice;
  }
  const tier = item.tiers.find((entry) => quantity <= entry.upTo) ?? item.tiers.at(-1);
  return quantity * tier.price;
};

const getLinePrice = (item) => {
  if (item.type === "select") {
    const option = item.options.find((opt) => opt.value === item.value);
    return option ? option.price : 0;
  }

  const quantity = item.value;
  const base = tieredPrice(item, quantity);
  if (item.minimum) {
    return Math.max(base, item.minimum);
  }
  return base;
};

const renderLibrary = () => {
  elementList.innerHTML = "";
  catalog.forEach((item) => {
    const card = document.createElement("div");
    card.className = "element-card";
    card.innerHTML = `
      <strong>${item.title}</strong>
      <span class="muted">${item.description}</span>
      <button data-id="${item.id}">Element hinzufügen</button>
    `;
    card.querySelector("button").addEventListener("click", () => addElement(item.id));
    elementList.appendChild(card);
  });
};

const renderCanvas = () => {
  canvas.innerHTML = "";
  state.selected.forEach((id) => {
    const item = catalog.find((entry) => entry.id === id);
    if (!item) return;

    const wrapper = document.createElement("div");
    wrapper.className = "canvas-item";

    const header = document.createElement("header");
    header.innerHTML = `
      <div>
        <h4>${item.title}</h4>
        <small>${item.description}</small>
      </div>
      <button class="ghost" data-remove="${item.id}">Entfernen</button>
    `;

    const controls = document.createElement("div");
    controls.className = "canvas-controls";

    if (item.type === "range") {
      controls.innerHTML = `
        <div class="range-row">
          <input type="range" min="${item.min}" max="${item.max}" step="${item.step}" value="${item.value}" data-range="${item.id}" />
          <div class="muted">${item.value} ${item.unit}</div>
        </div>
      `;
    }

    if (item.type === "select") {
      const optionsMarkup = item.options
        .map(
          (option) =>
            `<option value="${option.value}" ${option.value === item.value ? "selected" : ""}>
              ${option.label}
            </option>`
        )
        .join("");
      controls.innerHTML = `
        <select data-select="${item.id}">
          ${optionsMarkup}
        </select>
      `;
    }

    if (item.type === "number") {
      controls.innerHTML = `
        <input type="number" min="${item.min}" max="${item.max}" step="${item.step}" value="${item.value}" data-number="${item.id}" />
      `;
    }

    wrapper.appendChild(header);
    wrapper.appendChild(controls);
    canvas.appendChild(wrapper);
  });

  canvas.querySelectorAll("button[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeElement(button.dataset.remove));
  });

  canvas.querySelectorAll("input[data-range]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const item = catalog.find((entry) => entry.id === event.target.dataset.range);
      item.value = Number(event.target.value);
      event.target.nextElementSibling.textContent = `${item.value} ${item.unit}`;
      updateSummary();
    });
  });

  canvas.querySelectorAll("select[data-select]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const item = catalog.find((entry) => entry.id === event.target.dataset.select);
      item.value = event.target.value;
      updateSummary();
    });
  });

  canvas.querySelectorAll("input[data-number]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const item = catalog.find((entry) => entry.id === event.target.dataset.number);
      item.value = Number(event.target.value);
      updateSummary();
    });
  });
};

const updateSummary = () => {
  const selectedItems = state.selected.map((id) => catalog.find((entry) => entry.id === id));
  const lineItems = selectedItems.map((item) => ({
    id: item.id,
    name: item.title,
    price: getLinePrice(item),
  }));
  const subtotal = lineItems.reduce((sum, item) => sum + item.price, 0);
  const discountValueAmount = subtotal * (state.discount / 100);
  const discounted = subtotal - discountValueAmount;
  const total = Math.max(discounted, state.minimumCharge);

  subtotalEl.textContent = formatMoney(subtotal);
  discountEl.textContent = `-${formatMoney(discountValueAmount)}`;
  minimumEl.textContent = formatMoney(state.minimumCharge);
  totalEl.textContent = formatMoney(total);

  summaryDetails.innerHTML = lineItems
    .map((item) => `<div class="detail"><span>${item.name}</span><span>${formatMoney(item.price)}</span></div>`)
    .join("");
};

const addElement = (id) => {
  if (!state.selected.includes(id)) {
    state.selected.push(id);
    renderCanvas();
    updateSummary();
    showToast("Element hinzugefügt");
  }
};

const removeElement = (id) => {
  state.selected = state.selected.filter((itemId) => itemId !== id);
  renderCanvas();
  updateSummary();
  showToast("Element entfernt");
};

const resetBuilder = () => {
  state.selected = ["cpu", "ram", "gpu"];
  catalog.forEach((item) => {
    if (item.id === "cpu") item.value = 4;
    if (item.id === "ram") item.value = 16;
    if (item.id === "gpu") item.value = "none";
    if (item.id === "storage") item.value = 2;
    if (item.id === "support") item.value = "business";
  });
  renderCanvas();
  updateSummary();
  showToast("Builder zurückgesetzt");
};

const wireActions = () => {
  discountRange.addEventListener("input", (event) => {
    state.discount = Number(event.target.value);
    discountValue.textContent = `${state.discount}%`;
    updateSummary();
  });

  minimumCharge.addEventListener("input", (event) => {
    state.minimumCharge = Number(event.target.value || 0);
    updateSummary();
  });

  document.getElementById("resetBuilder").addEventListener("click", resetBuilder);
  document.getElementById("saveDraft").addEventListener("click", () => showToast("Entwurf gespeichert"));
  document.getElementById("createOffer").addEventListener("click", () => showToast("Angebot erstellt"));
};

renderLibrary();
renderCanvas();
updateSummary();
wireActions();
