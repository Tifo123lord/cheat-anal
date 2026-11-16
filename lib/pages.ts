export interface InfoPage {
  slug: string;
  title: string;
  description: string;
  sections: { heading: string; body: string }[];
}

export const INFO_PAGES: InfoPage[] = [
  {
    slug: 'about',
    title: 'About leafpress',
    description: 'A small marketplace for careful digital files.',
    sections: [
      {
        heading: 'Grown with care',
        body: 'leafpress started as a shared folder between a few friends who made templates and fonts. Today it is a home for independent authors who care about the details.',
      },
      {
        heading: 'What we believe',
        body: 'Fewer, better files. Honest licences. Fair pay for authors. Lighter downloads for a lighter footprint.',
      },
    ],
  },
  {
    slug: 'licenses',
    title: 'Licenses',
    description: 'Personal, Commercial and Extended licences explained.',
    sections: [
      {
        heading: 'Personal',
        body: 'Use the file in your own non-commercial projects, such as a personal site, a gift or a school project.',
      },
      {
        heading: 'Commercial',
        body: 'Use the file in one commercial project, for yourself or a single client. The end product may be sold, but not the file itself.',
      },
      {
        heading: 'Extended',
        body: 'Use the file in a product sold to many end users, such as a template, an app or a print-on-demand design.',
      },
    ],
  },
  {
    slug: 'refunds',
    title: 'Refunds',
    description: 'Our 14-day refund policy.',
    sections: [
      {
        heading: 'When we refund',
        body: 'If a file is broken, missing parts, or not as described, we refund within 14 days of purchase.',
      },
      {
        heading: 'How to ask',
        body: 'Write to us through the Help Center with your order number. We usually reply within one working day.',
      },
    ],
  },
  {
    slug: 'help',
    title: 'Help Center',
    description: 'Answers to common questions about buying and selling.',
    sections: [
      {
        heading: 'Where are my files?',
        body: 'Every purchase appears in My downloads with its licence key. You can download again at any time.',
      },
      {
        heading: 'Can I change my licence?',
        body: 'Yes. Buy the higher licence and we refund the difference of the original purchase on request.',
      },
      {
        heading: 'Is this a real store?',
        body: 'This is a demo. No payments are taken and downloads are placeholder archives.',
      },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    description: 'Get in touch with the leafpress team.',
    sections: [
      { heading: 'Email', body: 'hello@leafpress.example. We read every message.' },
      {
        heading: 'Community',
        body: 'Join the author community chat and the weekly newsletter for news, tips and freebies.',
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of use',
    description: 'The rules for using leafpress.',
    sections: [
      {
        heading: 'Using the store',
        body: 'Be kind, respect authors’ licences and do not redistribute files.',
      },
      {
        heading: 'Authors',
        body: 'Authors must own the rights to everything they upload, including fonts and images inside their files.',
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy',
    description: 'How leafpress handles your data.',
    sections: [
      {
        heading: 'In this demo',
        body: 'Your cart, wishlist, library, reviews and demo account are stored only in your browser’s local storage. Nothing is sent to a server.',
      },
      {
        heading: 'Clearing data',
        body: 'Clear site data in your browser settings to remove everything leafpress stored.',
      },
    ],
  },
];
