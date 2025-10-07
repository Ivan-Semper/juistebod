"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 md:p-12" style={{ boxShadow: '0 4px 32px rgba(31,60,136,0.08)' }}>
        <h1 className="text-4xl font-extrabold mb-10 text-center" style={{ color: '#1F3C88' }}>Privacybeleid</h1>
        <div className="space-y-10 text-black text-xl leading-loose">
          <p>
            Dit privacybeleid is van toepassing op de verwerking van persoonsgegevens door <b>JuisteBod.nl</b> via deze website. Wij respecteren jouw privacy en gaan zorgvuldig om met je gegevens.
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-gray-900">1. Welke gegevens verzamelen wij?</h2>
          <ul className="list-disc ml-8 space-y-2 text-lg md:text-xl">
            <li>Naam en achternaam</li>
            <li>E-mailadres (twee keer ter controle)</li>
            <li>Telefoonnummer (optioneel)</li>
            <li>Geslacht, leeftijd, woonsituatie, budget, eerste keer koper</li>
            <li>Adres en kenmerken van de woning waarvoor je advies aanvraagt</li>
            <li>Eventuele aanvullende informatie die je zelf invult</li>
          </ul>
          <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-gray-900">2. Waarom verzamelen wij deze gegevens?</h2>
          <ul className="list-disc ml-8 space-y-2 text-lg md:text-xl">
            <li>Om een persoonlijk bodadvies op maat te kunnen leveren</li>
            <li>Om contact met je op te nemen over je aanvraag</li>
            <li>Voor administratieve en wettelijke verplichtingen</li>
          </ul>
          <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-gray-900">3. Hoe worden je gegevens beveiligd?</h2>
          <p>
            Jouw gegevens worden opgeslagen in een beveiligde database en alleen gebruikt door medewerkers van JuisteBod.nl die betrokken zijn bij het opstellen van het advies. Wij nemen passende technische en organisatorische maatregelen om je gegevens te beschermen tegen verlies of onrechtmatig gebruik.
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-gray-900">4. Bewaartermijn</h2>
          <p>
            Je gegevens worden niet langer bewaard dan noodzakelijk voor het doel waarvoor ze zijn verzameld, tenzij wij wettelijk verplicht zijn gegevens langer te bewaren (bijvoorbeeld voor de belastingdienst).
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-gray-900">5. Delen wij je gegevens met derden?</h2>
          <p>
            Wij delen je gegevens <b>niet</b> met derden, tenzij dit strikt noodzakelijk is voor de uitvoering van onze dienstverlening of om te voldoen aan een wettelijke verplichting.
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-gray-900">6. Jouw rechten</h2>
          <ul className="list-disc ml-8 space-y-2 text-lg md:text-xl">
            <li>Je hebt het recht om je persoonsgegevens in te zien, te corrigeren of te laten verwijderen.</li>
            <li>Je kunt bezwaar maken tegen het gebruik van je gegevens of je toestemming intrekken.</li>
            <li>Stuur hiervoor een e-mail naar <a href="mailto:info@juistebod.nl" className="text-blue-700 underline">info@juistebod.nl</a>.</li>
          </ul>
          <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-gray-900">7. Contact</h2>
          <p>
            Heb je vragen over dit privacybeleid of over jouw gegevens? Neem gerust contact op via <a href="mailto:info@juistebod.nl" className="text-blue-700 underline">info@juistebod.nl</a>.
          </p>
          <p className="text-base text-gray-500 mt-10">Laatst bijgewerkt: juli 2025</p>
        </div>
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => router.push("/checkout")}
            className="px-8 py-4 bg-blue-700 text-white text-lg font-semibold rounded-full shadow hover:bg-blue-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            ← Terug naar gegevens invullen
          </button>
        </div>
      </div>
    </div>
  );
} 