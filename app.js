const elements = [
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
    minimum: 0,
    tiersEnabled: false,
    tiers: [],
    options: [],
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
    minimum: 0,
    tiersEnabled: true,
    tiers: [
      { upTo: 64, price: 3.5 },
      { upTo: 128, price: 3.0 },
      { upTo: Infinity, price: 2.6 },
    ],
    options: [],
  },
  {
    id: "gpu",
    title: "GPU",
    description: "Optionen mit Fixpreis",
    type: "select",
    unit: "Option",
    value: "none",
    unitPrice: 0,
    minimum: 0,
    tiersEnabled: false,
    tiers: [],
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
    tiersEnabled: false,
    tiers: [],
    options: [],
  },
  {
    id: "support",
    title: "Support",
    description: "Service-Level & SLA",
    type: "select",
    unit: "Tier",
    value: "business",
    unitPrice: 0,
    minimum: 0,
    tiersEnabled: false,
    tiers: [],
    options: [
      { value: "starter", label: "Starter (8x5)", price: 49 },
      { value: "business", label: "Business (12x5)", price: 129 },
      { value: "enterprise", label: "Enterprise (24x7)", price: 249 },
    ],
  },
];

const units = ["vCPU", "GB", "TB", "Option", "Tier", "User", "Projekt"];

const calculators = [
  {
    id: "calc-1",
    name: "Cloud Compute v1",
    status: "Active",
    updatedAt: "Heute",
    elementIds: ["cpu", "ram", "gpu"],
    values: {
      cpu: 4,
      ram: 16,
      gpu: "none",
    },
  },
  {
    id: "calc-2",
    name: "Storage Booster",
    status: "Draft",
    updatedAt: "Gestern",
    elementIds: ["storage", "support"],
    values: {
      storage: 5,
      support: "business",
    },
  },
];

const offers = [
  {
    id: "offer-1001",
    title: "Angebot ACME GmbH",
    status: "draft",
    calculatorId: "calc-1",
    adjustment: -120,
    adjustmentReason: "Q4 Promo",
    notes: "Priorität: schnelles Feedback.",
    contact: {
      company: "ACME GmbH",
      contactName: "Laura König",
      street: "Hauptstraße 12",
      zip: "10115",
      city: "Berlin",
      country: "DE",
    },
  },
  {
    id: "offer-1002",
    title: "Angebot Helio AG",
    status: "review",
    calculatorId: "calc-2",
    adjustment: 0,
    adjustmentReason: "",
    notes: "Budgetprüfung läuft.",
    contact: {
      company: "Helio AG",
      contactName: "Mila Schröder",
      street: "Solarweg 8",
      zip: "80331",
      city: "München",
      country: "DE",
    },
  },
];

