const investBtn = document.getElementById("invest-btn");

investBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const data = await fetch("/api");
    const res = await data.json();
    console.log(res);
  } catch (err) {
    console.log(err);
  }
});
