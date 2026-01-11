import { Eta } from "eta";
import path from "node:path";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import fse from "fs-extra";

// Initialize Eta
const eta = new Eta({ views: path.join(import.meta.dirname!, "templates") });

// Google Maps API Key from environment
const googleMapsApiKey = process.env["PUBLIC_GOOGLE_MAPS_API_KEY"] || "";

// Navigation links
const navigation = [
  { text: "Therapie", href: "/therapie.html" },
  { text: "Diagnostik", href: "/diagnostik.html" },
  { text: "Praxis", href: "/praxis.html" },
  { text: "Therapeuten", href: "/therapeuten.html" },
  { text: "Kosten", href: "/kosten.html" },
  { text: "Kontakt & Anfahrt", href: "/kontakt.html" },
  { text: "Karriere", href: "/karriere.html" },
];

// Therapists data (metadata only)
const therapeuten = [
  {
    slug: "koennecke",
    displayName: "Dr. Sonja Könnecke",
    subtitle: "Kinder- und Jugendlichenpsychotherapeutin (VT)",
    photo: "/images/therapeuten/koennecke_klein.jpg",
    photoAlt: "Foto von Dr. Sonja Könnecke",
    email: "praxis@kjp-meerbusch.de",
    phone: "0151 / 74369929",
    hasBio: true,
  },
  {
    slug: "stepputt",
    displayName: "Katja Stepputt",
    subtitle: "Kinder- und Jugendlichenpsychotherapeutin (VT)",
    photo: "/images/therapeuten/stepputt.jpeg",
    photoAlt: "Foto von Katja Stepputt",
    email: "stepputt@kjp-meerbusch.de",
    phone: "0151 / 74250914",
    hasBio: false,
  },
  {
    slug: "jax",
    displayName: "Sarah Jax",
    subtitle: "Kinder- und Jugendlichenpsychotherapeutin (VT)",
    photo: "/images/therapeuten/jax.jpg",
    photoAlt: "Platzhalter",
    email: "jax@kjp-meerbusch.de",
    phone: "0160 / 6064408",
    hasBio: false,
  },
  {
    slug: "brueggemann",
    displayName: "Madeleine Brüggemann",
    subtitle: "Kinder- und Jugendlichenpsychotherapeutin (VT)",
    photo: "/images/therapeuten/brueggemann.jpg",
    photoAlt: "Foto von Madeleine Brüggemann",
    email: "brueggemann@kjp-meerbusch.de",
    phone: "0151 / 74250914",
    hasBio: false,
  },
  {
    slug: "meier",
    displayName: "Dorian Meier",
    subtitle: "Kinder- und Jugendlichenpsychotherapeut (VT)",
    photo: "/images/therapeuten/meier.jpg",
    photoAlt: "Foto von Dorian Meier",
    email: "meier@kjp-meerbusch.de",
    phone: "0151 / 74251054",
    hasBio: false,
  },
  {
    slug: "pletsch",
    displayName: "Vivien Pletsch",
    subtitle: "Kinder- und Jugendlichenpsychotherapeutin (VT)",
    photo: "/images/therapeuten/pletsch.jpeg",
    photoAlt: "Foto von Vivien Pletsch",
    email: "pletsch@kjp-meerbusch.de",
    phone: "0160 / 6081023",
    hasBio: false,
  },
  {
    slug: "maiwald",
    displayName: "Saskia Maiwald",
    subtitle: "Kinder- und Jugendlichenpsychotherapeutin (VT)",
    photo: "/images/therapeuten/foto_therapeut_leer.jpg",
    photoAlt: "Platzhalter",
    email: "maiwald@kjp-meerbusch.de",
    phone: "0160 / 4142522",
    hasBio: false,
  },
  {
    slug: "sandfuchs",
    displayName: "Sabrina Sandfuchs",
    subtitle: "Kinder- und Jugendlichenpsychotherapeutin (VT)",
    photo: "/images/therapeuten/foto_therapeut_leer.jpg",
    photoAlt: "Platzhalter",
    email: "sandfuchs@kjp-meerbusch.de",
    phone: "0151 / 58331002",
    hasBio: false,
  },
  {
    slug: "costantini",
    displayName: "Selena Costantini",
    subtitle: "Kinder- und Jugendlichenpsychotherapeutin (i. A.)",
    photo: "/images/therapeuten/foto_therapeut_leer.jpg",
    photoAlt: "Platzhalter",
    hideFromContact: true,
    email: "costantini@kjp-meerbusch.de",
    phone: "",
    hasBio: false,
  },
];

