const categoryCardsContainer = document.getElementById("category-cards");
const galleryContainer = document.getElementById("gallery");
const galleryTitle = document.getElementById("gallery-title");
const galleryCount = document.getElementById("gallery-count");
const galleryOverlay = document.getElementById("gallery-overlay");
const galleryClose = document.getElementById("gallery-close");
const loadMoreBtn = document.getElementById("load-more");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const currentYear = document.getElementById("current-year");
const waWidget = document.getElementById("wa-widget");
const waMenu = document.getElementById("wa-menu");
const waToggle = document.getElementById("wa-toggle");

const WHATSAPP_NUMBER = "5354831128";
const WHATSAPP_MESSAGES = [
  "Quiero saber las ofertas que tienen.",
  "Quiero agendar una reservación.",
  "Quiero más detalles sobre las sesiones."
];
const WHATSAPP_GREETING = "Hola CandySoft,";

const prefersDataSaving = Boolean(navigator.connection && navigator.connection.saveData);
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
const INITIAL_BATCH_SIZE = prefersDataSaving ? 4 : 8;
const BATCH_SIZE = prefersDataSaving ? 4 : 8;
const IMAGE_OBSERVER_MARGIN = "180px 0px";
const GALLERY_OPEN_MS = 300;
const GALLERY_CLOSE_MS = 200;

let selectedCategory = categories[0] || "";
let visibleCount = INITIAL_BATCH_SIZE;
let imageObserver = null;
let galleryCloseTimer = null;

function getCategoryLabel(category) {
  if (categoryLabels[category]) {
    return categoryLabels[category];
  }

  return category.replace(/-/g, " ");
}

function getPhotosByCategory(category) {
  return photoCatalog.filter((photo) => photo.category === category);
}

function animateCategoryOpen(card) {
  card.classList.remove("is-opening");
  void card.offsetWidth;
  card.classList.add("is-opening");
}

function updateActiveCategoryCard() {
  const cards = categoryCardsContainer.querySelectorAll(".category-card");

  cards.forEach((card) => {
    const isActive = card.dataset.category === selectedCategory;
    card.classList.toggle("active", isActive);
    card.setAttribute("aria-pressed", String(isActive));
  });
}

function isGalleryOpen() {
  return !galleryOverlay.hidden;
}

function cleanupGalleryPanel() {
  if (imageObserver) {
    imageObserver.disconnect();
  }

  galleryContainer.innerHTML = "";
  galleryCount.textContent = "";
  loadMoreBtn.hidden = true;
  galleryOverlay.hidden = true;
  galleryOverlay.classList.remove("is-opening", "is-closing");
}

function openGalleryPanel() {
  if (galleryCloseTimer) {
    window.clearTimeout(galleryCloseTimer);
    galleryCloseTimer = null;
  }

  if (isGalleryOpen()) {
    galleryOverlay.classList.remove("is-closing");
    return;
  }

  galleryOverlay.hidden = false;
  galleryOverlay.classList.remove("is-closing");
  void galleryOverlay.offsetWidth;
  galleryOverlay.classList.add("is-opening");

  window.setTimeout(() => {
    galleryOverlay.classList.remove("is-opening");
  }, GALLERY_OPEN_MS);
}

function closeGalleryPanel() {
  if (!isGalleryOpen()) {
    return;
  }

  if (galleryCloseTimer) {
    window.clearTimeout(galleryCloseTimer);
  }

  galleryOverlay.classList.remove("is-opening");
  galleryOverlay.classList.add("is-closing");

  galleryCloseTimer = window.setTimeout(() => {
    cleanupGalleryPanel();
    galleryCloseTimer = null;
  }, GALLERY_CLOSE_MS);
}

function setupImageObserver() {
  if (!("IntersectionObserver" in window)) {
    imageObserver = null;
    return;
  }

  imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        hydrateImage(entry.target);
        imageObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: IMAGE_OBSERVER_MARGIN,
      threshold: 0.01
    }
  );
}

