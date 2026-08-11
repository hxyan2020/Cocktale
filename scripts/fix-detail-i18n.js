const fs = require("fs");
const path = require("path");

function stripAndInject(src, extras) {
  // Remove any existing materials..finishStep lines inside detail blocks
  let cleaned = src.replace(
    /\n\s*materials:[\s\S]*?finishStep:[^\n]*,/g,
    "",
  );

  const re = /glass:\s*(['"`])([\s\S]*?)\1,\s*\n(\s*)bestFor:/g;
  let i = 0;
  cleaned = cleaned.replace(re, (full, q, glassVal, indent) => {
    const vals = extras[i++];
    if (!vals) return full;
    const esc = (s) =>
      s.replace(/\\/g, "\\\\").replace(new RegExp(`\\${q}`, "g"), `\\${q}`);
    return (
      `glass: ${q}${glassVal}${q},\n` +
      `${indent}materials: ${q}${esc(vals.materials)}${q},\n` +
      `${indent}servingVessel: ${q}${esc(vals.servingVessel)}${q},\n` +
      `${indent}utensils: ${q}${esc(vals.utensils)}${q},\n` +
      `${indent}beforeYouStart: ${q}${esc(vals.beforeYouStart)}${q},\n` +
      `${indent}stepByStep: ${q}${esc(vals.stepByStep)}${q},\n` +
      `${indent}stepLabel: ${q}${esc(vals.stepLabel)}${q},\n` +
      `${indent}gatherStep: ${q}${esc(vals.gatherStep)}${q},\n` +
      `${indent}prepGlassStep: ${q}${esc(vals.prepGlassStep)}${q},\n` +
      `${indent}finishStep: ${q}${esc(vals.finishStep)}${q},\n` +
      `${indent}bestFor:`
    );
  });
  return { cleaned, count: i };
}

const targets = {
  "europe-asia.ts": [
    {
      materials: "Materialen & gereedschap",
      servingVessel: "Serveerglas / beker",
      utensils: "Utensiliën & spullen",
      beforeYouStart: "Voor je begint",
      stepByStep: "Stap voor stap",
      stepLabel: "Stap {n}",
      gatherStep: "Verzamel alle ingrediënten en de onderstaande tools.",
      prepGlassStep:
        "Bereid je {glass} voor: koel af voor koude drinks, of warm voor voor warme.",
      finishStep: "Proef, pas zo nodig aan, garneer en serveer.",
    },
    {
      materials: "Materiały i narzędzia",
      servingVessel: "Szklanka / filiżanka do podania",
      utensils: "Przybory i sprzęt",
      beforeYouStart: "Zanim zaczniesz",
      stepByStep: "Krok po kroku",
      stepLabel: "Krok {n}",
      gatherStep: "Zbierz wszystkie składniki i narzędzia poniżej.",
      prepGlassStep:
        "Przygotuj {glass}: schłodź do drinków zimnych lub podgrzej do gorących.",
      finishStep: "Spróbuj, w razie potrzeby popraw, udekoruj i podaj.",
    },
    {
      materials: "উপকরণ ও সরঞ্জাম",
      servingVessel: "পরিবেশনের গ্লাস / কাপ",
      utensils: "পাত্র ও গিয়ার",
      beforeYouStart: "শুরু করার আগে",
      stepByStep: "ধাপে ধাপে",
      stepLabel: "ধাপ {n}",
      gatherStep: "নিচের সব উপকরণ ও সরঞ্জাম জোগাড় করুন।",
      prepGlassStep:
        "আপনার {glass} প্রস্তুত করুন: ঠান্ডা পানীয়ের জন্য ঠান্ডা করুন, গরমের জন্য আগে গরম করুন।",
      finishStep: "চেখে দেখুন, দরকার হলে ঠিক করুন, গার্নিশ দিয়ে পরিবেশন করুন।",
    },
  ],
  "more.ts": [
    {
      materials: "Матеріали та інструменти",
      servingVessel: "Келих / чашка для подачі",
      utensils: "Начиння та приладдя",
      beforeYouStart: "Перед початком",
      stepByStep: "Крок за кроком",
      stepLabel: "Крок {n}",
      gatherStep: "Зберіть усі інгредієнти та інструменти нижче.",
      prepGlassStep:
        "Підготуйте {glass}: охолодіть для холодних напоїв або прогрійте для гарячих.",
      finishStep: "Скуштуйте, за потреби скоригуйте, додайте гарнір і подавайте.",
    },
    {
      materials: "Bahan & alatan",
      servingVessel: "Gelas / cawan hidangan",
      utensils: "Peralatan & kelengkapan",
      beforeYouStart: "Sebelum mula",
      stepByStep: "Langkah demi langkah",
      stepLabel: "Langkah {n}",
      gatherStep: "Kumpulkan semua bahan dan alatan di bawah.",
      prepGlassStep:
        "Sediakan {glass}: sejukkan untuk minuman sejuk, atau panaskan dahulu untuk yang panas.",
      finishStep: "Rasa, laraskan jika perlu, hias dan hidangkan.",
    },
    {
      materials: "مواد و ابزار",
      servingVessel: "لیوان / فنجان سرو",
      utensils: "وسایل و تجهیزات",
      beforeYouStart: "قبل از شروع",
      stepByStep: "گام‌به‌گام",
      stepLabel: "گام {n}",
      gatherStep: "همه مواد و ابزار زیر را آماده کنید.",
      prepGlassStep:
        "{glass} را آماده کنید: برای نوشیدنی سرد خنک کنید یا برای گرم از قبل گرم کنید.",
      finishStep: "بچشید، در صورت نیاز تنظیم کنید، تزیین کنید و سرو کنید.",
    },
    {
      materials: "חומרים וכלים",
      servingVessel: "כוס / ספל הגשה",
      utensils: "כלי עבודה וציוד",
      beforeYouStart: "לפני שמתחילים",
      stepByStep: "שלב אחר שלב",
      stepLabel: "שלב {n}",
      gatherStep: "אספו את כל המרכיבים והכלים למטה.",
      prepGlassStep:
        "הכינו את ה-{glass}: קררו למשקאות קרים או חממו מראש לחמים.",
      finishStep: "טעמו, התאימו במידת הצורך, קשטו והגישו.",
    },
    {
      materials: "Material & verktyg",
      servingVessel: "Serveringsglas / kopp",
      utensils: "Redskap & utrustning",
      beforeYouStart: "Innan du börjar",
      stepByStep: "Steg för steg",
      stepLabel: "Steg {n}",
      gatherStep: "Samla alla ingredienser och verktygen nedan.",
      prepGlassStep:
        "Förbered ditt {glass}: kyl för kalla drinkar, eller förvärm för varma.",
      finishStep: "Smaka av, justera vid behov, garnera och servera.",
    },
  ],
};

const dir = path.join("src", "i18n", "messages");
for (const [file, extras] of Object.entries(targets)) {
  const p = path.join(dir, file);
  const src = fs.readFileSync(p, "utf8");
  const { cleaned, count } = stripAndInject(src, extras);
  fs.writeFileSync(p, cleaned);
  console.log(file, count);
}
