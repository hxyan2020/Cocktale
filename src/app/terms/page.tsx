"use client";

import { AppNav } from "@/components/AppNav";
import { useI18n } from "@/components/LanguageProvider";
import { useTranslatedTexts } from "@/components/useTranslatedContent";

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Agreement",
    body: [
      "By accessing or using Cocktale (the “Service”), you agree to these Terms of Use. If you do not agree, do not use the Service.",
      "Cocktale provides cocktail discovery, collection, tasting notes, and related shopping features. Some features may require an account.",
    ],
  },
  {
    heading: "2. Eligibility and accounts",
    body: [
      "You must be of legal drinking age in your jurisdiction to use the Service. Where local law sets a higher age, that higher age applies.",
      "You are responsible for keeping your login details secure and for activity under your account. Provide accurate information and update it when it changes.",
    ],
  },
  {
    heading: "3. Responsible use",
    body: [
      "Cocktail recipes, stories, and product information are for personal, non-commercial enjoyment and education. Always drink responsibly and never drink and drive.",
      "Recipe measures, techniques, and product availability can vary. Verify ingredients, allergens, and preparation steps before making or consuming any drink.",
      "Do not misuse the Service, attempt unauthorized access, scrape content at scale, interfere with other users, or use the Service for unlawful activity.",
    ],
  },
  {
    heading: "4. Content and intellectual property",
    body: [
      "Cocktale and its licensors own the Service’s branding, software, and curated presentation. Recipe source data and images may come from third-party databases or contributors under their respective licenses.",
      "You may keep personal tasting notes and collections for your own use. You grant Cocktale a limited license to store and display that content as needed to operate the Service.",
      "Do not copy, redistribute, or commercially exploit Service content except as allowed by applicable licenses or with our written permission.",
    ],
  },
  {
    heading: "5. Orders and payments",
    body: [
      "If you purchase products through Cocktale, additional checkout terms from our payment processor (such as Stripe) and any seller policies may apply.",
      "Prices, stock, shipping, and taxes are shown at checkout when available. We may cancel or refund orders that cannot be fulfilled, appear fraudulent, or violate these Terms.",
    ],
  },
  {
    heading: "6. Third-party services",
    body: [
      "The Service may link to Telegram, email providers, payment processors, weather data, image hosts, or other third parties. Their terms and privacy practices govern your use of those services.",
    ],
  },
  {
    heading: "7. Disclaimers",
    body: [
      "The Service is provided “as is” and “as available.” To the fullest extent permitted by law, Cocktale disclaims warranties of accuracy, merchantability, fitness for a particular purpose, and non-infringement.",
      "We do not guarantee uninterrupted access, error-free recommendations, or that every cocktail photo, recipe step, or product listing is complete or current.",
    ],
  },
  {
    heading: "8. Limitation of liability",
    body: [
      "To the fullest extent permitted by law, Cocktale and its operators are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, profits, or goodwill arising from your use of the Service.",
      "Our total liability for any claim relating to the Service is limited to the greater of (a) the amount you paid to Cocktale for the transaction giving rise to the claim in the 12 months before the claim, or (b) SGD 50.",
    ],
  },
  {
    heading: "9. Changes and termination",
    body: [
      "We may update these Terms or the Service at any time. Continued use after changes means you accept the updated Terms. We may suspend or end access if you breach these Terms or if we discontinue the Service.",
    ],
  },
  {
    heading: "10. Contact",
    body: [
      "Questions about these Terms: hello@cocktale.app, or customer service on Telegram at +65 9131 9481.",
    ],
  },
];

export default function TermsPage() {
  const { t } = useI18n();
  const source = SECTIONS.flatMap((section) => [section.heading, ...section.body]);
  const { texts } = useTranslatedTexts(source, "terms-body");
  let textIndex = 0;
  const localizedSections = SECTIONS.map((section) => ({
    heading: texts[textIndex++] || section.heading,
    body: section.body.map((paragraph) => texts[textIndex++] || paragraph),
  }));

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--on-bg)]">
          {t("terms.title")}
        </h1>
        <p className="mt-2 text-sm text-[var(--on-bg-muted)]">{t("terms.updated")}</p>

        <div className="mt-8 space-y-6 rounded-[1.5rem] bg-[var(--surface)] p-6 ring-1 ring-[var(--line)] sm:p-8">
          {localizedSections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                {section.heading}
              </h2>
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-[var(--ink-soft)]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
