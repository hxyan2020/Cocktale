const fs = require("fs");
const path = require("path");

const dir = path.join("src", "i18n", "messages");

const patches = {
  "zh-CN.ts": {
    materials: "材料与工具",
    servingVessel: "服务杯具",
    utensils: "器具与工具",
    beforeYouStart: "开始之前",
    stepByStep: "分步制作",
    stepLabel: "第 {n} 步",
    gatherStep: "准备好下列全部原料与工具。",
    prepGlassStep: "准备好你的 {glass}：冷饮先冰杯，热饮先温杯。",
    finishStep: "试味，必要时微调，加装饰后即可上桌。",
  },
  "zh-TW.ts": {
    materials: "材料與工具",
    servingVessel: "服務杯具",
    utensils: "器具與工具",
    beforeYouStart: "開始之前",
    stepByStep: "分步製作",
    stepLabel: "第 {n} 步",
    gatherStep: "準備好下列全部原料與工具。",
    prepGlassStep: "準備好你的 {glass}：冷飲先冰杯，熱飲先溫杯。",
    finishStep: "試味，必要時微調，加裝飾後即可上桌。",
  },
  "es.ts": {
    materials: "Materiales y herramientas",
    servingVessel: "Vaso / copa de servicio",
    utensils: "Utensilios y equipo",
    beforeYouStart: "Antes de empezar",
    stepByStep: "Paso a paso",
    stepLabel: "Paso {n}",
    gatherStep: "Reúne todos los ingredientes y las herramientas de abajo.",
    prepGlassStep:
      "Prepara tu {glass}: enfríalo para bebidas frías o precaliéntalo para calientes.",
    finishStep: "Prueba, ajusta si hace falta, añade el garnish y sirve.",
  },
  "fr.ts": {
    materials: "Matériel et outils",
    servingVessel: "Verre / tasse de service",
    utensils: "Ustensiles et matériel",
    beforeYouStart: "Avant de commencer",
    stepByStep: "Étape par étape",
    stepLabel: "Étape {n}",
    gatherStep: "Rassemblez tous les ingrédients et les outils ci-dessous.",
    prepGlassStep:
      "Préparez votre {glass} : refroidissez-le pour les boissons froides, ou préchauffez-le pour les chaudes.",
    finishStep: "Goûtez, ajustez si besoin, ajoutez le garnish et servez.",
  },
  "de.ts": {
    materials: "Materialien & Werkzeuge",
    servingVessel: "Servierglas / Tasse",
    utensils: "Utensilien & Gerät",
    beforeYouStart: "Bevor du startest",
    stepByStep: "Schritt für Schritt",
    stepLabel: "Schritt {n}",
    gatherStep: "Stelle alle Zutaten und die unten stehenden Werkzeuge bereit.",
    prepGlassStep:
      "Bereite dein {glass} vor: für kalte Drinks kühlen, für heiße vorwärmen.",
    finishStep: "Abschmecken, bei Bedarf anpassen, garnieren und servieren.",
  },
  "ja.ts": {
    materials: "材料と道具",
    servingVessel: "提供用グラス / カップ",
    utensils: "器具とギア",
    beforeYouStart: "始める前に",
    stepByStep: "手順",
    stepLabel: "ステップ {n}",
    gatherStep: "下記の材料と道具をすべて揃えましょう。",
    prepGlassStep:
      "{glass} を準備します。冷たいドリンクは冷やし、ホットは温めておきます。",
    finishStep: "味を見て必要なら調整し、ガーニッシュを添えて提供します。",
  },
  "ko.ts": {
    materials: "재료와 도구",
    servingVessel: "서빙 잔 / 컵",
    utensils: "기구와 장비",
    beforeYouStart: "시작하기 전에",
    stepByStep: "단계별 만들기",
    stepLabel: "단계 {n}",
    gatherStep: "아래 재료와 도구를 모두 준비하세요.",
    prepGlassStep:
      "{glass}를 준비하세요. 차가운 음료는 차갑게, 뜨거운 음료는 미리 데우세요.",
    finishStep: "맛을 보고 필요하면 조절한 뒤 가니시를 올려 내세요.",
  },
  "pt.ts": {
    materials: "Materiais e ferramentas",
    servingVessel: "Copo / xícara de serviço",
    utensils: "Utensílios e equipamento",
    beforeYouStart: "Antes de começar",
    stepByStep: "Passo a passo",
    stepLabel: "Passo {n}",
    gatherStep: "Reúna todos os ingredientes e as ferramentas abaixo.",
    prepGlassStep:
      "Prepare o seu {glass}: arrefeça para bebidas frias ou pré-aqueça para quentes.",
    finishStep: "Prove, ajuste se preciso, adicione o garnish e sirva.",
  },
  "ru.ts": {
    materials: "Материалы и инструменты",
    servingVessel: "Бокал / чашка для подачи",
    utensils: "Инвентарь и принадлежности",
    beforeYouStart: "Перед началом",
    stepByStep: "Пошагово",
    stepLabel: "Шаг {n}",
    gatherStep: "Соберите все ингредиенты и инструменты ниже.",
    prepGlassStep:
      "Подготовьте {glass}: охладите для холодных напитков или прогрейте для горячих.",
    finishStep:
      "Попробуйте, при необходимости скорректируйте, добавьте гарнир и подавайте.",
  },
  "ar.ts": {
    materials: "المواد والأدوات",
    servingVessel: "كأس / فنجان التقديم",
    utensils: "الأدوات والمعدات",
    beforeYouStart: "قبل أن تبدأ",
    stepByStep: "خطوة بخطوة",
    stepLabel: "الخطوة {n}",
    gatherStep: "اجمع كل المكونات والأدوات أدناه.",
    prepGlassStep:
      "جهّز {glass}: برّده للمشروبات الباردة أو سخّنه مسبقًا للساخنة.",
    finishStep: "تذوّق، عدّل إن لزم، أضف الزينة وقدّم.",
  },
  "hi.ts": {
    materials: "सामग्री और उपकरण",
    servingVessel: "परोसने का गिलास / कप",
    utensils: "बर्तन और गियर",
    beforeYouStart: "शुरू करने से पहले",
    stepByStep: "कदम दर कदम",
    stepLabel: "चरण {n}",
    gatherStep: "नीचे दी गई सभी सामग्री और उपकरण इकट्ठा करें।",
    prepGlassStep:
      "अपना {glass} तैयार करें: ठंडे पेय के लिए ठंडा करें, गर्म के लिए पहले गर्म करें।",
    finishStep: "चखें, ज़रूरत हो तो समायोजित करें, गार्निश लगाकर परोसें।",
  },
  "it.ts": {
    materials: "Materiali e strumenti",
    servingVessel: "Bicchiere / tazza di servizio",
    utensils: "Utensili e attrezzatura",
    beforeYouStart: "Prima di iniziare",
    stepByStep: "Passo dopo passo",
    stepLabel: "Passo {n}",
    gatherStep: "Prepara tutti gli ingredienti e gli strumenti qui sotto.",
    prepGlassStep:
      "Prepara il tuo {glass}: raffreddalo per drink freddi o preriscaldalo per quelli caldi.",
    finishStep: "Assaggia, regola se serve, aggiungi il garnish e servi.",
  },
  "tr.ts": {
    materials: "Malzemeler ve araçlar",
    servingVessel: "Servis bardağı / fincan",
    utensils: "Mutfak gereçleri",
    beforeYouStart: "Başlamadan önce",
    stepByStep: "Adım adım",
    stepLabel: "Adım {n}",
    gatherStep: "Aşağıdaki tüm malzemeleri ve araçları toplayın.",
    prepGlassStep:
      "{glass} hazırlayın: soğuk içecekler için soğutun, sıcaklar için önceden ısıtın.",
    finishStep: "Tadın, gerekirse ayarlayın, süsleyip servis edin.",
  },
};

