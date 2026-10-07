/**
 * Datos del bar. Edita este archivo para cambiar horario, platos, precios o fotos.
 * Las imágenes viven en src/assets/img/ y Vite las optimiza y versiona en el build.
 */

const images = import.meta.glob("../assets/img/*.jpg", { eager: true, query: "?url", import: "default" });

/** URL final (con hash) de una imagen de src/assets/img/. */
export function img(file) {
  const url = images[`../assets/img/${file}`];
  if (!url) throw new Error(`Imagen no encontrada: ${file}`);
  return url;
}

export const BAR = {
  name: "Bar Bocatería El Búho",
  phone: "+34607968310",
  phonePretty: "607 96 83 10",
  whatsapp: "34607968310",
  address: "P.º Federico García Lorca, 6, 45007 Toledo",
  coords: [39.8676933, -3.9420914]
};

/**
 * Horario semanal. 0 = domingo … 6 = sábado. Minutos desde las 00:00;
 * un cierre > 1440 significa que cierra pasada la medianoche. null = cerrado.
 */
export const SCHEDULE = {
  0: [12 * 60, 25 * 60],
  1: null,
  2: [11 * 60, 25 * 60],
  3: [11 * 60, 25 * 60],
  4: [11 * 60, 25 * 60],
  5: [11 * 60, 26 * 60],
  6: [11 * 60, 26 * 60]
};

/** Carta. Precios orientativos: confirmar con el local. */
export const MENU = [
  { cat: "bocatas", name: "Bocata de calamares", desc: "Calamares rebozados al momento, pan crujiente y un toque de limón.", price: 6.5, img: img("hero-bocadillo.jpg"), tag: "Clásico" },
  { cat: "bocatas", name: "Bocata de tortilla", desc: "Tortilla de patatas jugosa, recién hecha, en pan de barra.", price: 5, img: img("bocadillo-tortilla.jpg") },
  { cat: "bocatas", name: "Bocata de pulled pork", desc: "Cerdo desmechado a baja temperatura con salsa barbacoa.", price: 7.5, img: img("pulled-pork.jpg"), tag: "Favorito" },
  { cat: "bocatas", name: "Pulguitas variadas", desc: "Mini bocatas para ir picando: jamón, lomo, tortilla, atún…", price: 2.5, img: img("tapas.jpg"), tag: "Destacado" },
  { cat: "burgers", name: "Hamburguesa de pollo", desc: "Pechuga crujiente, lechuga, tomate y mayonesa. La que más se repite.", price: 8.5, img: img("hamburguesa.jpg"), tag: "Top ventas" },
  { cat: "burgers", name: "Hamburguesa de ternera", desc: "Carne de ternera hecha en su punto con patatas.", price: 9, img: img("hamburguesa.jpg") },
  { cat: "burgers", name: "Hamburguesa de venado", desc: "Venado, queso de cabra y bacon crujiente.", price: 11, img: img("hamburguesa.jpg"), tag: "Especial" },
  { cat: "burgers", name: "Hamburguesa piña y queso azul", desc: "La combinación que sorprende: dulce, salado y potente.", price: 10, img: img("hamburguesa.jpg") },
  { cat: "tapas", name: "Migas", desc: "Migas manchegas como tapa o en ración. Las que dan fama a la casa.", price: 7, img: img("migas.jpg"), tag: "De la tierra" },
  { cat: "tapas", name: "Patatas bravas", desc: "Patatas fritas con salsa brava casera.", price: 5.5, img: img("bravas.jpg") },
  { cat: "tapas", name: "Croquetas caseras", desc: "Cremosas por dentro, crujientes por fuera.", price: 7, img: img("croquetas.jpg") },
  { cat: "tapas", name: "Tortilla de patatas", desc: "Pincho o ración, con o sin cebolla.", price: 3, img: img("tortilla.jpg") },
  { cat: "tapas", name: "Pinchos morunos", desc: "Brochetas de carne adobada a la plancha.", price: 6.5, img: img("pincho.jpg") },
  { cat: "bebidas", name: "Caña", desc: "Bien fría y bien tirada, siempre con su tapa.", price: 1.8, img: img("cerveza.jpg"), tag: "Con tapa" },
  { cat: "bebidas", name: "Cerveza Alhambra", desc: "Tercio de Alhambra Reserva 1925 o Especial.", price: 2.8, img: img("cerveza.jpg"), tag: "Destacado" },
  { cat: "bebidas", name: "Vino de la casa", desc: "Tinto o blanco de la tierra por copas.", price: 2.2, img: img("tapas.jpg") },
  { cat: "bebidas", name: "Café y desayunos", desc: "Café, tostadas y bollería para empezar el día.", price: 1.5, img: img("terraza.jpg") }
];