// Gallery images
const galleryImages = [
  { src: "/images/gallery/gallery1.jpg", alt: "Bild aus der Praxis" },
  { src: "/images/gallery/gallery2.jpg", alt: "Bild aus der Praxis" },
  { src: "/images/gallery/gallery3.jpg", alt: "Bild aus der Praxis" },
  { src: "/images/gallery/gallery4.jpg", alt: "Bild aus der Praxis" },
  { src: "/images/gallery/gallery5.jpg", alt: "Bild aus der Praxis" },
  { src: "/images/gallery/gallery6.jpg", alt: "Bild aus der Praxis" },
  { src: "/images/gallery/gallery7.jpg", alt: "Bild aus der Praxis" },
  { src: "/images/gallery/gallery8.jpg", alt: "Bild aus der Praxis" },
];

// Create output directories
if (!existsSync("./public")) {
  mkdirSync("./public");
}
if (!existsSync("./public/therapeuten")) {
  mkdirSync("./public/therapeuten");
}

// Render data-driven pages
console.log("Building index.html...");
writeFileSync(
  "./public/index.html",
  eta.render("./index.eta", {
    navigation,
    galleryImages,
    siteTitle: "KJP Meerbusch",
  })
);

console.log("Building therapeuten.html...");
writeFileSync(
  "./public/therapeuten.html",
  eta.render("./therapeuten.eta", {
    navigation,
    therapeuten,
    siteTitle: "KJP Meerbusch | Therapeuten",
  })
);

console.log("Building kontakt.html...");
writeFileSync(
  "./public/kontakt.html",
  eta.render("./kontakt.eta", {
    navigation,
    therapeuten,
    googleMapsApiKey,
    siteTitle: "KJP Meerbusch | Kontakt",
  })
);

console.log("Building praxis.html...");
writeFileSync(
  "./public/praxis.html",
  eta.render("./praxis.eta", {
    navigation,
    galleryImages,
    siteTitle: "KJP Meerbusch | Praxis",
  })
);

// Render self-contained content pages
const contentPages = [
  "therapie",
  "diagnostik",
  "kosten",
  "karriere",
  "impressum",
];

for (const page of contentPages) {
  console.log(`Building ${page}.html...`);
  writeFileSync(
    `./public/${page}.html`,
    eta.render(`./pages/${page}.eta`, { navigation })
  );
}

// Render individual therapist bio pages
for (const t of therapeuten.filter((t) => t.hasBio)) {
  console.log(`Building therapeuten/${t.slug}.html...`);
  writeFileSync(
    `./public/therapeuten/${t.slug}.html`,
    eta.render(`./therapeuten/${t.slug}.eta`, {
      navigation,
      siteTitle: `${t.displayName} | KJP Meerbusch`,
    })
  );
}

// Copy static assets
console.log("Copying static assets...");
fse.copySync("static", "public", { overwrite: true });

console.log("Copying images...");
fse.copySync("images", "public/images", { overwrite: true });

// Copy vendor assets from node_modules
console.log("Copying vendor assets...");
if (!existsSync("./public/vendor")) {
  mkdirSync("./public/vendor");
}
fse.copySync(
  "node_modules/swiper/swiper-bundle.min.css",
  "public/vendor/swiper.min.css"
);
fse.copySync(
  "node_modules/swiper/swiper-bundle.min.js",
  "public/vendor/swiper.min.js"
);

console.log("Build complete!");
