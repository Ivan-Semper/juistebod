export default function StructuredData() {
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'JuisteBod.nl',
    description:
      'Persoonlijk woningbodadvies van ervaren makelaars. Krijg binnen 48 uur een onderbouwd bodadvies voor jouw droomwoning.',
    url: 'https://www.juistebod.nl',
    logo: 'https://www.juistebod.nl/Juistebod%20logo%20voorkant.png',
    image: 'https://www.juistebod.nl/landing_page_photos/margaret-polinder-3DsMhQF9aB0-unsplash.jpg',
    email: 'info@juistebod.nl',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NL',
    },
    priceRange: '€241,94',
    areaServed: {
      '@type': 'Country',
      name: 'Nederland',
    },
    sameAs: [
      'https://www.instagram.com/juistebod',
    ],
  };

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Persoonlijk Woningbodadvies',
    description:
      'Ontvang binnen 48 uur een professioneel en persoonlijk bodadvies van een ervaren makelaar. Inclusief marktanalyse, vergelijking met soortgelijke woningen en een slimme biedstrategie.',
    brand: {
      '@type': 'Brand',
      name: 'JuisteBod.nl',
    },
    offers: {
      '@type': 'Offer',
      price: '241.94',
      priceCurrency: 'EUR',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      url: 'https://www.juistebod.nl',
    },
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Hoe werkt JuisteBod.nl?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vul je postcode en huisnummer in samen met de Funda-link. Vervolgens vul je je contactgegevens in en ontvang je binnen 48 uur een uitgebreid persoonlijk bodadvies in je mailbox.',
        },
      },
      {
        '@type': 'Question',
        name: 'Wat kost een bodadvies bij JuisteBod.nl?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Een persoonlijk woningbodadvies kost €199,95 exclusief BTW, oftewel €241,94 inclusief BTW. Geen verborgen kosten.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hoe snel ontvang ik mijn bodadvies?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Je ontvangt je persoonlijke bodadvies binnen 48 uur na betaling.',
        },
      },
      {
        '@type': 'Question',
        name: 'Wat zit er in het bodadvies?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Je krijgt een marktanalyse met vergelijking van soortgelijke woningen, prijsontwikkeling in de buurt, een optimaal bodbedrag, een onderhandelingsstrategie en tips voor het biedingsproces.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is het advies van JuisteBod door AI gemaakt?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nee, elk advies wordt persoonlijk opgesteld door ervaren makelaars met actuele marktkennis. Geen AI, maar menselijk inzicht.',
        },
      },
    ],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'JuisteBod.nl',
    url: 'https://www.juistebod.nl',
    description:
      'Het juiste bod op elke woning. Persoonlijk woningbodadvies van een vastgoedprofessional.',
    inLanguage: 'nl-NL',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
