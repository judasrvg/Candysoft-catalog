const filtersContainer = document.getElementById("category-filters");
const galleryContainer = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");

let selectedCategory = "embarazo";

function createFilters() {
  const allCategories = ["todas", ...categories];

  allCategories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "filter-btn";
    button.type = "button";
    button.textContent = category;
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
    galleryContainer.innerHTML = "<p>No hay fotos para esta categoría.</p>";
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
    caption.textContent = `${photo.title} · ${photo.category}`;

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