const multiFileExtras = {
  "sea.ts": {
    vi: {
      materials: "Dụng cụ và vật liệu",
      servingVessel: "Ly / cốc phục vụ",
      utensils: "Dụng cụ pha chế",
      beforeYouStart: "Trước khi bắt đầu",
      stepByStep: "Từng bước",
      stepLabel: "Bước {n}",
      gatherStep: "Chuẩn bị tất cả nguyên liệu và dụng cụ bên dưới.",
      prepGlassStep:
        "Chuẩn bị {glass}: làm lạnh cho đồ uống lạnh, hoặc làm ấm trước cho đồ nóng.",
      finishStep: "Nếm thử, chỉnh nếu cần, thêm trang trí và phục vụ.",
    },
    th: {
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
    id: {
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
  },
  "europe-asia.ts": {
    nl: {
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
    pl: {
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
    bn: {
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
  },
  "more.ts": {
    uk: {
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
    ms: {
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
    fa: {
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
    he: {
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
    sv: {
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
  },
};

function insertKeys(src, vals) {
  if (src.includes("materials:")) return src;
  const needle = /glass:\s*(['"`])([\s\S]*?)\1,\s*\n(\s*)bestFor:/;
  const m = src.match(needle);
  if (!m) return null;
  const q = m[1];
  const indent = m[3];
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(new RegExp(q, "g"), `\\${q}`);
  const block =
    `glass: ${q}${m[2]}${q},\n` +
    `${indent}materials: ${q}${esc(vals.materials)}${q},\n` +
    `${indent}servingVessel: ${q}${esc(vals.servingVessel)}${q},\n` +
    `${indent}utensils: ${q}${esc(vals.utensils)}${q},\n` +
    `${indent}beforeYouStart: ${q}${esc(vals.beforeYouStart)}${q},\n` +
    `${indent}stepByStep: ${q}${esc(vals.stepByStep)}${q},\n` +
    `${indent}stepLabel: ${q}${esc(vals.stepLabel)}${q},\n` +
    `${indent}gatherStep: ${q}${esc(vals.gatherStep)}${q},\n` +
    `${indent}prepGlassStep: ${q}${esc(vals.prepGlassStep)}${q},\n` +
    `${indent}finishStep: ${q}${esc(vals.finishStep)}${q},\n` +
    `${indent}bestFor:`;
  return src.replace(needle, block);
}

let ok = 0;
let fail = [];

for (const [file, vals] of Object.entries(patches)) {
  const p = path.join(dir, file);
  const src = fs.readFileSync(p, "utf8");
  const next = insertKeys(src, vals);
  if (!next) fail.push(file);
  else {
    fs.writeFileSync(p, next);
    ok++;
  }
}

for (const [file, locales] of Object.entries(multiFileExtras)) {
  let src = fs.readFileSync(path.join(dir, file), "utf8");
  for (const vals of Object.values(locales)) {
    const next = insertKeys(src, vals);
    if (!next) {
      fail.push(`${file}:${JSON.stringify(vals.materials)}`);
      continue;
    }
    src = next;
    ok++;
  }
  fs.writeFileSync(path.join(dir, file), src);
}

console.log({ ok, fail });
