"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Bookmark, Check, GlassWater, Wrench, ShoppingBag, ChevronDown } from "lucide-react";
import type { Cocktail } from "@/lib/types";
import { useI18n } from "@/components/LanguageProvider";
import { useCocktailImage, useCocktailImages } from "@/components/CocktailImageProvider";
import { useShop } from "@/components/useShop";
import { useCart } from "@/components/CartProvider";
import { useProductPrices } from "@/components/ProductPriceProvider";
import { expandMakeSteps, inferEquipment, preparationChecklistSteps } from "@/lib/make-guide";
import {
  productImageClass,
  productImageUnoptimized,
  productsForCocktailIngredients,
} from "@/lib/products";
import { getCocktailGallery, mergeCocktailGallery, type GalleryImage } from "@/lib/cocktail-gallery";
import { convertMeasure } from "@/lib/units";
import { equipmentInfo, glassInfo, ingredientInfo } from "@/lib/item-info";
import { useMeasureUnit } from "@/components/MeasureUnitProvider";
import { ItemInfoTrigger } from "@/components/ItemInfoTrigger";
import { useLocalizedCocktail, useTranslatedTexts } from "@/components/useTranslatedContent";
import type { Product } from "@/lib/commerce-types";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { cocktailSeoPath } from "@/lib/seo";

type Props = {
  cocktail: Cocktail;
  collected: boolean;
  onClose: () => void;
  onCollect: () => void;
  onTried: () => void;
};

function LocalizedProductLabel({ product }: { product: Product }) {
  const { texts } = useTranslatedTexts([product.name], `product-name:${product.id}`);
  return <>{texts[0] || product.name}</>;
}

