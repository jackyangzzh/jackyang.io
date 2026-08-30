---
layout: project
weight: 0
featured: true
title: 'FakeHaul'
description: >
  A fake shopping marketplace where every checkout totals $0.00 and nothing ships. The full dopamine loop of online shopping, minus the purchase.
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
FakeHaul is an e-commerce marketplace I launched in July 2026 where you can browse, hunt for deals, check out, track an order, and open a package, even though every checkout totals $0.00 and nothing ever ships.

[Fast Company](https://www.fastcompany.com/91577117/fake-temu-dopamine-site-gives-shoppers-a-boost-without-buying-anything-online-shopping-addiction), [Newser](https://www.newser.com/story/393338/site-lets-you-gleefully-shop-without-spending-money.html), [t3n](https://t3n.de/news/fake-shop-bestellung-dopamin-1749518/), [Cybernews](https://cybernews.com/tech/digital-diy-ai-projects/), [Digital Trends](https://www.digitaltrends.com/computing/i-tried-the-internets-weirdest-shopping-trend-and-my-brain-fell-for-it-more-than-i-expected/), and [The Cool Down](https://www.thecooldown.com/green-tech/dopamine-sites-south-korea-shopping-trend/) have written about FakeHaul since its launch. More details on their coverage can be found [below](#press-and-uncertainty).
{:.note title="In the press"}

## The idea

I originally thought that blocking shopping sites or unsubscribing from deal emails would help a friend who struggles with impulse shopping. However, those barriers rarely work because they fight against the urge itself.

Since the actual box arriving is often an anticlimax, I hypothesized that the most satisfying part of online shopping is actually the ritual. I wanted to see if completing the loop of finding a deal and clicking checkout could feel satisfying on its own as long as we remove the money and the physical clutter instead of blocking the habit perfectly.

## Building the illusion

FakeHaul is a mobile-first marketplace with about 1,500 fictional products across eight categories. I kept the familiar pressure mechanics like low-stock warnings, live viewer counts, a daily spin wheel, and coupons that expire after five minutes.

Because the interface cannot look like a joke while keeping the ritual immersive, the challenge was to create convincing fake commerce without deceiving anyone. While product cards might say "only 6 left," the header makes it explicitly clear that checkout never charges a cent. The cart and wishlist stay in your local browser, meaning there are no accounts required.

After checkout, the interface simulates an order moving through its packed, shipped, and delivered states. The virtual package then shakes until you tap it, which triggers a confetti burst and reveals the retail value you "scored" for free. I tuned the timing of this unboxing payoff using Framer Motion because if the confetti arrives before the lid moves, the satisfaction of the reveal is ruined.

## Generating the catalog

Because lorem ipsum would have broken the illusion immediately, the catalog required as much writing as engineering.

While I generated records using Azure OpenAI to build a typed product model covering names, prices, ratings, and variants, I treated the generated output largely as a draft. I went through and edited the listings manually until they sounded like real product pages because I did not want people exploring the site to see the same handful of AI jokes repeated.

The live marketplace reads static catalog data and pre-compressed WebP images, so browsing never feels slow or waits on a model call.

## The constraints

Throughout the process, I had to ensure that I was not just building another manipulative store. Even though a countdown still had to create urgency, the surrounding copy had to turn that urgency into something the user could consciously acknowledge. Scarcity never leads to a payment on FakeHaul, and the tracking timeline ends in a tap-to-open animation instead of a commercial product.

I built the app with Next.js 16's App Router, React 19, TypeScript, and Tailwind CSS 4. Zustand handles local persistence for the cart and orders, while Vercel provides hosting and Vercel Blob manages the static asset pipeline.

## Press and uncertainty

FakeHaul was picked up in July 2026 during a wider run of coverage on "dopamine sites" that simulate consumption without selling anything.

- [Fast Company](https://www.fastcompany.com/91577117/fake-temu-dopamine-site-gives-shoppers-a-boost-without-buying-anything-online-shopping-addiction) covered the site and questioned the very part I had not resolved. Due to the fact that FakeHaul keeps habit-forming mechanics like the once-a-day coupon spin, it remains an open question whether it actually helps.
- [Newser](https://www.newser.com/story/393338/site-lets-you-gleefully-shop-without-spending-money.html) focused on how completely the catalog is invented.
- [t3n](https://t3n.de/news/fake-shop-bestellung-dopamin-1749518/) viewed it as a parody of the mechanics online retailers use.
- [Cybernews](https://cybernews.com/tech/digital-diy-ai-projects/) asked what AI makes possible for personal projects. In my conversation with them, I confirmed that FakeHaul collects no accounts, no email, and no IP tracking. While this costs me any way of knowing whether people come back, I personally would rather not collect that data in the first place.
- [Digital Trends](https://www.digitaltrends.com/computing/i-tried-the-internets-weirdest-shopping-trend-and-my-brain-fell-for-it-more-than-i-expected/) used FakeHaul instead of only summarizing it. The writer filled a cart, felt a flicker of urgency from a midnight countdown on a product that was never manufactured, and kept checking out at $0.00. She does not think sites like this cure impulse spending, because the browsing-and-checkout ritual is still being rehearsed.
- [The Cool Down](https://www.thecooldown.com/green-tech/dopamine-sites-south-korea-shopping-trend/) framed FakeHaul as a way to ride out a shopping urge without spending money, while noting that moving the ritual into a zero-cost simulation may redirect compulsive behavior rather than resolve it.

I am still not completely sure about the behavioral outcome of this project. While the person FakeHaul was first built for says it helps, a moderator of a shopping-addiction community told me that rehearsing the ritual could unfortunately reinforce the habit instead. I built this as an entertainment product exploring a behavioral hypothesis, and if the people using it ever tell me it makes the habit worse, I am fully prepared to take it down.
