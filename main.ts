import { Eta } from "eta";
import path from "node:path";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import fse from "fs-extra";
import * as contentful from "contentful";
import { type EntryFieldTypes } from "contentful";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { BLOCKS } from "@contentful/rich-text-types";

interface Therapeut {
  fields: {
    name: EntryFieldTypes.Symbol;
    untertitel: EntryFieldTypes.Symbol;
    email: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    telefon: EntryFieldTypes.Symbol;
    foto: EntryFieldTypes.AssetLink;
    bio: EntryFieldTypes.RichText;
    aufKontaktSeiteAusblenden: boolean;
  };
  contentTypeId: "therapeut";
}

interface Seite {
  fields: {
    titel: EntryFieldTypes.Symbol;
    navigationsName: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    inhalt: EntryFieldTypes.RichText;
  };
  contentTypeId: "seite";
}

interface PraxisManagerin {
  fields: {
    name: EntryFieldTypes.Symbol;
    phone: EntryFieldTypes.Symbol;
    photo: EntryFieldTypes.AssetLink;
  };
  contentTypeId: "praxisManagerin";
}

interface Startseite {
  fields: {
    sonjaFoto: EntryFieldTypes.AssetLink;
    carousel: EntryFieldTypes.Array<EntryFieldTypes.AssetLink>;
    willkommensText: EntryFieldTypes.RichText;
  };
  contentTypeId: "startseite";
}

interface TherapeutenSeite {
  fields: {
    titel: EntryFieldTypes.Symbol;
    therapeutenListe: EntryFieldTypes.Array<
      EntryFieldTypes.EntryLink<Therapeut>
    >;
  };
  contentTypeId: "therapeutenSeite";
}

const eta = new Eta({ views: path.join(import.meta.dirname!, "templates") });

const client = contentful.createClient({
  space: process.env["CONTENTFUL_SPACE_ID"]!,
  accessToken: process.env["CONTENTFUL_ACCESS_TOKEN"]!,
  host: process.env["CONTENTFUL_HOST"] || "cdn.contentful.com",
});

const googleMapsApiKey = process.env["PUBLIC_GOOGLE_MAPS_API_KEY"] || "";

// Base navigation - text for Contentful pages will be updated dynamically
const baseNavigation = [
  { slug: "praxis", text: "Praxis", href: "/praxis.html" },
  { slug: "therapie", text: "Therapie", href: "/therapie.html" },
  { slug: "diagnostik", text: "Diagnostik", href: "/diagnostik.html" },
  { slug: "therapeuten", text: "Therapeuten", href: "/therapeuten.html" },
  { slug: "kosten", text: "Kosten", href: "/kosten.html" },
  { slug: "kontakt", text: "Kontakt & Anfahrt", href: "/kontakt.html" },
  { slug: "karriere", text: "Karriere", href: "/karriere.html" },
];

// Helper to render rich text with embedded Collapsible support
function renderRichText(document: Parameters<typeof documentToHtmlString>[0]) {
  return documentToHtmlString(document, {
    renderNode: {
      [BLOCKS.EMBEDDED_ENTRY]: (node) => {
        const entry = node.data.target;
        if (entry.sys.contentType?.sys.id === "collapsible") {
          const titel = entry.fields.titel;
          const inhalt = entry.fields.inhalt;
          const innerHtml = inhalt ? documentToHtmlString(inhalt) : "";
          return `<details class="collapsible"><summary>${titel}</summary><div class="stack-s">${innerHtml}</div></details>`;
        }
        return "";
      },
    },
  });
}

