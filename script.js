const filtersContainer = document.getElementById("category-filters");
const galleryContainer = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");

const categoryLabels = {
  todas: "Todas",
  embarazo: "Embarazo",
  bebe: "Bebé",
  "1er-anito": "1er añito",
  "15-anos": "15 años"
};

let selectedCategory = "embarazo";

function formatCategory(category) {
  return categoryLabels[category] || category;
}

function createFilters() {
  const allCategories = ["todas", ...categories];

  allCategories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "filter-btn";
    button.type = "button";
    button.textContent = formatCategory(category);
    button.dataset.category = category;

    if (category === selectedCategory) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      selectedCategory = category;
      updateActiveFilter();
      renderGallery();
    });

    filtersContainer.appendChild(button);
  });
}

function updateActiveFilter() {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === selectedCategory);
  });
}

function getFilteredPhotos() {
  if (selectedCategory === "todas") {
    return photoCatalog;
  }

  return photoCatalog.filter((photo) => photo.category === selectedCategory);
}

function openLightbox(src, alt) {
  lightboxImage.src = src;
  lightboxImage.alt = alt;

  if (typeof lightbox.showModal === "function") {
    lightbox.showModal();
  }
}

function closeLightbox() {
  lightbox.close();
  lightboxImage.src = "";
  lightboxImage.alt = "";
}

function renderGallery() {
  const photos = getFilteredPhotos();
  galleryContainer.innerHTML = "";

  if (!photos.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No hay fotografías disponibles para esta categoría por el momento.";
    galleryContainer.appendChild(emptyState);
    return;
  }

  photos.forEach((photo) => {
    const figure = document.createElement("figure");
    figure.className = "photo-card";

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.setAttribute("aria-label", `Ver en pantalla completa: ${photo.title}`);
    openButton.addEventListener("click", () => openLightbox(photo.src, photo.alt));

    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.alt;
    image.loading = "lazy";

    const caption = document.createElement("figcaption");

    const title = document.createElement("span");
    title.className = "photo-title";
    title.textContent = photo.title;

    const category = document.createElement("span");
    category.className = "photo-category";
    category.textContent = formatCategory(photo.category);

    caption.appendChild(title);
    caption.appendChild(category);

    openButton.appendChild(image);
    figure.appendChild(openButton);
    figure.appendChild(caption);
    galleryContainer.appendChild(figure);
  });
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.open) {
    closeLightbox();
  }
});

createFilters();
renderGallery();