const state = {
  selected: ["cpu", "ram", "gpu"],
  discount: 5,
  minimumCharge: 149,
  activeElementId: "cpu",
  activeCalculatorId: "calc-1",
  activeOfferId: "offer-1001",
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
const calculatorName = document.getElementById("calculatorName");

const adminList = document.getElementById("adminList");
const elementName = document.getElementById("elementName");
const elementKey = document.getElementById("elementKey");
const elementUnit = document.getElementById("elementUnit");
const elementType = document.getElementById("elementType");
const elementMin = document.getElementById("elementMin");
const elementMax = document.getElementById("elementMax");
const elementStep = document.getElementById("elementStep");
const elementUnitPrice = document.getElementById("elementUnitPrice");
const elementMinimum = document.getElementById("elementMinimum");
const tiersEnabled = document.getElementById("tiersEnabled");
const tiersPanel = document.getElementById("tiersPanel");
const tiersList = document.getElementById("tiersList");
const optionsPanel = document.getElementById("optionsPanel");
const optionsList = document.getElementById("optionsList");
const unitList = document.getElementById("unitList");
const newUnit = document.getElementById("newUnit");

const calculatorGrid = document.getElementById("calculatorGrid");

const offerList = document.getElementById("offerList");
const offerTitle = document.getElementById("offerTitle");
const offerStatus = document.getElementById("offerStatus");
const offerCalculator = document.getElementById("offerCalculator");
const offerAdjustment = document.getElementById("offerAdjustment");
const offerAdjustmentReason = document.getElementById("offerAdjustmentReason");
const offerNotes = document.getElementById("offerNotes");
const offerCompany = document.getElementById("offerCompany");
const offerContact = document.getElementById("offerContact");
const offerStreet = document.getElementById("offerStreet");
const offerZip = document.getElementById("offerZip");
const offerCity = document.getElementById("offerCity");
const offerCountry = document.getElementById("offerCountry");
const offerBaseTotal = document.getElementById("offerBaseTotal");
const offerAdjustmentPreview = document.getElementById("offerAdjustmentPreview");
const offerFinalTotal = document.getElementById("offerFinalTotal");

const formatMoney = (value) => `${value.toFixed(2)} €`;

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast.hideTimeout);
  toast.hideTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const tieredPrice = (item, quantity) => {
  if (!item.tiersEnabled || item.tiers.length === 0) {
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

const computeTotalForCalculator = (calculator) => {
  const elementIds = calculator.elementIds ?? [];
  let subtotal = 0;
  elementIds.forEach((id) => {
    const element = elements.find((entry) => entry.id === id);
    if (!element) return;
    const temp = { ...clone(element) };
    if (calculator.values && calculator.values[id] !== undefined) {
      temp.value = calculator.values[id];
    }
    subtotal += getLinePrice(temp);
  });
  const discountValueAmount = subtotal * (state.discount / 100);
  const discounted = subtotal - discountValueAmount;
  return Math.max(discounted, state.minimumCharge);
};

const renderLibrary = () => {
  elementList.innerHTML = "";
  elements.forEach((item) => {
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
    const item = elements.find((entry) => entry.id === id);
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
      const item = elements.find((entry) => entry.id === event.target.dataset.range);
      item.value = Number(event.target.value);
      event.target.nextElementSibling.textContent = `${item.value} ${item.unit}`;
      updateSummary();
    });
  });

  canvas.querySelectorAll("select[data-select]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const item = elements.find((entry) => entry.id === event.target.dataset.select);
      item.value = event.target.value;
      updateSummary();
    });
  });

  canvas.querySelectorAll("input[data-number]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const item = elements.find((entry) => entry.id === event.target.dataset.number);
      item.value = Number(event.target.value);
      updateSummary();
    });
  });
};

const updateSummary = () => {
  const selectedItems = state.selected
    .map((id) => elements.find((entry) => entry.id === id))
    .filter(Boolean);
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
  elements.forEach((item) => {
    if (item.type === "select") {
      item.value = item.options[0]?.value ?? "";
    }
    if (item.type === "range" || item.type === "number") {
      item.value = item.min ?? 0;
    }
  });
  renderCanvas();
  updateSummary();
  showToast("Builder zurückgesetzt");
};

const renderAdminList = () => {
  adminList.innerHTML = "";
  elements.forEach((item) => {
    const row = document.createElement("div");
    row.className = `admin-item ${item.id === state.activeElementId ? "active" : ""}`;
    row.innerHTML = `
      <strong>${item.title}</strong>
      <span class="muted">${item.unit} • ${item.type}</span>
    `;
    row.addEventListener("click", () => {
      state.activeElementId = item.id;
      renderAdminList();
      renderAdminEditor();
    });
    adminList.appendChild(row);
  });
};

const renderUnitOptions = () => {
  elementUnit.innerHTML = units.map((unit) => `<option value="${unit}">${unit}</option>`).join("");
};

const renderUnits = () => {
  unitList.innerHTML = "";
  units.forEach((unit) => {
    const row = document.createElement("div");
    row.className = "unit-item";
    row.innerHTML = `
      <span>${unit}</span>
      <button class="ghost" data-unit="${unit}">Entfernen</button>
    `;
    row.querySelector("button").addEventListener("click", () => {
      if (units.length === 1) {
        showToast("Mindestens eine Einheit behalten");
        return;
      }
      const index = units.indexOf(unit);
      units.splice(index, 1);
      elements.forEach((item) => {
        if (item.unit === unit) {
          item.unit = units[0];
        }
      });
      renderUnitOptions();
      renderUnits();
      renderAdminEditor();
      renderCanvas();
      updateSummary();
    });
    unitList.appendChild(row);
  });
};

