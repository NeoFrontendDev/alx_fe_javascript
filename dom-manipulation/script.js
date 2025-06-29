let quotes = [];
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Replace with your real endpoint

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [
    { text: "You miss 100% of the shots you don’t take.", category: "Motivation" },
    { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
    { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Tech" }
  ];
  saveQuotes();
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  const selected = document.getElementById("categoryFilter").value;
  const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (!filtered.length) {
    quoteDisplay.innerHTML = "<p>No quotes for this category.</p>";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `<p>"${random.text}"</p><p><em>Category: ${random.category}</em></p>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  alert("Quote added!");

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: category,
      body: text,
      userId: 1
    })
  })
  .then(res => res.json())
  .then(data => console.log("Posted to server:", data))
  .catch(err => console.error("POST error:", err));
}

function createAddQuoteForm() {
  const container = document.getElementById("formContainer");
  container.innerHTML = "";

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCat = document.createElement("input");
  inputCat.id = "newQuoteCategory";
  inputCat.placeholder = "Enter quote category";

  const button = document.createElement("button");
  button.textContent = "Add Quote";
  button.addEventListener("click", addQuote);

  container.append(inputText, inputCat, button);
}

function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];

  dropdown.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
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
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
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
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported!");
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Import error: " + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

function mergeQuotes(local, server) {
  const map = new Map();
  [...local, ...server].forEach(q => {
    const key = `${q.text.trim()}|${q.category.trim()}`;
    map.set(key, q);
  });
  return Array.from(map.values());
}

function notifySync(message) {
  const div = document.createElement("div");
  div.textContent = message;
  Object.assign(div.style, {
    position: "fixed", bottom: "20px", right: "20px",
    backgroundColor: "#333", color: "#fff", padding: "10px 20px",
    borderRadius: "4px", zIndex: 1000
  });
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();
    return data.map(item => ({
      text: item.body || item.text || "Untitled",
      category: item.title || item.category || "General"
    }));
  } catch (err) {
    console.error("Fetch failed:", err);
    return [];
  }
}

async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  quotes = mergeQuotes(quotes, serverQuotes);
  saveQuotes();
  populateCategories();
  notifySync("Quotes synced with server.");
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

  function syncQuotes() {
  fetchQuotesFromServer()
    .then(serverQuotes => {
      quotes = mergeQuotes(quotes, serverQuotes);
      saveQuotes();
      populateCategories();
      notifySync("Manual sync completed. Quotes updated.");
    })
    .catch(error => {
      console.error("Manual sync failed:", error);
      notifySync("Manual sync failed.");
    });
}

  syncWithServer();
  setInterval(syncWithServer, 30000);
});