function hydrateImage(image) {
  if (!image || image.dataset.state === "loading" || image.dataset.state === "loaded") {
    return;
  }

  const source = image.dataset.src;
  if (!source) {
    return;
  }

  image.dataset.state = "loading";
  image.src = source;
  image.removeAttribute("data-src");
}

function observeGalleryImage(image) {
  if (imageObserver) {
    imageObserver.observe(image);
    return;
  }

  hydrateImage(image);
}

function onGalleryImageLoaded(event) {
  const image = event.currentTarget;
  image.dataset.state = "loaded";
  const card = image.closest(".photo-card");
  card?.classList.add("is-loaded");
}

function onGalleryImageError(event) {
  const image = event.currentTarget;
  const fallbackSrc = image.dataset.fallbackSrc;
  const fallbackTried = image.dataset.fallbackTried === "true";

  if (fallbackSrc && !fallbackTried) {
    image.dataset.fallbackTried = "true";
    image.dataset.state = "loading";
    image.src = fallbackSrc;
    return;
  }

  image.dataset.state = "error";
  const card = image.closest(".photo-card");
  card?.classList.add("is-loaded");
}

function setTapPoint(button, event) {
  if (!event || typeof event.clientX !== "number") {
    return;
  }

  const rect = button.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  const clampedX = Math.max(0, Math.min(100, x));
  const clampedY = Math.max(0, Math.min(100, y));

  button.style.setProperty("--tap-x", `${clampedX}%`);
  button.style.setProperty("--tap-y", `${clampedY}%`);
}

function clearTapState(button) {
  window.setTimeout(() => {
    button.classList.remove("is-pressed");
  }, 90);
}

