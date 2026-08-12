import type { SketchKind } from "@/lib/item-info";

type Props = {
  kind: SketchKind;
  className?: string;
};

/** Line-sketch illustrations for bar tools, glassware, and ingredient types. */
export function SketchIllustration({ kind, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {pathsFor(kind)}
    </svg>
  );
}

function pathsFor(kind: SketchKind) {
  switch (kind) {
    case "jigger":
      return (
        <>
          <path d="M48 18h24l-4 18H52z" />
          <path d="M44 36h32l-6 40H50z" />
          <path d="M50 56h20" />
        </>
      );
    case "cocktailShaker":
      return (
        <>
          <path d="M42 22h36l-4 8v46c0 6-6 10-14 10s-14-4-14-10V30z" />
          <path d="M46 22V16h28v6" />
          <path d="M48 40h24M48 52h24" />
        </>
      );
    case "mixingGlass":
      return (
        <>
          <path d="M40 22h40l-4 58H44z" />
          <path d="M46 38h28M48 52h24" />
        </>
      );
    case "barSpoon":
      return (
        <>
          <ellipse cx="36" cy="72" rx="10" ry="7" />
          <path d="M42 68c18-22 34-40 46-52" />
          <path d="M78 22l8 4-4 8" />
        </>
      );
    case "hawthorneStrainer":
      return (
        <>
          <ellipse cx="58" cy="48" rx="28" ry="18" />
          <path d="M34 42c8 10 40 10 48 0" />
          <path d="M86 40c8-2 14-8 16-16" />
          <circle cx="40" cy="48" r="2" fill="currentColor" stroke="none" />
          <circle cx="52" cy="52" r="2" fill="currentColor" stroke="none" />
          <circle cx="64" cy="52" r="2" fill="currentColor" stroke="none" />
          <circle cx="76" cy="48" r="2" fill="currentColor" stroke="none" />
        </>
      );
    case "fineStrainer":
      return (
        <>
          <path d="M30 28h60v8H30z" />
          <path d="M38 36c0 28 8 44 22 44s22-16 22-44" />
          <path d="M44 48h32M46 60h28M50 72h20" />
        </>
      );
    case "muddler":
      return (
        <>
          <path d="M56 14v48" />
          <path d="M48 62h16l4 20H44z" />
          <path d="M52 28h8" />
        </>
      );
    case "citrusJuicer":
      return (
        <>
          <ellipse cx="60" cy="70" rx="28" ry="10" />
          <path d="M40 70V48c0-14 9-24 20-24s20 10 20 24v22" />
          <path d="M52 40l8 12 8-12" />
        </>
      );
    case "knifeAndBoard":
      return (
        <>
          <rect x="22" y="58" width="76" height="22" rx="3" />
          <path d="M34 54V30c0-4 4-6 10-4l36 14c4 2 4 6 0 8L44 58" />
          <path d="M34 42h8" />
        </>
      );
    case "peeler":
      return (
        <>
          <path d="M40 78V28c0-6 6-10 12-10h8c6 0 12 4 12 10v50" />
          <path d="M48 36h16v28H48z" />
          <path d="M52 44h8M52 52h8" />
        </>
      );
    case "blender":
      return (
        <>
          <path d="M38 78h44v8H38z" />
          <path d="M44 78V40l8-18h16l8 18v38" />
          <path d="M50 52h20M52 62h16" />
        </>
      );
    case "ice":
    case "iceCube":
      return (
        <>
          <path d="M34 40h28v28H34z" />
          <path d="M48 32h28v28H48z" />
          <path d="M34 40l14-8M62 40l14-8M62 68l14-8M34 68l14-8" />
        </>
      );
    case "iceScoop":
      return (
        <>
          <path d="M28 58c0-16 14-28 30-28h8c10 0 18 8 18 18v4H58c-10 0-18 6-22 14z" />
          <path d="M76 52l20-16" />
        </>
      );
    case "teaspoon":
      return (
        <>
          <ellipse cx="38" cy="62" rx="12" ry="8" />
          <path d="M48 58l40-28" />
        </>
      );
    case "kettleOrHeat":
      return (
        <>
          <path d="M36 78h48V46c0-14-10-24-24-24S36 32 36 46z" />
          <path d="M84 52c10 0 14 8 14 14" />
          <path d="M56 22v-6M48 84h24" />
        </>
      );
    case "punchBowl":
      return (
        <>
          <ellipse cx="60" cy="68" rx="34" ry="12" />
          <path d="M26 68V52c0-10 15-18 34-18s34 8 34 18v16" />
          <path d="M40 48c6-4 34-4 40 0" />
        </>
      );
    case "ladle":
      return (
        <>
          <ellipse cx="40" cy="64" rx="16" ry="12" />
          <path d="M52 58c20-18 36-34 48-42" />
        </>
      );
    case "coffeeMaker":
      return (
        <>
          <path d="M34 78h52V34H34z" />
          <path d="M42 34V24h36v10" />
          <path d="M48 48h24v18H48z" />
          <circle cx="60" cy="40" r="3" />
        </>
      );
    case "whiskOrFrother":
      return (
        <>
          <path d="M60 18v28" />
          <path d="M48 46c0 22 6 34 12 34s12-12 12-34" />
          <path d="M44 52c8 8 24 8 32 0M46 64c6 6 22 6 28 0" />
        </>
      );
    case "grater":
      return (
        <>
          <path d="M44 18h32l-6 64H50z" />
          <circle cx="54" cy="36" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="64" cy="36" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="54" cy="48" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="64" cy="48" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="54" cy="60" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="64" cy="60" r="1.5" fill="currentColor" stroke="none" />
        </>
      );
    case "channelKnife":
      return (
        <>
          <path d="M28 70l52-40" />
          <path d="M72 26c6-2 14 2 16 10" />
          <path d="M28 70c-6 4-10 12-6 16" />
        </>
      );
    case "glassCocktail":
      return (
        <>
          <path d="M36 22h48L68 48H52z" />
          <path d="M60 48v28" />
          <path d="M46 76h28" />
        </>
      );
    case "glassHighball":
    case "glassCollins":
      return (
        <>
          <path d="M42 18h36v62H42z" />
          <path d="M42 72h36" />
          <path d="M48 34h10M48 46h14" />
        </>
      );
    case "glassRocks":
      return (
        <>
          <path d="M38 34h44v46H38z" />
          <path d="M44 48h12M44 58h16" />
        </>
      );
    case "glassShot":
      return (
        <>
          <path d="M46 36h28v40H46z" />
          <path d="M46 68h28" />
        </>
      );
    case "glassMug":
    case "glassIrish":
      return (
        <>
          <path d="M36 28h40v52H36z" />
          <path d="M76 40c12 0 16 8 16 16s-4 16-16 16" />
          <path d="M42 40h16" />
        </>
      );
    case "glassFlute":
      return (
        <>
          <path d="M52 18h16l-4 42H56z" />
          <path d="M60 60v22" />
          <path d="M48 82h24" />
        </>
      );
    case "glassHurricane":
      return (
        <>
          <path d="M48 18c16 0 22 10 18 22-4 12 6 18 6 28 0 12-10 18-18 18s-18-6-18-18c0-10 10-16 6-28-4-12 2-22 18-22z" />
          <path d="M52 82h16" />
        </>
      );
    case "glassMargarita":
      return (
        <>
          <path d="M28 28h64L72 48H48z" />
          <path d="M52 48c0 10 2 18 8 18s8-8 8-18" />
          <path d="M60 66v16" />
          <path d="M48 82h24" />
        </>
      );
    case "glassWine":
      return (
        <>
          <path d="M42 22c0 22 6 34 18 34s18-12 18-34" />
          <path d="M42 22h36" />
          <path d="M60 56v24" />
          <path d="M48 80h24" />
        </>
      );
    case "glassPitcher":
      return (
        <>
          <path d="M36 78h40V32l12-10H40l-4 10z" />
          <path d="M76 44c10 2 16 10 16 18" />
        </>
      );
    case "glassBeer":
      return (
        <>
          <path d="M38 30h36v50H38z" />
          <path d="M74 42c10 0 14 8 14 14s-4 14-14 14" />
          <path d="M44 30c2-8 10-12 18-10" />
        </>
      );
    case "glassGeneric":
      return (
        <>
          <path d="M40 24h40l-4 56H44z" />
          <path d="M48 40h16" />
        </>
      );
    case "spiritGin":
    case "spiritVodka":
    case "spiritRum":
    case "spiritTequila":
    case "spiritWhiskey":
    case "spiritBrandy":
    case "spiritGeneric":
    case "liqueur":
    case "vermouth":
      return bottleSketch(kind);
    case "citrus":
      return (
        <>
          <circle cx="52" cy="52" r="24" />
          <path d="M52 28c8 8 8 40 0 48M36 40c12 6 20 6 32 0M36 64c12-6 20-6 32 0" />
          <path d="M72 34c6-8 14-8 18-2" />
        </>
      );
    case "juice":
      return (
        <>
          <path d="M44 22h32l4 58H40z" />
          <path d="M48 40c6 8 18 8 24 0" />
          <circle cx="56" cy="56" r="3" />
        </>
      );
    case "syrup":
      return (
        <>
          <path d="M50 18h20v14H50z" />
          <path d="M46 32h28l-4 50H50z" />
          <path d="M54 48c4 10 4 22 0 28" />
        </>
      );
    case "bitters":
      return (
        <>
          <path d="M54 16h12v12H54z" />
          <path d="M48 28h24v54c0 4-4 6-12 6s-12-2-12-6z" />
          <path d="M56 44h8M56 56h8" />
        </>
      );
    case "sugar":
      return (
        <>
          <path d="M34 70c0-20 12-36 26-36s26 16 26 36" />
          <path d="M34 70h52" />
          <circle cx="52" cy="52" r="2" fill="currentColor" stroke="none" />
          <circle cx="64" cy="58" r="2" fill="currentColor" stroke="none" />
          <circle cx="58" cy="64" r="1.5" fill="currentColor" stroke="none" />
        </>
      );
    case "herb":
      return (
        <>
          <path d="M60 82V36" />
          <path d="M60 50c-12-8-18-4-22 4 8 2 16 0 22-4z" />
          <path d="M60 42c12-8 18-4 22 4-8 2-16 0-22-4z" />
          <path d="M60 60c-10-6-16-2-18 6 6 1 12 0 18-6z" />
          <path d="M60 54c10-6 16-2 18 6-6 1-12 0-18-6z" />
        </>
      );
    case "dairy":
      return (
        <>
          <path d="M44 28h32l4 8v44c0 6-6 10-20 10s-20-4-20-10V36z" />
          <path d="M48 28V22h24v6" />
          <path d="M52 48h16" />
        </>
      );
    case "egg":
      return (
        <>
          <path d="M60 22c14 0 22 18 22 34s-10 28-22 28-22-12-22-28 8-34 22-34z" />
          <path d="M48 48c6-4 18-4 24 0" />
        </>
      );
    case "coffee":
      return (
        <>
          <path d="M34 36h44v36c0 8-8 12-22 12s-22-4-22-12z" />
          <path d="M78 44c12 0 16 8 16 14s-4 14-16 14" />
          <path d="M48 28c4-8 12-10 20-6" />
        </>
      );
    case "wine":
      return (
        <>
          <path d="M48 18h24l-2 22c0 12-6 18-10 18s-10-6-10-18z" />
          <path d="M60 58v22" />
          <path d="M50 80h20" />
          <path d="M50 34h20" />
        </>
      );
    case "beer":
      return (
        <>
          <path d="M40 34h36v46H40z" />
          <path d="M44 34c2-10 10-14 20-12 4 6 8 10 12 12" />
          <path d="M76 48c8 0 12 6 12 12s-4 12-12 12" />
        </>
      );
    case "soda":
      return (
        <>
          <path d="M46 20h28l4 12v50c0 6-6 10-18 10s-18-4-18-10V32z" />
          <path d="M54 48c2-6 6-8 10-6M58 60c2-5 5-7 8-5" />
        </>
      );
    case "water":
      return (
        <>
          <path d="M44 22h32l6 58H38z" />
          <path d="M46 54c8-6 20-6 28 0 0 14-6 22-14 22s-14-8-14-22z" />
        </>
      );
    case "garnish":
      return (
        <>
          <circle cx="60" cy="48" r="18" />
          <path d="M60 30v36M42 48h36" />
          <path d="M48 36l24 24M48 60l24-24" />
          <path d="M78 34c8-4 14 0 16 8" />
        </>
      );
    case "other":
    default:
      return (
        <>
          <rect x="38" y="28" width="44" height="48" rx="6" />
          <path d="M50 48h20M50 58h14" />
          <circle cx="60" cy="38" r="3" />
        </>
      );
  }
}

function bottleSketch(kind: SketchKind) {
  const tall = kind === "spiritGin" || kind === "spiritVodka" || kind === "vermouth";
  const squat = kind === "liqueur" || kind === "spiritBrandy";
  if (squat) {
    return (
      <>
        <path d="M52 18h16v10H52z" />
        <path d="M42 28h36v50c0 6-6 10-18 10s-18-4-18-10z" />
        <path d="M50 44h20" />
      </>
    );
  }
  if (tall) {
    return (
      <>
        <path d="M54 14h12v16H54z" />
        <path d="M46 30h28l2 8v40c0 6-6 10-16 10s-16-4-16-10V38z" />
        <path d="M52 48h16" />
      </>
    );
  }
  return (
    <>
      <path d="M52 16h16v14H52z" />
      <path d="M44 30h32v48c0 6-6 10-16 10s-16-4-16-10z" />
      <path d="M50 46h20M52 58h16" />
    </>
  );
}
