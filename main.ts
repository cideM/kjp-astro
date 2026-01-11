import { Eta } from "eta";
import path from "node:path";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import fse from "fs-extra";
import * as contentful from "contentful";
import { type EntryFieldTypes } from "contentful";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";

interface Therapeut {
  fields: {
    name: EntryFieldTypes.Symbol;
    untertitel: EntryFieldTypes.Symbol;
    email: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    telefon: EntryFieldTypes.Symbol;
    foto: EntryFieldTypes.AssetLink;
    bio: EntryFieldTypes.RichText;
  };
  contentTypeId: "therapeut";
}

const eta = new Eta({ views: path.join(import.meta.dirname!, "templates") });

const client = contentful.createClient({
  space: process.env["CONTENTFUL_SPACE_ID"]!,
  accessToken: process.env["CONTENTFUL_ACCESS_TOKEN"]!,
  host: process.env["CONTENTFUL_HOST"] || "cdn.contentful.com",
});

const googleMapsApiKey = process.env["PUBLIC_GOOGLE_MAPS_API_KEY"] || "";

const navigation = [
  { text: "Therapie", href: "/therapie.html" },
  { text: "Diagnostik", href: "/diagnostik.html" },
  { text: "Praxis", href: "/praxis.html" },
  { text: "Therapeuten", href: "/therapeuten.html" },
  { text: "Kosten", href: "/kosten.html" },
  { text: "Kontakt & Anfahrt", href: "/kontakt.html" },
  { text: "Karriere", href: "/karriere.html" },
];

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

async function build() {
  console.log("Fetching therapeuten from Contentful...");
  const getTherapeutenResponse = await client.getEntries<Therapeut, "de">({
    content_type: "therapeut",
  });

  const therapeuten = getTherapeutenResponse.items.map((item) => {
    const foto = item.fields.foto;
    const fotoUrl =
      foto && "fields" in foto && foto.fields.file?.url
        ? `https:${foto.fields.file.url}`
        : "/images/therapeuten/foto_therapeut_leer.jpg";
    const fotoAlt =
      foto && "fields" in foto && foto.fields.description
        ? foto.fields.description
        : `Foto von ${item.fields.name}`;

    return {
      slug: item.fields.slug || "",
      displayName: item.fields.name,
      subtitle: item.fields.untertitel || "",
      photo: fotoUrl,
      photoAlt: fotoAlt,
      email: item.fields.email || "",
      phone: item.fields.telefon || "",
      hasBio: !!item.fields.bio,
      bioHtml: item.fields.bio ? documentToHtmlString(item.fields.bio) : "",
    };
  });

  if (!existsSync("./public")) {
    mkdirSync("./public");
  }
  if (!existsSync("./public/therapeuten")) {
    mkdirSync("./public/therapeuten");
  }

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

  for (const t of therapeuten.filter((t) => t.hasBio)) {
    console.log(`Building therapeuten/${t.slug}.html...`);
    writeFileSync(
      `./public/therapeuten/${t.slug}.html`,
      eta.render("./therapeuten/bio.eta", {
        navigation,
        siteTitle: `${t.displayName} | KJP Meerbusch`,
        displayName: t.displayName,
        bioHtml: t.bioHtml,
      })
    );
  }

  console.log("Copying static assets...");
  fse.copySync("static", "public", { overwrite: true });

  console.log("Copying images...");
  fse.copySync("images", "public/images", { overwrite: true });

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
}

build();
