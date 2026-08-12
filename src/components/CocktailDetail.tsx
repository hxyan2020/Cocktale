"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Bookmark, Check, GlassWater, Wrench, ShoppingBag, ChevronDown } from "lucide-react";
import type { Cocktail } from "@/lib/types";
import { useI18n } from "@/components/LanguageProvider";
import { useShop } from "@/components/useShop";
import { useCart } from "@/components/CartProvider";
import { expandMakeSteps, inferEquipment } from "@/lib/make-guide";
import { formatMoney, productsForCocktailIngredients } from "@/lib/products";
import { getCocktailGallery, mergeCocktailGallery, type GalleryImage } from "@/lib/cocktail-gallery";
import { convertMeasure } from "@/lib/units";
import { equipmentInfo, glassInfo, ingredientInfo } from "@/lib/item-info";
import { useMeasureUnit } from "@/components/MeasureUnitProvider";
import { ItemInfoTrigger } from "@/components/ItemInfoTrigger";

type Props = {
  cocktail: Cocktail;
  collected: boolean;
  onClose: () => void;
  onCollect: () => void;
  onTried: () => void;
};

export function CocktailDetail({
  cocktail,
  collected,
  onClose,
  onCollect,
  onTried,
}: Props) {
  const { t, locale } = useI18n();
  const shop = useShop();
  const { addItem } = useCart();
  const { unit } = useMeasureUnit();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [extraGallery, setExtraGallery] = useState<GalleryImage[]>([]);

  const equipment = useMemo(() => inferEquipment(cocktail), [cocktail]);
  const recipeSteps = useMemo(() => expandMakeSteps(cocktail), [cocktail]);
  const localGallery = useMemo(() => getCocktailGallery(cocktail, 6), [cocktail]);
  const gallery = useMemo(
    () => mergeCocktailGallery(localGallery, extraGallery, 6),
    [localGallery, extraGallery],
  );

  useEffect(() => {
    setGalleryIndex(0);
    setShopOpen(false);
    setExtraGallery([]);
    const ac = new AbortController();
    fetch(`/api/cocktail-photos?name=${encodeURIComponent(cocktail.name)}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : { photos: [] }))
      .then((data: { photos?: GalleryImage[] }) => {
        setExtraGallery(Array.isArray(data.photos) ? data.photos : []);
      })
      .catch(() => {});
    return () => ac.abort();
  }, [cocktail.id, cocktail.name]);

  const shopProducts = useMemo(
    () =>
      productsForCocktailIngredients(
        cocktail.ingredients.map((i) => i.name),
        cocktail.glass,
        equipment.map((e) => e.id),
      ).slice(0, 8),
    [cocktail, equipment],
  );

  const steps = useMemo(() => {
    return [
      t("detail.gatherStep"),
      t("detail.prepGlassStep", { glass: cocktail.glass }),
      ...recipeSteps,
      t("detail.finishStep"),
    ];
  }, [cocktail.glass, recipeSteps, t]);

  const activeGallery = gallery[galleryIndex] ?? gallery[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-x-hidden bg-[rgba(20,16,12,0.55)] p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label={t("detail.close")}
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[100dvh] w-full max-w-lg overflow-x-hidden overflow-y-auto rounded-t-[1.75rem] bg-[var(--surface)] shadow-2xl sm:max-h-[92vh] sm:rounded-[1.75rem]">
        <div className="relative h-[min(38vh,15.5rem)] w-full sm:aspect-[4/3] sm:h-auto sm:min-h-80">
          <Image
            src={cocktail.image || "/cocktail-fallback.svg"}
            alt={cocktail.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
            priority
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute end-4 top-4 rounded-full bg-[rgba(28,22,16,0.55)] p-2 text-[var(--foam)] backdrop-blur"
            aria-label={t("detail.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-4 sm:p-6">
          <header>
            <p className="break-words text-xs font-medium tracking-[0.18em] uppercase text-[var(--accent-deep)]">
              {cocktail.category}
              {cocktail.iba ? ` · IBA ${cocktail.iba}` : ""}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              {cocktail.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{cocktail.origin}</p>
          </header>

          {gallery.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-[var(--ink)]">{shop.gallery}</h3>
              <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl bg-[#efe8dc] ring-1 ring-[var(--line)]">
                {activeGallery && (
                  <Image
                    src={activeGallery.url}
                    alt={activeGallery.alt}
                    fill
                    className="object-cover"
                    sizes="512px"
                  />
                )}
                {activeGallery && (
                  <span className="absolute bottom-3 start-3 rounded-full bg-[rgba(28,22,16,0.7)] px-3 py-1 text-xs text-[var(--foam)] backdrop-blur">
                    {activeGallery.label}
                  </span>
                )}
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#efe8dc] ring-2 transition ${
                      galleryIndex === i ? "ring-[var(--accent)]" : "ring-transparent"
                    }`}
                    aria-label={img.label}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold text-[var(--ink)]">{t("detail.theTale")}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-soft)]">
              {cocktail.story}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[var(--ink)]">{t("detail.ingredients")}</h3>
            <ul className="mt-2 space-y-2">
              {cocktail.ingredients.map((ing) => (
                <li
                  key={ing.name}
                  className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-2 text-sm"
                >
                  <ItemInfoTrigger info={ingredientInfo(ing.name)} className="min-w-0">
                    <span className="break-words text-[var(--ink)]">{ing.name}</span>
                  </ItemInfoTrigger>
                  <span className="shrink-0 pt-0.5 text-end text-[var(--ink-muted)]">
                    {ing.measure
                      ? convertMeasure(ing.measure, unit)
                      : t("detail.toTaste")}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-[var(--bg)] p-4 ring-1 ring-[var(--line)]">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[var(--accent-deep)]" />
              <h3 className="text-sm font-semibold text-[var(--ink)]">
                {t("detail.materials")}
              </h3>
            </div>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">{t("detail.beforeYouStart")}</p>

            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
                <GlassWater className="h-3.5 w-3.5" />
                {t("detail.servingVessel")}
              </div>
              <div className="rounded-xl bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] ring-1 ring-[var(--line)]">
                <ItemInfoTrigger info={glassInfo(cocktail.glass)} className="w-full">
                  <span>{cocktail.glass}</span>
                </ItemInfoTrigger>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
                {t("detail.utensils")}
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {equipment.map((item) => {
                  const label = t(`equipment.${item.id}`);
                  return (
                    <li
                      key={item.id}
                      className="rounded-xl bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] ring-1 ring-[var(--line)]"
                    >
                      <ItemInfoTrigger info={equipmentInfo(item.id, label)} className="w-full">
                        <span>{label}</span>
                      </ItemInfoTrigger>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[var(--ink)]">{t("detail.stepByStep")}</h3>
            <ol className="mt-3 space-y-3">
              {steps.map((step, i) => (
                <li
                  key={`${i}-${step.slice(0, 24)}`}
                  className="flex gap-3 rounded-2xl bg-[var(--bg)] p-3 ring-1 ring-[var(--line)]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-semibold text-[var(--foam)]">
                      {i + 1}
                    </span>
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--accent-deep)]">
                      {t("detail.stepLabel", { n: i + 1 })}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs leading-relaxed text-[var(--ink-muted)]">
              {t("content.recipeNote")}
            </p>
          </section>

          {shopProducts.length > 0 && (
            <section className="rounded-2xl bg-[var(--bg)] p-4 ring-1 ring-[var(--line)]">
              <button
                type="button"
                onClick={() => setShopOpen((open) => !open)}
                className="flex w-full items-center gap-2 text-start"
                aria-expanded={shopOpen}
              >
                <ShoppingBag className="h-4 w-4 shrink-0 text-[var(--accent-deep)]" />
                <h3 className="min-w-0 flex-1 text-sm font-semibold text-[var(--ink)]">
                  {shop.shopFromCocktail}
                </h3>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[var(--ink-muted)] transition-transform ${
                    shopOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {shopOpen && (
                <>
                  <ul className="mt-3 space-y-2">
                    {shopProducts.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface)] px-3 py-2 ring-1 ring-[var(--line)]"
                      >
                        <Link href={`/market/${p.slug}`} className="min-w-0 flex-1">
                          <p className="truncate text-sm text-[var(--ink)]">{p.name}</p>
                          <p className="text-xs text-[var(--ink-muted)]">
                            {formatMoney(p.priceCents, p.currency, locale)}
                          </p>
                        </Link>
                        <button
                          type="button"
                          onClick={() => addItem(p.id, 1)}
                          className="shrink-0 rounded-full bg-[var(--ink)] px-3 py-1.5 text-[11px] text-[var(--foam)]"
                        >
                          {shop.addToCart}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/market"
                    className="mt-3 inline-block text-xs font-medium text-[var(--accent-deep)]"
                  >
                    {shop.market} →
                  </Link>
                </>
              )}
            </section>
          )}

          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-[var(--ink)]">{t("detail.bestFor")}</h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ink-soft)]">
                {cocktail.suitableFor.map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--ink)]">{t("detail.situations")}</h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ink-soft)]">
                {cocktail.situations.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </div>
          </section>

          <div className="flex flex-col gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:flex-row">
            <button
              type="button"
              onClick={onCollect}
              className={`inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium ${
                collected
                  ? "bg-[var(--accent)] text-[var(--foam)]"
                  : "bg-[var(--chip)] text-[var(--ink)]"
              }`}
            >
              <Bookmark className="h-4 w-4 shrink-0" fill={collected ? "currentColor" : "none"} />
              <span className="text-center leading-tight">{collected ? t("detail.inYourBook") : t("card.collect")}</span>
            </button>
            <button
              type="button"
              onClick={onTried}
              className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-medium text-[var(--foam)]"
            >
              <Check className="h-4 w-4 shrink-0" />
              <span className="text-center leading-tight">{t("detail.logAsTried")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
