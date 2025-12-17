const menuItems = document.querySelectorAll(".avatar-menu-item");
const avatarSelectors = document.querySelectorAll(".avatar-selector");
const avatarSelectorItems = document.querySelectorAll(".avatar-selector-item");

function activateOne(list, activeIndex) {
  for (const [i, el] of list.entries()) {
    el.classList.toggle("active", i === activeIndex);
  }
}

for (const [index, item] of menuItems.entries()) {
  item.addEventListener("click", () => {
    activateOne(menuItems, index);
    if (avatarSelectors[index]) activateOne(avatarSelectors, index);
  });
}

for (const [index, item] of avatarSelectorItems.entries()) {
  item.addEventListener("click", () => {
    activateOne(avatarSelectorItems, index);
  });
}
