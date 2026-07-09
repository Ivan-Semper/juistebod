"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5 md:p-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">JuisteBod.nl</p>
          <h1 className="font-serif text-4xl tracking-tight text-gray-900 mb-8">Privacybeleid</h1>

          <div className="space-y-8 text-base leading-relaxed text-gray-700">
            <p>
              Dit privacybeleid is van toepassing op de verwerking van persoonsgegevens door{' '}
              <strong>JuisteBod.nl</strong> via deze website. Wij respecteren jouw privacy en gaan
              zorgvuldig om met je gegevens.
            </p>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">1. Welke gegevens verzamelen wij?</h2>
              <ul className="ml-5 list-disc space-y-1.5">
                <li>Voor- en achternaam</li>
                <li>E-mailadres (geverifieerd met een bevestigingscode)</li>
                <li>Telefoonnummer</li>
                <li>Adres en Funda-link van de woning waarvoor je advies aanvraagt</li>
                <li>Eventuele aanvullende informatie die je zelf invult</li>
                <li>Betaalgegevens worden verwerkt door onze betaalprovider Mollie; wij slaan zelf geen rekening- of kaartgegevens op</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">2. Waarom verzamelen wij deze gegevens?</h2>
              <ul className="ml-5 list-disc space-y-1.5">
                <li>Om een persoonlijk bodadvies op maat te kunnen leveren</li>
                <li>Om contact met je op te nemen over je aanvraag</li>
                <li>Voor administratieve en wettelijke verplichtingen</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">3. Hoe worden je gegevens beveiligd?</h2>
              <p>
                Jouw gegevens worden opgeslagen in een beveiligde database en alleen gebruikt door
                medewerkers van JuisteBod.nl die betrokken zijn bij het opstellen van het advies. Wij
                nemen passende technische en organisatorische maatregelen om je gegevens te beschermen
                tegen verlies of onrechtmatig gebruik.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">4. Bewaartermijn</h2>
              <p>
                Je gegevens worden niet langer bewaard dan noodzakelijk voor het doel waarvoor ze zijn
                verzameld, tenzij wij wettelijk verplicht zijn gegevens langer te bewaren (bijvoorbeeld
                voor de belastingdienst).
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">5. Delen wij je gegevens met derden?</h2>
              <p>
                Wij delen je gegevens <strong>niet</strong> met derden, tenzij dit strikt noodzakelijk
                is voor de uitvoering van onze dienstverlening (zoals de betaalafhandeling via Mollie
                en het versturen van e-mails) of om te voldoen aan een wettelijke verplichting.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">6. Jouw rechten</h2>
              <ul className="ml-5 list-disc space-y-1.5">
                <li>Je hebt het recht om je persoonsgegevens in te zien, te corrigeren of te laten verwijderen.</li>
                <li>Je kunt bezwaar maken tegen het gebruik van je gegevens of je toestemming intrekken.</li>
                <li>
                  Stuur hiervoor een e-mail naar{' '}
                  <a href="mailto:info@juistebod.nl" className="font-medium text-[#1F3C88] hover:underline">info@juistebod.nl</a>.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">7. Contact</h2>
              <p>
                Heb je vragen over dit privacybeleid of over jouw gegevens? Neem gerust contact op via{' '}
                <a href="mailto:info@juistebod.nl" className="font-medium text-[#1F3C88] hover:underline">info@juistebod.nl</a>.
              </p>
            </div>

            <p className="text-sm text-gray-400">Laatst bijgewerkt: juli 2026</p>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-[#1F3C88] px-7 py-3 font-semibold text-white shadow-md transition-all hover:bg-[#162E6B] hover:shadow-lg"
          >
            ← Terug
          </button>
        </div>
      </div>
    </div>
  );
}