function scrollToGalleryStart() {
  if (galleryOverlay.hidden) {
    return;
  }

  window.requestAnimationFrame(() => {
    galleryOverlay.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

function renderCategoryCards() {
  categoryCardsContainer.innerHTML = "";

  categories.forEach((category) => {
    const photos = getPhotosByCategory(category);
    const coverImage = photos[0]?.thumb || photos[0]?.src || "";
    const categoryLabel = getCategoryLabel(category);

    const card = document.createElement("button");
    card.type = "button";
    card.className = "category-card";
    card.dataset.category = category;
    if (coverImage) {
      card.style.setProperty("--card-image", `url("${coverImage}")`);
    } else {
      card.style.setProperty("--card-image", "linear-gradient(135deg, #304a76, #172540)");
    }
    card.setAttribute("aria-label", `Abrir categoría ${categoryLabel}`);

    const info = document.createElement("span");
    info.className = "category-info";

    const name = document.createElement("span");
    name.className = "category-name";
    name.textContent = categoryLabel;
    info.appendChild(name);
    card.appendChild(info);

    card.addEventListener("click", () => {
      closeWhatsAppMenu();
      selectedCategory = category;
      visibleCount = INITIAL_BATCH_SIZE;
      updateActiveCategoryCard();
      openGalleryPanel();
      renderGallery();
      scrollToGalleryStart();
      animateCategoryOpen(card);
    });

    categoryCardsContainer.appendChild(card);
  });

  updateActiveCategoryCard();
}

function openLightbox(src, alt) {
  lightboxImage.src = src;
  lightboxImage.alt = alt;

  if (typeof lightbox.showModal === "function") {
    lightbox.showModal();
  } else {
    lightbox.setAttribute("open", "open");
  }
}

function closeLightbox() {
  if (lightbox.open && typeof lightbox.close === "function") {
    lightbox.close();
  } else {
    lightbox.removeAttribute("open");
  }

  lightboxImage.src = "";
  lightboxImage.alt = "";
}

function renderGallery() {
  const photos = getPhotosByCategory(selectedCategory);
  const currentCategoryLabel = getCategoryLabel(selectedCategory);
  const visiblePhotos = photos.slice(0, visibleCount);

  if (imageObserver) {
    imageObserver.disconnect();
  }

  galleryTitle.textContent = `Sesión ${currentCategoryLabel}`;
  galleryCount.textContent = `${visiblePhotos.length} de ${photos.length} fotos`;
  galleryContainer.innerHTML = "";

  if (!photos.length) {
    const emptyText = document.createElement("p");
    emptyText.className = "empty-gallery";
    emptyText.textContent = "No hay fotos disponibles para esta categoría.";
    galleryContainer.appendChild(emptyText);
    loadMoreBtn.hidden = true;
    return;
  }

  visiblePhotos.forEach((photo, index) => {
    const figure = document.createElement("figure");
    figure.className = "photo-card";
    figure.style.setProperty("--delay", `${Math.min(index * 45, 360)}ms`);

    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Ver foto en pantalla completa: ${photo.title}`);
    button.addEventListener("pointerdown", (event) => {
      setTapPoint(button, event);
      button.classList.add("is-pressed");
    });
    button.addEventListener("pointerup", () => clearTapState(button));
    button.addEventListener("pointerleave", () => clearTapState(button));
    button.addEventListener("pointercancel", () => clearTapState(button));
    button.addEventListener("click", () => {
      closeWhatsAppMenu();

      if (isCoarsePointer) {
        button.classList.add("is-pressed");
        window.setTimeout(() => {
          button.classList.remove("is-pressed");
          openLightbox(photo.src, photo.alt);
        }, 85);
        return;
      }

      openLightbox(photo.src, photo.alt);
    });

    const media = document.createElement("span");
    media.className = "photo-media";

    const image = document.createElement("img");
    image.className = "photo-thumb";
    image.alt = photo.alt;
    image.loading = "lazy";
    image.decoding = "async";
    image.fetchPriority = index < 2 ? "high" : "low";
    image.dataset.src = photo.thumb || photo.src;
    if (photo.thumb && photo.src && photo.thumb !== photo.src) {
      image.dataset.fallbackSrc = photo.src;
    }

    image.addEventListener("load", onGalleryImageLoaded, { once: true });
    image.addEventListener("error", onGalleryImageError);

    const skeleton = document.createElement("span");
    skeleton.className = "photo-skeleton";
    skeleton.setAttribute("aria-hidden", "true");

    media.appendChild(image);
    media.appendChild(skeleton);

    button.appendChild(media);
    figure.appendChild(button);
    galleryContainer.appendChild(figure);

    observeGalleryImage(image);
  });

  loadMoreBtn.hidden = visibleCount >= photos.length;
}

function closeWhatsAppMenu() {
  waWidget.classList.remove("open");
  waToggle.setAttribute("aria-expanded", "false");
}

function buildWhatsAppMenu() {
  waMenu.innerHTML = "";

  WHATSAPP_MESSAGES.forEach((message) => {
    const option = document.createElement("a");
    option.className = "wa-option";
    option.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`${WHATSAPP_GREETING}\n${message}`)}`;
    option.target = "_blank";
    option.rel = "noopener noreferrer";
    option.textContent = message;
    option.addEventListener("click", closeWhatsAppMenu);
    waMenu.appendChild(option);
  });
}

loadMoreBtn.addEventListener("click", () => {
  closeWhatsAppMenu();
  visibleCount += BATCH_SIZE;
  renderGallery();
});

galleryClose.addEventListener("click", closeGalleryPanel);

waToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  waWidget.classList.toggle("open");
  waToggle.setAttribute("aria-expanded", String(waWidget.classList.contains("open")));
});

waToggle.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
});

document.addEventListener("pointerdown", (event) => {
  if (!waWidget.contains(event.target)) {
    closeWhatsAppMenu();
  }
});

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (lightbox.open) {
      closeLightbox();
    } else if (isGalleryOpen()) {
      closeGalleryPanel();
    }

    closeWhatsAppMenu();
  }
});

window.addEventListener("load", () => {
  window.setTimeout(() => {
    document.body.classList.remove("is-loading");
  }, 520);
});

setupImageObserver();
buildWhatsAppMenu();
renderCategoryCards();
loadMoreBtn.hidden = true;

currentYear.textContent = String(new Date().getFullYear());