const renderTiers = (item) => {
  tiersList.innerHTML = "";
  item.tiers.forEach((tier, index) => {
    const row = document.createElement("div");
    row.className = "tier-row";
    const upToValue = tier.upTo === Infinity ? "∞" : tier.upTo;
    row.innerHTML = `
      <input type="text" value="${upToValue}" data-tier="${index}" data-field="upTo" />
      <input type="number" value="${tier.price}" data-tier="${index}" data-field="price" />
      <button class="ghost" data-remove-tier="${index}">Entfernen</button>
    `;
    tiersList.appendChild(row);
  });

  tiersList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const index = Number(event.target.dataset.tier);
      const field = event.target.dataset.field;
      const value = event.target.value;
      if (field === "upTo") {
        const parsed = value === "∞" ? Infinity : Number(value);
        item.tiers[index].upTo = Number.isNaN(parsed) ? Infinity : parsed;
      } else {
        item.tiers[index].price = Number(value || 0);
      }
      updateSummary();
    });
  });

  tiersList.querySelectorAll("button[data-remove-tier]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.removeTier);
      item.tiers.splice(index, 1);
      renderTiers(item);
      updateSummary();
    });
  });
};

const renderOptions = (item) => {
  optionsList.innerHTML = "";
  item.options.forEach((option, index) => {
    const row = document.createElement("div");
    row.className = "option-row";
    row.innerHTML = `
      <input type="text" value="${option.label}" data-option="${index}" data-field="label" />
      <input type="text" value="${option.value}" data-option="${index}" data-field="value" />
      <input type="number" value="${option.price}" data-option="${index}" data-field="price" />
      <button class="ghost" data-remove-option="${index}">Entfernen</button>
    `;
    optionsList.appendChild(row);
  });

  optionsList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const index = Number(event.target.dataset.option);
      const field = event.target.dataset.field;
      const value = event.target.value;
      if (field === "price") {
        item.options[index][field] = Number(value || 0);
      } else {
        item.options[index][field] = value;
      }
      renderLibrary();
      renderCanvas();
      updateSummary();
    });
  });

  optionsList.querySelectorAll("button[data-remove-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.removeOption);
      item.options.splice(index, 1);
      if (item.type === "select" && item.options.length === 0) {
        item.options.push({ value: "option", label: "Option", price: 0 });
      }
      if (item.type === "select") {
        item.value = item.options[0]?.value ?? "";
      }
      renderOptions(item);
      renderCanvas();
      updateSummary();
    });
  });
};

const renderAdminEditor = () => {
  const item = elements.find((entry) => entry.id === state.activeElementId) ?? elements[0];
  state.activeElementId = item.id;
  elementName.value = item.title;
  elementKey.value = item.id;
  elementUnit.value = item.unit;
  elementType.value = item.type;
  elementMin.value = item.min ?? 0;
  elementMax.value = item.max ?? 0;
  elementStep.value = item.step ?? 1;
  elementUnitPrice.value = item.unitPrice ?? 0;
  elementMinimum.value = item.minimum ?? 0;
  tiersEnabled.checked = item.tiersEnabled;

  tiersPanel.classList.toggle("hidden", item.type === "select");
  optionsPanel.classList.toggle("hidden", item.type !== "select");

  renderTiers(item);
  renderOptions(item);
};

const addNewElement = () => {
  const id = `element-${Date.now()}`;
  const newItem = {
    id,
    title: "Neues Element",
    description: "Beschreibung hinzufügen",
    type: "range",
    unit: units[0],
    min: 1,
    max: 10,
    step: 1,
    value: 1,
    unitPrice: 10,
    minimum: 0,
    tiersEnabled: false,
    tiers: [],
    options: [{ value: "option", label: "Option", price: 0 }],
  };
  elements.push(newItem);
  state.activeElementId = newItem.id;
  renderLibrary();
  renderAdminList();
  renderAdminEditor();
  showToast("Neues Element erstellt");
};