async function build() {
  // Fetch Seite (pages) from Contentful
  console.log("Fetching pages from Contentful...");
  const getSeitenResponse = await client.getEntries<Seite, "de">({
    content_type: "seite",
  });

  // Find pages by slug
  const findPage = (slug: string) => {
    const page = getSeitenResponse.items.find(
      (item) => item.fields.slug === slug
    );
    if (!page) {
      throw new Error(`Page with slug "${slug}" not found in Contentful`);
    }
    return page;
  };

  const therapiePage = findPage("therapie");
  const diagnostikPage = findPage("diagnostik");
  const kostenPage = findPage("kosten");
  const karrierePage = findPage("karriere");

  // Build navigation with navigationsName from Contentful pages
  const navigation = baseNavigation.map((item) => {
    const contentfulPage = getSeitenResponse.items.find(
      (page) => page.fields.slug === item.slug
    );
    return {
      text: contentfulPage?.fields.navigationsName || item.text,
      href: item.href,
    };
  });

  console.log("Fetching therapeutenSeite from Contentful...");
  const getTherapeutenSeiteResponse = await client.getEntries<
    TherapeutenSeite,
    "de"
  >({
    content_type: "therapeutenSeite",
    include: 2,
  });

  if (getTherapeutenSeiteResponse.items.length !== 1) {
    throw new Error(
      `Expected exactly 1 TherapeutenSeite, found ${getTherapeutenSeiteResponse.items.length}`
    );
  }

  const therapeutenSeite = getTherapeutenSeiteResponse.items[0];
  const therapeuten = therapeutenSeite.fields.therapeutenListe
    .filter((item): item is typeof item & { fields: Therapeut["fields"] } =>
      "fields" in item
    )
    .map((item) => {
      const foto = item.fields.foto;
      const hasPhoto = !!(foto && "fields" in foto && foto.fields.file?.url);
      const fotoUrl = hasPhoto
        ? `https:${(foto as { fields: { file: { url: string } } }).fields.file.url}`
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
        hasPhoto,
        email: item.fields.email || "",
        phone: item.fields.telefon || "",
        aufKontaktSeiteAusblenden: item.fields.aufKontaktSeiteAusblenden,
        hasBio: !!item.fields.bio,
        bioHtml: item.fields.bio ? documentToHtmlString(item.fields.bio) : "",
      };
    });

  console.log("Fetching praxisManagerin from Contentful...");
  const getPraxisManagerinResponse = await client.getEntries<
    PraxisManagerin,
    "de"
  >({
    content_type: "praxisManagerin",
  });

  const praxisManagerinEntry = getPraxisManagerinResponse.items[0];
  if (!praxisManagerinEntry) {
    throw new Error("PraxisManagerin not found in Contentful");
  }

  const pmPhoto = praxisManagerinEntry.fields.photo;
  const praxisManagerin = {
    name: praxisManagerinEntry.fields.name,
    phone: praxisManagerinEntry.fields.phone,
    photoUrl:
      pmPhoto && "fields" in pmPhoto && pmPhoto.fields.file?.url
        ? `https:${pmPhoto.fields.file.url}`
        : "",
  };

  console.log("Fetching startseite from Contentful...");
  const getStartseiteResponse = await client.getEntries<Startseite, "de">({
    content_type: "startseite",
  });

  if (getStartseiteResponse.items.length !== 1) {
    throw new Error(
      `Expected exactly 1 Startseite, found ${getStartseiteResponse.items.length}`
    );
  }

  const startseite = getStartseiteResponse.items[0];

  // Extract Sonja photo URL
  const sonjaFoto = startseite.fields.sonjaFoto;
  const sonjaFotoUrl =
    sonjaFoto && "fields" in sonjaFoto && sonjaFoto.fields.file?.url
      ? `https:${sonjaFoto.fields.file.url}`
      : "/images/sonja_startseite.jpeg";

  // Extract carousel images
  const carouselImages = startseite.fields.carousel
    .filter(
      (asset): asset is typeof asset & { fields: { file: { url: string } } } =>
        "fields" in asset && !!asset.fields.file?.url
    )
    .map((asset) => ({
      url: `https:${asset.fields.file.url}`,
      alt: asset.fields.description || "Bild aus der Praxis",
    }));

  // Render welcome text
  const willkommensHtml = startseite.fields.willkommensText
    ? documentToHtmlString(startseite.fields.willkommensText)
    : "";

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
      carouselImages,
      sonjaFotoUrl,
      willkommensHtml,
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
      praxisManagerin,
      googleMapsApiKey,
      siteTitle: "KJP Meerbusch | Kontakt",
    })
  );

  console.log("Building praxis.html...");
  writeFileSync(
    "./public/praxis.html",
    eta.render("./praxis.eta", {
      navigation,
      carouselImages,
      siteTitle: "KJP Meerbusch | Praxis",
    })
  );

  // Build Therapie page from Contentful
  console.log("Building therapie.html...");
  const therapieHtml = therapiePage.fields.inhalt
    ? renderRichText(therapiePage.fields.inhalt)
    : "";
  writeFileSync(
    "./public/therapie.html",
    eta.render("./pages/seite.eta", {
      navigation,
      siteTitle: `KJP Meerbusch | ${therapiePage.fields.titel}`,
      titel: therapiePage.fields.titel,
      inhalt: therapieHtml,
    })
  );

  // Build Diagnostik page from Contentful
  console.log("Building diagnostik.html...");
  const diagnostikHtml = diagnostikPage.fields.inhalt
    ? renderRichText(diagnostikPage.fields.inhalt)
    : "";
  writeFileSync(
    "./public/diagnostik.html",
    eta.render("./pages/seite.eta", {
      navigation,
      siteTitle: `KJP Meerbusch | ${diagnostikPage.fields.titel}`,
      titel: diagnostikPage.fields.titel,
      inhalt: diagnostikHtml,
    })
  );

  // Build Kosten page from Contentful
  console.log("Building kosten.html...");
  const kostenHtml = kostenPage.fields.inhalt
    ? renderRichText(kostenPage.fields.inhalt)
    : "";
  writeFileSync(
    "./public/kosten.html",
    eta.render("./pages/seite.eta", {
      navigation,
      siteTitle: `KJP Meerbusch | ${kostenPage.fields.titel}`,
      titel: kostenPage.fields.titel,
      inhalt: kostenHtml,
    })
  );

  // Build Karriere page from Contentful
  console.log("Building karriere.html...");
  const karriereHtml = karrierePage.fields.inhalt
    ? renderRichText(karrierePage.fields.inhalt)
    : "";
  writeFileSync(
    "./public/karriere.html",
    eta.render("./pages/seite.eta", {
      navigation,
      siteTitle: `KJP Meerbusch | ${karrierePage.fields.titel}`,
      titel: karrierePage.fields.titel,
      inhalt: karriereHtml,
    })
  );

  // Build static content pages
  const contentPages = ["impressum"];

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
