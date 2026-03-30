const categoryLabels = {
  embarazo: "Embarazo",
  bebe: "Bebé",
  "1er-anito": "1er Añito",
  "15-anos": "15 Años",
  pareja: "Pareja"
};

const rawCatalog = {
  embarazo: [
    "_DSC0420-Mejorado-NR.jpg",
    "_DSC0548.jpg",
    "_DSC0599B.jpg",
    "_DSC2097.jpg",
    "_DSC2121.jpg",
    "_DSC2357.jpg",
    "_DSC4242.jpg",
    "_DSC4303.jpg",
    "_DSC4327.jpg",
    "_DSC5007-Mejorado-NR.jpg",
    "_DSC6730.jpg",
    "_DSC7446.jpg",
    "_DSC7487B.jpg",
    "_DSC7709.jpg",
    "_DSC9150.jpg"
  ],
  bebe: [
    "_DSC0034.jpg",
    "_DSC0627.jpg",
    "_DSC0978.jpg",
    "_DSC0987B.jpg",
    "_DSC4647B.jpg",
    "_DSC4752.jpg",
    "_DSC4854.jpg",
    "_DSC5458.jpg"
  ],
  "1er-anito": [
    "_DSC0081.jpg",
    "_DSC3185.jpg",
    "_DSC5231.jpg",
    "_DSC6387.jpg",
    "_DSC6454.jpg",
    "_DSC6626.jpg",
    "_DSC6689.jpg",
    "_DSC8942.jpg",
    "_DSC8948.jpg",
    "_DSC8955B.jpg"
  ],
  "15-anos": [
    "_DSC1443.jpg",
    "_DSC1508.jpg",
    "_DSC1519.jpg",
    "_DSC1548.jpg",
    "_DSC2334.jpg",
    "_DSC2401.jpg",
    "_DSC2543.jpg",
    "_DSC3230.jpg",
    "_DSC4632C.jpg",
    "_DSC4871.jpg",
    "_DSC4994.jpg",
    "_DSC5047.jpg",
    "_DSC7055.jpg",
    "_DSC7268.jpg",
    "_DSC7488.jpg",
    "_DSC7501.jpg",
    "_DSC7842.jpg",
    "_DSC7870.jpg",
    "_DSC7914.jpg",
    "_DSC8574B.jpg"
  ],
  pareja: [
    "_DSC2601.jpg",
    "_DSC2682.jpg",
    "_DSC5978B.jpg",
    "_DSC8806.jpg"
  ]
};

const categories = ["embarazo", "bebe", "1er-anito", "15-anos", "pareja"];

const photoCatalog = categories.flatMap((category) => {
  const label = categoryLabels[category] || category;

  return rawCatalog[category].map((fileName, index) => ({
    category,
    title: `${label} ${String(index + 1).padStart(2, "0")}`,
    src: `images/${category}/${fileName}`,
    thumb: `thumbnails/${category}/${fileName}`,
    alt: `Sesión de ${label.toLowerCase()} - Foto ${index + 1}`
  }));
});