const saveElementChanges = () => {
  const item = elements.find((entry) => entry.id === state.activeElementId);
  if (!item) return;
  const nextId = elementKey.value.trim() || item.id;
  if (nextId !== item.id && elements.some((entry) => entry.id === nextId)) {
    showToast("Key bereits vergeben");
    elementKey.value = item.id;
    return;
  }
  const previousId = item.id;
  item.title = elementName.value.trim() || item.title;
  item.id = nextId;
  item.unit = elementUnit.value;
  item.type = elementType.value;
  item.min = Number(elementMin.value || 0);
  item.max = Number(elementMax.value || 0);
  item.step = Number(elementStep.value || 1);
  item.unitPrice = Number(elementUnitPrice.value || 0);
  item.minimum = Number(elementMinimum.value || 0);
  item.tiersEnabled = tiersEnabled.checked;
  if (item.type === "select" && item.options.length === 0) {
    item.options.push({ value: "option", label: "Option", price: 0 });
  }
  if (item.type === "select") {
    item.value = item.options[0]?.value ?? "";
  }
  if (previousId !== item.id) {
    state.selected = state.selected.map((id) => (id === previousId ? item.id : id));
    calculators.forEach((calculator) => {
      calculator.elementIds = calculator.elementIds.map((id) => (id === previousId ? item.id : id));
      if (calculator.values[previousId] !== undefined) {
        calculator.values[item.id] = calculator.values[previousId];
        delete calculator.values[previousId];
      }
    });
    state.activeElementId = item.id;
  }
  renderLibrary();
  renderAdminList();
  renderCanvas();
  renderCalculators();
  renderOfferCalculatorOptions();
  updateSummary();
  updateOfferPreview();
  showToast("Element aktualisiert");
};

const renderCalculators = () => {
  calculatorGrid.innerHTML = "";
  calculators.forEach((calculator) => {
    const card = document.createElement("div");
    card.className = "calculator-card";
    const total = computeTotalForCalculator(calculator);
    card.innerHTML = `
      <div>
        <strong>${calculator.name}</strong>
        <p class="muted">${calculator.elementIds.length} Elemente</p>
      </div>
      <div class="meta">
        <span>${calculator.status}</span>
        <span>${calculator.updatedAt}</span>
      </div>
      <div class="summary-item">
        <span>Preis</span>
        <strong>${formatMoney(total)}</strong>
      </div>
      <div class="actions">
        <button data-open="${calculator.id}">Öffnen</button>
        <button data-duplicate="${calculator.id}">Duplizieren</button>
      </div>
    `;
    card.querySelector("button[data-open]").addEventListener("click", () => loadCalculator(calculator.id));
    card.querySelector("button[data-duplicate]").addEventListener("click", () => duplicateCalculator(calculator.id));
    calculatorGrid.appendChild(card);
  });
};

const loadCalculator = (calculatorId) => {
  const calculator = calculators.find((entry) => entry.id === calculatorId);
  if (!calculator) return;
  state.activeCalculatorId = calculator.id;
  state.selected = [...calculator.elementIds];
  Object.entries(calculator.values).forEach(([key, value]) => {
    const item = elements.find((entry) => entry.id === key);
    if (item) {
      item.value = value;
    }
  });
  calculatorName.value = calculator.name;
  renderCanvas();
  updateSummary();
  showToast("Rechner geladen");
};

const duplicateCalculator = (calculatorId) => {
  const calculator = calculators.find((entry) => entry.id === calculatorId);
  if (!calculator) return;
  const copy = {
    ...clone(calculator),
    id: `calc-${Date.now()}`,
    name: `${calculator.name} Kopie`,
    status: "Draft",
    updatedAt: "Gerade eben",
  };
  calculators.push(copy);
  renderCalculators();
  renderOfferCalculatorOptions();
  showToast("Rechner dupliziert");
};

const createCalculator = () => {
  const newCalc = {
    id: `calc-${Date.now()}`,
    name: "Neuer Rechner",
    status: "Draft",
    updatedAt: "Gerade eben",
    elementIds: [...state.selected],
    values: state.selected.reduce((acc, id) => {
      const item = elements.find((entry) => entry.id === id);
      acc[id] = item?.value ?? 0;
      return acc;
    }, {}),
  };
  calculators.push(newCalc);
  renderCalculators();
  renderOfferCalculatorOptions();
  showToast("Rechner erstellt");
};