export const GALLERY = [
  { src: img("hero-bocadillo.jpg"), alt: "Bocadillo de calamares" },
  { src: img("tapas.jpg"), alt: "Barra llena de pinchos y tapas", size: "wide" },
  { src: img("bravas.jpg"), alt: "Patatas bravas" },
  { src: img("cerveza.jpg"), alt: "Caña bien fría", size: "tall" },
  { src: img("hamburguesa.jpg"), alt: "Hamburguesa casera" },
  { src: img("croquetas.jpg"), alt: "Croquetas caseras" },
  { src: img("migas.jpg"), alt: "Migas con huevo", size: "tall" },
  { src: img("tortilla.jpg"), alt: "Tortilla de patatas" },
  { src: img("terraza.jpg"), alt: "Terraza al aire libre", size: "wide" },
  { src: img("pincho.jpg"), alt: "Pinchos morunos" },
  { src: img("toledo.jpg"), alt: "Vista de Toledo", size: "wide" }
];

/** Opiniones reales de clientes en Google Maps y Tripadvisor (extractos). */
export const REVIEWS = [
  { text: "Y las migas que ponen de pincho y los bocatas deliciosos. ¡Volveremos seguro!", author: "Cliente en Google", stars: 5 },
  { text: "Cerveza Mahou, tapas generosas y los camareros son muy amables.", author: "Cliente en Google", stars: 5 },
  { text: "Un buen sitio para tomar cervezas, con buenas tapas y muy buen ambiente.", author: "Cliente en Google", stars: 5 },
  { text: "Buen sitio donde ir a comerse un bocata o una burguer, ¡la hamburguesa de pollo está buenísima!", author: "Gabriel A. · Local Guide", stars: 5 },
  { text: "Genial todo la verdad. Nos atendió un muchacho súper majo y súper atento, te informa si hay algún cambio en la carta.", author: "Antonio S. · Local Guide", stars: 5 },
  { text: "La carne bien hecha por dentro, en su punto. Muy buena presentación.", author: "Cliente en Tripadvisor", stars: 5 }
];

/** Créditos de las fotografías (Wikimedia Commons). */
export const CREDITS = [
  { file: "hero-bocadillo.jpg", author: "Tamorlan", license: "CC BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Bocadillo_de_calamares-2009.jpg" },
  { file: "tapas.jpg", author: "Basotxerri", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Barra_de_pintxos_Donosti_01.JPG" },
  { file: "hamburguesa.jpg", author: "Horacio Cambeiro", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Hamburguesa_casera_argentina.jpg" },
  { file: "bravas.jpg", author: "Juan Emilio Prades Bel", license: "CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Patatas_bravas._Tapa_de_bar_(Espa%C3%B1a).jpg" },
  { file: "croquetas.jpg", author: "Juan Emilio Prades Bel", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Croquetas_caseras_de_carne_de_cocido_con_allioli.jpg" },
  { file: "tortilla.jpg", author: "Mentxuwiki", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Tortilla_de_patatas_con_cebolla.jpg" },
  { file: "bocadillo-tortilla.jpg", author: "Tamorlan", license: "CC BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Bocadillo_de_Tortilla_de_patatas_-_34.jpg" },
  { file: "toledo.jpg", author: "Diliff", license: "CC BY 2.5", source: "https://commons.wikimedia.org/wiki/File:Toledo_Skyline_Panorama,_Spain_-_Dec_2006_edit.jpg" },
  { file: "cerveza.jpg", author: "Bjarki Sigursveinsson", license: "Dominio público", source: "https://commons.wikimedia.org/wiki/File:Lager_beer_in_glass.jpg" },
  { file: "migas.jpg", author: "ZahonesdelMontero", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Migas_con_huevo_en_monter%C3%ADa.jpg" },
  { file: "pulled-pork.jpg", author: "Dktue", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Pulled-pork-sandwiches.jpg" },
  { file: "pincho.jpg", author: "Tamorlan", license: "CC BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Pincho_moruno-2009.jpg" },
  { file: "terraza.jpg", author: "Andrew.brown.garcia", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Terraza-bar-embalse-bolera.jpg" }
];
