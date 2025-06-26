const quotes = [
  { text: "You miss 100% of the shots you don’t take.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Tech" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuote");

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${text}"</p><p><em>Category: ${category}</em></p>`;
}

newQuoteBtn.addEventListener("click", showRandomQuote);

function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (quoteText && quoteCategory) {
    quotes.push({ text: quoteText, category: quoteCategory });
    alert("Quote added!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please fill in both fields.");
  }
}

addQuoteBtn.addEventListener("click", addQuote);
