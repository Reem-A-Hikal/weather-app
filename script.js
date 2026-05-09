const unitsToggle = document.querySelector(".units-toggle");
const unitsMenu = document.querySelector(".units-menu");
const daysToggle = document.querySelector(".days-toggle");
const daysMenu = document.querySelector(".days-menu");

unitsToggle.addEventListener("click", (e) => {
  unitsMenu.toggleAttribute('hidden');
})

daysToggle.addEventListener("click", (e) => {
  daysMenu.toggleAttribute('hidden');
})