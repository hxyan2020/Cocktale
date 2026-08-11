const fs = require("fs");
const path = require("path");

const dir = path.join("src", "i18n", "messages");

// Only remaining unpatched locales (first in each file was already patched)
const extras = {
  "sea.ts": [
    {
      materials: "วัสดุและอุปกรณ์",
      servingVessel: "แก้ว / ถ้วยเสิร์ฟ",
      utensils: "เครื่องใช้และอุปกรณ์",
      beforeYouStart: "ก่อนเริ่ม",
      stepByStep: "ทีละขั้นตอน",
      stepLabel: "ขั้นตอนที่ {n}",
      gatherStep: "เตรียมส่วนผสมและอุปกรณ์ด้านล่างให้ครบ",
      prepGlassStep:
        "เตรียม {glass}: แช่เย็นสำหรับเครื่องดื่มเย็น หรืออุ่นล่วงหน้าสำหรับเครื่องดื่มร้อน",
      finishStep: "ชิม ปรับถ้าจำเป็น ตกแต่งแล้วเสิร์ฟ",
    },
    {
      materials: "Bahan & alat",
      servingVessel: "Gelas / cangkir saji",
      utensils: "Peralatan & perlengkapan",
      beforeYouStart: "Sebelum mulai",
      stepByStep: "Langkah demi langkah",
      stepLabel: "Langkah {n}",
      gatherStep: "Siapkan semua bahan dan alat di bawah.",
      prepGlassStep:
        "Siapkan {glass}: dinginkan untuk minuman dingin, atau panaskan dulu untuk yang panas.",
      finishStep: "Cicipi, sesuaikan bila perlu, beri garnish, lalu sajikan.",
    },
  ],
  "europe-asia.ts": [
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

function blockFor(vals, indent, q) {
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(new RegExp(`\\${q}`, "g"), `\\${q}`);
  return (
    `${indent}materials: ${q}${esc(vals.materials)}${q},\n` +
    `${indent}servingVessel: ${q}${esc(vals.servingVessel)}${q},\n` +
    `${indent}utensils: ${q}${esc(vals.utensils)}${q},\n` +
    `${indent}beforeYouStart: ${q}${esc(vals.beforeYouStart)}${q},\n` +
    `${indent}stepByStep: ${q}${esc(vals.stepByStep)}${q},\n` +
    `${indent}stepLabel: ${q}${esc(vals.stepLabel)}${q},\n` +
    `${indent}gatherStep: ${q}${esc(vals.gatherStep)}${q},\n` +
    `${indent}prepGlassStep: ${q}${esc(vals.prepGlassStep)}${q},\n` +
    `${indent}finishStep: ${q}${esc(vals.finishStep)}${q},\n`
  );
}

for (const [file, list] of Object.entries(extras)) {
  let src = fs.readFileSync(path.join(dir, file), "utf8");
  const re = /glass:\s*(['"`])([\s\S]*?)\1,\s*\n(\s*)bestFor:/g;
  let i = 0;
  src = src.replace(re, (full, q, glassVal, indent) => {
    const vals = list[i++];
    if (!vals) return full;
    return `glass: ${q}${glassVal}${q},\n${blockFor(vals, indent, q)}${indent}bestFor:`;
  });
  fs.writeFileSync(path.join(dir, file), src);
  console.log(file, "patched", i, "of", list.length);
}