const saveCalculator = () => {
  const name = calculatorName.value.trim();
  if (!name) {
    showToast("Bitte Rechner-Name eingeben");
    return;
  }
  const active = calculators.find((entry) => entry.id === state.activeCalculatorId);
  if (!active) {
    createCalculator();
    return;
  }
  active.name = name;
  active.updatedAt = "Gerade eben";
  active.elementIds = [...state.selected];
  active.values = state.selected.reduce((acc, id) => {
    const item = elements.find((entry) => entry.id === id);
    acc[id] = item?.value ?? 0;
    return acc;
  }, {});
  renderCalculators();
  renderOfferCalculatorOptions();
  showToast("Rechner gespeichert");
};

const renderOfferList = () => {
  offerList.innerHTML = "";
  offers.forEach((offer) => {
    const row = document.createElement("div");
    row.className = `admin-item ${offer.id === state.activeOfferId ? "active" : ""}`;
    row.innerHTML = `
      <strong>${offer.title}</strong>
      <span class="muted">${offer.status.toUpperCase()} • ${offer.id}</span>
    `;
    row.addEventListener("click", () => {
      state.activeOfferId = offer.id;
      renderOfferList();
      renderOfferEditor();
    });
    offerList.appendChild(row);
  });
};

const renderOfferCalculatorOptions = () => {
  offerCalculator.innerHTML = calculators
    .map((calculator) => `<option value="${calculator.id}">${calculator.name}</option>`)
    .join("");
};

const renderOfferEditor = () => {
  const offer = offers.find((entry) => entry.id === state.activeOfferId) ?? offers[0];
  state.activeOfferId = offer.id;
  offerTitle.value = offer.title;
  offerStatus.value = offer.status;
  offerCalculator.value = offer.calculatorId;
  offerAdjustment.value = offer.adjustment;
  offerAdjustmentReason.value = offer.adjustmentReason;
  offerNotes.value = offer.notes;
  offerCompany.value = offer.contact.company;
  offerContact.value = offer.contact.contactName;
  offerStreet.value = offer.contact.street;
  offerZip.value = offer.contact.zip;
  offerCity.value = offer.contact.city;
  offerCountry.value = offer.contact.country;
  updateOfferPreview();
};

const updateOfferPreview = () => {
  const offer = offers.find((entry) => entry.id === state.activeOfferId);
  if (!offer) return;
  const calculator = calculators.find((entry) => entry.id === offer.calculatorId);
  const baseTotal = calculator ? computeTotalForCalculator(calculator) : 0;
  offerBaseTotal.textContent = formatMoney(baseTotal);
  offerAdjustmentPreview.textContent = formatMoney(offer.adjustment);
  offerFinalTotal.textContent = formatMoney(baseTotal + offer.adjustment);
};

const saveOfferChanges = () => {
  const offer = offers.find((entry) => entry.id === state.activeOfferId);
  if (!offer) return;
  offer.title = offerTitle.value.trim() || offer.title;
  offer.status = offerStatus.value;
  offer.calculatorId = offerCalculator.value;
  offer.adjustment = Number(offerAdjustment.value || 0);
  offer.adjustmentReason = offerAdjustmentReason.value.trim();
  offer.notes = offerNotes.value.trim();
  offer.contact.company = offerCompany.value.trim();
  offer.contact.contactName = offerContact.value.trim();
  offer.contact.street = offerStreet.value.trim();
  offer.contact.zip = offerZip.value.trim();
  offer.contact.city = offerCity.value.trim();
  offer.contact.country = offerCountry.value.trim();
  renderOfferList();
  updateOfferPreview();
  showToast("Angebot aktualisiert");
};

const addOffer = () => {
  const newOffer = {
    id: `offer-${Date.now()}`,
    title: "Neues Angebot",
    status: "draft",
    calculatorId: calculators[0]?.id ?? "",
    adjustment: 0,
    adjustmentReason: "",
    notes: "",
    contact: {
      company: "",
      contactName: "",
      street: "",
      zip: "",
      city: "",
      country: "",
    },
  };
  offers.push(newOffer);
  state.activeOfferId = newOffer.id;
  renderOfferList();
  renderOfferEditor();
  showToast("Neues Angebot erstellt");
};

