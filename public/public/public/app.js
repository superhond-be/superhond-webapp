console.log("Superhond Coach Portaal is geladen!");

// Voorbeeldfunctie die later wordt vervangen door echte data
document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main");

  const info = document.createElement("p");
  info.textContent = "Dit is een testbericht vanuit app.js — de pagina reageert!";
  info.style.color = "darkgreen";

  main.appendChild(info);
});