export function CocktailDetail({
  cocktail,
  collected,
  onClose,
  onCollect,
  onTried,
}: Props) {
  const { t } = useI18n();
  const shop = useShop();
  const { addItem } = useCart();
  const { formatProduct } = useProductPrices();
  const { unit } = useMeasureUnit();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [extraGallery, setExtraGallery] = useState<GalleryImage[]>([]);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [failedGalleryIds, setFailedGalleryIds] = useState<Set<string>>(new Set());
  const localized = useLocalizedCocktail(cocktail);
  const imageSrc = useCocktailImage(cocktail);
  const { overrides } = useCocktailImages();
  useBodyScrollLock();

  const equipment = useMemo(() => inferEquipment(cocktail), [cocktail]);
  const recipeSteps = useMemo(() => expandMakeSteps(localized), [localized]);
  const displayCocktail = useMemo(
    () => ({ ...cocktail, image: imageSrc }),
    [cocktail, imageSrc],
  );
  const localGallery = useMemo(
    () => getCocktailGallery(displayCocktail, 6, overrides),
    [displayCocktail, overrides],
  );
  const gallery = useMemo(
    () =>
      mergeCocktailGallery(extraGallery, localGallery, 6).filter(
        (image) => !failedGalleryIds.has(image.id),
      ),
    [localGallery, extraGallery, failedGalleryIds],
  );

  useEffect(() => {
    setGalleryIndex(0);
    setShopOpen(false);
    setExtraGallery([]);
    setGalleryLoaded(false);
    setFailedGalleryIds(new Set());
    const ac = new AbortController();
    let active = true;
    fetch(`/api/cocktail-photos?id=${encodeURIComponent(cocktail.id)}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : { photos: [] }))
      .then((data: { photos?: GalleryImage[] }) => {
        if (active) setExtraGallery(Array.isArray(data.photos) ? data.photos : []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setGalleryLoaded(true);
      });
    return () => {
      active = false;
      ac.abort();
    };
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
    const checklist = preparationChecklistSteps(
      localized,
      equipment,
      {
        ingredients: t("detail.ingredients"),
        materials: t("detail.materials"),
        servingVessel: t("detail.servingVessel"),
        utensils: t("detail.utensils"),
        toTaste: t("detail.toTaste"),
      },
      (measure) => convertMeasure(measure, unit),
      (id) => t(`equipment.${id}`),
    );
    return [
      ...checklist,
      t("detail.prepGlassStep", { glass: localized.glass }),
      ...recipeSteps,
      t("detail.finishStep"),
    ];
  }, [localized, equipment, recipeSteps, t, unit]);

  const activeGallery = gallery[galleryIndex] ?? gallery[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-x-hidden overscroll-contain bg-[rgba(20,16,12,0.55)] p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label={t("detail.close")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cocktail-detail-title"
        className="relative z-10 flex max-h-[100svh] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.5rem] bg-[var(--surface)] shadow-2xl sm:max-h-[92vh] sm:rounded-[1.75rem]"
      >
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        <div className="relative h-[min(38vh,15.5rem)] w-full sm:aspect-[4/3] sm:h-auto sm:min-h-80">
          <Image
            src={imageSrc}
            alt={localized.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
            priority
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute end-3 top-[max(0.75rem,env(safe-area-inset-top))] inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(28,22,16,0.6)] text-[var(--foam)] backdrop-blur sm:end-4 sm:top-4"
            aria-label={t("detail.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:space-y-6 sm:p-6">
          <header>
            <p className="break-words text-xs font-medium tracking-[0.18em] uppercase text-[var(--accent-deep)]">
              {localized.category}
              {cocktail.iba ? ` · IBA ${cocktail.iba}` : ""}
            </p>
            <h2 id="cocktail-detail-title" className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--ink)] sm:text-3xl">
              {localized.name}
            </h2>
            <Link
              href={cocktailSeoPath(cocktail)}
              className="mt-2 inline-flex text-sm text-[var(--accent-deep)] underline-offset-2 hover:underline"
            >
              Open full recipe page
            </Link>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{localized.origin}</p>
          </header>

          {galleryLoaded && gallery.length > 1 && (
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
                    quality={90}
                    onError={() =>
                      setFailedGalleryIds((current) => new Set(current).add(activeGallery.id))
                    }
                  />
                )}
                {activeGallery && (
                  <span className="absolute bottom-3 start-3 rounded-full bg-[rgba(28,22,16,0.7)] px-3 py-1 text-xs text-[var(--foam)] backdrop-blur">
                    {activeGallery.label}
                  </span>
                )}
                {activeGallery?.credit && activeGallery.creditUrl && (
                  <a
                    href={activeGallery.creditUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-3 end-3 max-w-[55%] truncate rounded-full bg-[rgba(28,22,16,0.7)] px-3 py-1 text-[10px] text-[var(--foam)] backdrop-blur hover:underline"
                    title={`${activeGallery.credit}${activeGallery.license ? ` · ${activeGallery.license}` : ""}`}
                  >
                    {shop.photo}: {activeGallery.credit}
                  </a>
                )}
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#efe8dc] ring-2 transition sm:h-20 sm:w-20 ${
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
                      quality={85}
                      onError={() =>
                        setFailedGalleryIds((current) => new Set(current).add(img.id))
                      }
                    />
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold text-[var(--ink)]">{t("detail.theTale")}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-soft)]">
              {localized.story}
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-[var(--ink)]">{t("detail.bestFor")}</h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ink-soft)]">
                {localized.suitableFor.map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--ink)]">{t("detail.situations")}</h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ink-soft)]">
                {localized.situations.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[var(--ink)]">{t("detail.ingredients")}</h3>
            <ul className="mt-2 space-y-2">
              {cocktail.ingredients.map((ing, ingredientIndex) => (
                <li
                  key={ing.name}
                  className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-2 text-sm"
                >
                  <ItemInfoTrigger info={ingredientInfo(ing.name)} className="min-w-0">
                    <span className="break-words text-[var(--ink)]">
                      {localized.ingredients[ingredientIndex]?.name || ing.name}
                    </span>
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
                  <span>{localized.glass}</span>
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
                    {shopProducts.map((p) => {
                      const imageUrl = p.images[0]?.url || "/cocktail-fallback.svg";
                      return (
                        <li
                          key={p.id}
                          className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2 rounded-xl bg-[var(--surface)] p-2 ring-1 ring-[var(--line)] sm:flex sm:gap-3"
                        >
                          <Link
                            href={`/market/${p.slug}`}
                            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f3efe6]"
                          >
                            <Image
                              src={imageUrl}
                              alt={p.images[0]?.alt || p.name}
                              fill
                              className={productImageClass(imageUrl, "thumb")}
                              sizes="56px"
                              unoptimized={productImageUnoptimized(imageUrl)}
                            />
                          </Link>
                          <Link href={`/market/${p.slug}`} className="min-w-0 flex-1">
                            <p className="truncate text-sm text-[var(--ink)]">
                              <LocalizedProductLabel product={p} />
                            </p>
                            <p className="text-xs text-[var(--ink-muted)]">
                              {formatProduct(p)}
                            </p>
                          </Link>
                          <button
                            type="button"
                            onClick={() => addItem(p.id, 1)}
                            className="col-span-2 min-h-11 rounded-full bg-[var(--ink)] px-3 py-2 text-xs text-[var(--foam)] sm:col-auto sm:min-h-0 sm:shrink-0 sm:py-1.5 sm:text-[11px]"
                          >
                            {shop.addToCart}
                          </button>
                        </li>
                      );
                    })}
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

          <div className="sticky bottom-0 z-10 -mx-4 mt-2 flex flex-col gap-2 border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:mt-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:pb-0 sm:backdrop-blur-none sm:flex-row">
            <button
              type="button"
              onClick={onCollect}
              className={`inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium ${
                collected
                  ? "bg-[var(--accent)] text-[var(--foam)]"
                  : "bg-[var(--chip)] text-[var(--ink)]"
              }`}
            >
              <Bookmark className="h-4 w-4 shrink-0" fill={collected ? "currentColor" : "none"} />
              <span className="truncate text-center leading-tight">{collected ? t("detail.inYourBook") : t("card.collect")}</span>
            </button>
            <button
              type="button"
              onClick={onTried}
              className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-medium text-[var(--foam)]"
            >
              <Check className="h-4 w-4 shrink-0" />
              <span className="truncate text-center leading-tight">{t("detail.logAsTried")}</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