const wireAdminInputs = () => {
  [elementName, elementKey, elementUnit, elementType, elementMin, elementMax, elementStep, elementUnitPrice, elementMinimum].forEach(
    (input) => {
      input.addEventListener("input", () => saveElementChanges());
      input.addEventListener("change", () => saveElementChanges());
    }
  );

  tiersEnabled.addEventListener("change", () => {
    const item = elements.find((entry) => entry.id === state.activeElementId);
    if (!item) return;
    item.tiersEnabled = tiersEnabled.checked;
    renderTiers(item);
    updateSummary();
  });

  document.getElementById("addTier").addEventListener("click", () => {
    const item = elements.find((entry) => entry.id === state.activeElementId);
    if (!item) return;
    item.tiers.push({ upTo: Infinity, price: item.unitPrice ?? 0 });
    renderTiers(item);
  });

  document.getElementById("addOption").addEventListener("click", () => {
    const item = elements.find((entry) => entry.id === state.activeElementId);
    if (!item) return;
    item.options.push({ value: "option", label: "Option", price: 0 });
    renderOptions(item);
    renderCanvas();
  });

  document.getElementById("saveElement").addEventListener("click", saveElementChanges);
  document.getElementById("addElement").addEventListener("click", addNewElement);
  document.getElementById("addUnit").addEventListener("click", (event) => {
    event.preventDefault();
    const value = newUnit.value.trim();
    if (!value || units.includes(value)) {
      showToast("Einheit ungültig oder bereits vorhanden");
      return;
    }
    units.push(value);
    newUnit.value = "";
    renderUnitOptions();
    renderUnits();
    showToast("Einheit hinzugefügt");
  });
};

const wireOfferInputs = () => {
  [
    offerTitle,
    offerStatus,
    offerCalculator,
    offerAdjustment,
    offerAdjustmentReason,
    offerNotes,
    offerCompany,
    offerContact,
    offerStreet,
    offerZip,
    offerCity,
    offerCountry,
  ].forEach((input) => {
    input.addEventListener("input", () => saveOfferChanges());
    input.addEventListener("change", () => saveOfferChanges());
  });

  document.getElementById("addOffer").addEventListener("click", addOffer);
  document.getElementById("saveOffer").addEventListener("click", saveOfferChanges);
};

const wireTabs = () => {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      document.getElementById("dashboardSection").classList.toggle("hidden", target !== "dashboard");
      document.getElementById("builderSection").classList.toggle("hidden", target !== "builder");
      document.getElementById("pipelineSection").classList.toggle("hidden", target !== "builder");
      document.getElementById("adminSection").classList.toggle("hidden", target !== "admin");
      document.getElementById("offersSection").classList.toggle("hidden", target !== "offers");
    });
  });
};

const wireActions = () => {
  discountRange.addEventListener("input", (event) => {
    state.discount = Number(event.target.value);
    discountValue.textContent = `${state.discount}%`;
    updateSummary();
    renderCalculators();
    updateOfferPreview();
  });

  minimumCharge.addEventListener("input", (event) => {
    state.minimumCharge = Number(event.target.value || 0);
    updateSummary();
    renderCalculators();
    updateOfferPreview();
  });

  document.getElementById("resetBuilder").addEventListener("click", resetBuilder);
  document.getElementById("saveDraft").addEventListener("click", () => showToast("Entwurf gespeichert"));
  document.getElementById("createOffer").addEventListener("click", () => showToast("Angebot erstellt"));
  document.getElementById("saveCalculator").addEventListener("click", saveCalculator);
  document.getElementById("createCalculator").addEventListener("click", createCalculator);
};

const applyCalculatorSelection = () => {
  const active = calculators.find((entry) => entry.id === state.activeCalculatorId) ?? calculators[0];
  if (!active) return;
  state.activeCalculatorId = active.id;
  calculatorName.value = active.name;
  state.selected = [...active.elementIds];
  Object.entries(active.values).forEach(([key, value]) => {
    const item = elements.find((entry) => entry.id === key);
    if (item) item.value = value;
  });
};

renderUnitOptions();
renderLibrary();
applyCalculatorSelection();
renderCanvas();
renderAdminList();
renderAdminEditor();
renderUnits();
renderCalculators();
renderOfferCalculatorOptions();
renderOfferList();
renderOfferEditor();
updateSummary();
wireActions();
wireTabs();
wireAdminInputs();
wireOfferInputs();
