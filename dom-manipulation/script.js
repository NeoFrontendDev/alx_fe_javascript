let quotes = [];

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "You miss 100% of the shots you don’t take.", category: "Motivation" },
      { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
      { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Tech" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  const selected = document.getElementById("categoryFilter").value;
  const candidates = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (candidates.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }

  const random = candidates[Math.floor(Math.random() * candidates.length)];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>"${random.text}"</p><p><em>Category: ${random.category}</em></p>`;

  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    alert("Quote added!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please fill in both fields.");
  }
}

function createAddQuoteForm() {
  const container = document.getElementById("formContainer");
  container.innerHTML = "";

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";
  inputText.style.marginRight = "10px";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";
  inputCategory.style.marginRight = "10px";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  container.appendChild(inputText);
  container.appendChild(inputCategory);
  container.appendChild(addBtn);
}

function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];

  dropdown.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    dropdown.appendChild(opt);
  });

  const saved = localStorage.getItem("selectedCategory");
  if (saved && dropdown.querySelector(`option[value="${saved}"]`)) {
    dropdown.value = saved;
    filterQuotes();
  }
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

function exportQuotes() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const incoming = JSON.parse(e.target.result);
      if (Array.isArray(incoming)) {
        quotes.push(...incoming);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON structure.");
      }
    } catch (err) {
      alert("Import error: " + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const q = JSON.parse(last);
    document.getElementById("quoteDisplay").innerHTML =
      `<p>"${q.text}"</p><p><em>Category: ${q.category}</em></p>`;
  }
});
