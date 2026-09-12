---
layout: project
weight: 0
featured: true
title: 'FakeHaul'
description: >
  A pretend shopping marketplace where every checkout is $0.00 and nothing ships. The ritual of online shopping, without spending money.
date: '07-01-2026'
category: personal
image:
  path: /assets/img/projects/fakehaul.webp
  alt: FakeHaul checkout graphic showing a $1,248.50 cart reduced to $0.00
links:
  - title: Live site
    url: https://fakehaul.com/
  - title: Product Hunt launch
    url: https://www.producthunt.com/products/fakehaul
  - title: Origin story on Medium
    url: https://jackyangzzh.medium.com/i-built-a-fake-shopping-app-nothing-ships-it-might-be-the-most-useful-thing-ive-made-220919e6b6ce

---
I launched FakeHaul in July 2026 to explore a simple question: can shopping feel satisfying without buying anything? You can browse, hunt for deals, check out, track an order, and open a virtual package. You never pay, and nothing ships.

FakeHaul has been covered by The New York Times, Fast Company, Digital Trends, Newser, t3n, Cybernews, and The Cool Down. [Read the coverage and the questions it raised](#press-and-uncertainty).
{:.note title="In the press"}

## The idea

A friend struggles with impulse shopping. My first thought was to block shopping sites or unsubscribe from deal emails, but I wondered whether there was another approach.

Sometimes finding the deal feels better than receiving the box. I wanted to test whether the browsing-and-checkout ritual could stand on its own, with no money spent and no clutter arriving at the door. That's a hypothesis, not a claim that the app treats compulsive shopping.

## Building the illusion

I built a mobile-first marketplace with about 1,500 fictional products across eight categories. It has the familiar mechanics: low-stock warnings, viewer counts, a daily spin wheel, and five-minute coupons.

The tricky part was making it feel like a store without misleading anyone about what it does. A product card might say "only 6 left," but the header makes clear that checkout never charges a cent. The cart and wishlist stay in the browser. No account is needed.

After checkout, the order moves through packed, shipped, and delivered states. A virtual package shakes until you tap it, then opens with confetti and a reveal of the retail value you "scored." I spent time tuning that sequence in Framer Motion. Confetti before the lid moves just feels wrong.

## Generating the catalog

The catalog took as much writing as engineering. Placeholder text would have given the game away.

I used Azure OpenAI to generate structured records for product names, prices, ratings, and variants, then edited the listings by hand. The model gave me a draft, not a finished catalog. I didn't want people browsing through the same handful of AI jokes.

The live site reads static catalog data and compressed WebP images. Browsing doesn't wait on a model call.

## The constraints

I kept coming back to the same tension: the app borrows pressure tactics from online stores, even though it doesn't sell anything. Clear copy and a zero-dollar checkout make the premise explicit. They don't settle the question of what repeating the ritual does to someone's habits.

The app uses Next.js 16's App Router, React 19, TypeScript, and Tailwind CSS 4. Zustand persists the cart and orders locally. Vercel hosts the app, and Vercel Blob stores the static assets.

## Press and uncertainty

Coverage started in July 2026, during a wider conversation about "dopamine sites" that simulate consumption without selling anything, and it continued into September.

- [The New York Times](https://www.nytimes.com/2026/09/11/world/asia/dopamine-sites-popularity.html) placed FakeHaul within the South Korean "dopamine site" trend and traced the idea back to the friend I built it for. The piece also raised the objection I keep hearing, that a daily spin and a pretend delivery tracker can become an engagement loop of their own.
- [Fast Company](https://www.fastcompany.com/91577117/fake-temu-dopamine-site-gives-shoppers-a-boost-without-buying-anything-online-shopping-addiction) questioned whether keeping habit-forming mechanics, such as the daily spin, could undermine the idea.
- [Digital Trends](https://www.digitaltrends.com/computing/i-tried-the-internets-weirdest-shopping-trend-and-my-brain-fell-for-it-more-than-i-expected/) tried the site. The writer described feeling urgency from a countdown on a product that didn't exist, while questioning whether rehearsing checkout helps with impulse spending.
- [Newser](https://www.newser.com/story/393338/site-lets-you-gleefully-shop-without-spending-money.html) focused on how completely the catalog is invented.
- [t3n](https://t3n.de/news/fake-shop-bestellung-dopamin-1749518/) read it as a parody of online retail mechanics.
- [Cybernews](https://cybernews.com/tech/digital-diy-ai-projects/) explored what AI makes possible for personal projects. We also discussed my choice not to collect accounts, email addresses, or IP-based tracking data. That leaves me without retention data, a trade-off I'm comfortable with.
- [The Cool Down](https://www.thecooldown.com/green-tech/dopamine-sites-south-korea-shopping-trend/) looked at shopping without spending, with the caveat that redirecting a habit isn't the same as resolving it.

I don't know whether FakeHaul helps people change their shopping habits. The friend I built it for says it helps; a moderator of a shopping-addiction community warned me that rehearsing the ritual could reinforce it. Neither is enough to establish a broader outcome. This is an entertainment product exploring an idea, not a treatment. If people tell me it's making things worse, I'm prepared to take it down.
