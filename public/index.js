const priceDisplay = document.getElementById("price-display");
const connectionStatus = document.getElementById("connection-status");
const investBtn = document.getElementById("invest-btn");
const dialog = document.querySelector(".outputs");
const summary = document.getElementById("investment-summary");
const closeBtn = dialog.querySelector("button");

let currentPrice = 0;

const eventSource = new EventSource("/events");

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  currentPrice = data.price;

  priceDisplay.textContent = currentPrice;
  connectionStatus.textContent = "Live Prices 🟢";
  connectionStatus.style.color = "green";
};

eventSource.onerror = () => {
  connectionStatus.textContent = "Disconnected 🔴";
  connectionStatus.style.color = "red";
};

investBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const amountInput = document.getElementById("investment-amount");
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) return;

  if (connectionStatus.textContent.includes("Disconnected")) {
    summary.textContent = "Cannot process purchase while offline.";
    dialog.showModal();
    return;
  }

  const response = await fetch("/api/buy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  const data = await response.json();

  summary.textContent = `You just bought ${data.ounces} oz of gold for £${amount.toFixed(2)} at £${currentPrice} per oz.
     Documentation will be sent shortly.`;

  dialog.showModal();

  amountInput.value = "";
});

closeBtn.addEventListener("click", () => {
  dialog.close();
});
