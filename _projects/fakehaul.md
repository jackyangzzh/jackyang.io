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
FakeHaul is a fake shopping marketplace I launched in July 2026. It keeps the full online-shopping ritual: you browse, hunt for deals, fill a cart, check out, track an order, and open a package. Every checkout totals $0.00, and nothing ships.

## The idea

The satisfying part of online shopping is usually the ritual, not the package: browsing, finding a deal, watching a timer, and feeling the checkout spark. The box arriving is often the anticlimax.

I first built FakeHaul for someone close to me who struggles with impulse shopping. Blocking sites, unsubscribing from deal emails, and waiting before a purchase had not changed the urge. The experiment was to remove the money and clutter instead of blocking the ritual.

That was a behavioral hypothesis, not a result. I wanted to see whether completing the loop with nothing at stake felt satisfying on its own.

## What it is

FakeHaul is a mobile-first marketplace with about 1,500 fictional products across eight categories. Each listing has original copy, a price, ratings, reviews, a seller, stock counts, and variants. Seller pages, search, category browsing, and product recommendations make it behave like a real catalog.

The familiar pressure mechanics are there too, rebuilt as parody: low-stock warnings, live viewer counts, lightning-deal timers, a daily spin wheel, and coupons that expire after five minutes. The cart and wishlist stay in the browser, so there are no accounts. Checkout uses a slide-to-confirm interaction and always reduces the total to $0.00.

After checkout, a simulated order moves through packed, shipped, out for delivery, and delivered states. The package then shakes until it is tapped, opens with confetti, and reveals the retail value "scored" for free. The session ends with a shareable receipt for the money kept.

![FakeHaul marketplace showing fictional products, lightning deals, ratings, and a $0.00 cart](/assets/img/projects/fakehaul-browse.webp){:loading="lazy"}

## Engineering the illusion

The hard part was making fake commerce feel convincing without deceiving anyone. If the interface looked like a joke, the ritual did not work. If it copied its source material too closely without a clear frame, the parody just became another manipulative store.

### Convincing without deception

I kept the interaction language recognizable while making the premise explicit. Product cards can say "only 6 left," but the header says checkout never charges a cent. Coupons change the fictional subtotal, but the final total is always $0.00. The site asks for no card, account, shipping address, or payment information, and it labels the products, prices, reviews, sellers, and orders as invented.

The tension was useful. A countdown still had to create urgency, but the surrounding copy had to turn that urgency into something the user could notice rather than obey.

![FakeHaul daily spin, expiring coupon, and lightning-deal countdown](/assets/img/projects/fakehaul-mechanics.webp){:loading="lazy"}

### Building a catalog that could carry the joke

Lorem ipsum would have broken the illusion immediately, so the catalog needed as much writing as engineering.

- A curated base catalog and generated records are assembled into one typed product model covering names, prices, ratings, review counts, sellers, stock, tags, variants, and descriptions.
- An offline generation pipeline creates products in balanced category batches, skips duplicate slugs, rejects real trademarks, and constrains numerical fields to plausible ranges.
- Separate editing and repair passes expand thin descriptions and fix weak variant sets. I treated generated output as a draft, then wrote or edited listings until they read like product pages instead of filler.
- Product images are generated and compressed to WebP before deployment. The live marketplace reads static catalog data and image manifests, so browsing never waits on a model call.

The result is large enough to browse without seeing the same handful of jokes repeated, while still being inspectable as a finite dataset.

### Timing the unboxing payoff

The unboxing sequence is only a little code, but the timing turned out to be the fussy part. A sealed package rattles until the shopper taps it. That tap changes the state, triggers sound and haptic feedback, throws the lid, starts the glow and sparks, and launches a canvas-confetti burst from the package's position.

I coordinated the box, lid, rays, and text reveal with Framer Motion, then tuned the transitions as one beat. If the confetti arrived before the lid moved, it spoiled the reveal. If it landed too late, it felt disconnected. Reduced-motion handling removes the repeating shake and confetti while preserving the state change and value reveal.

![FakeHaul unboxing payoff showing an opened package and $114.98 in fictional value delivered](/assets/img/projects/fakehaul-unboxing.webp){:loading="lazy"}

### Satire as a design constraint

Every feature got the same check: was I exposing the machinery or just using it? I kept the mechanics that make the ritual legible and removed the commercial destination. Scarcity never leads to a payment. Coupons discount a total that is already zero. The tracking timeline ends in a tap-to-open animation, not a product. The receipt closes on money kept, not merchandise.

This did not make every choice harmless on its own. It kept the open question in front of me instead of letting me hide it.

## Stack

I built FakeHaul with Next.js 16's App Router, React 19, TypeScript, and Tailwind CSS 4. Zustand persists the cart, wishlist, profile, and orders locally in the browser. Framer Motion handles the interaction sequences, and canvas-confetti handles the larger payoffs.

The app is hosted on Vercel with Vercel Analytics. Catalog content is generated offline with Azure OpenAI, and the image pipeline uses Vercel Blob while preparing static assets for the deployed marketplace. No model or commerce service is called during ordinary browsing or checkout.

## Reflection

The central question is still open. The person FakeHaul was first built for says it helps. A moderator of a shopping-addiction community told me that rehearsing the ritual could reinforce the habit instead. Neither anecdote is evidence, and I can make a plausible argument in both directions.

FakeHaul may let someone complete an impulse without making a purchase, or it may keep the loop warm. I built it as an entertainment product carrying that unresolved behavioral hypothesis, not as therapy or treatment.

That uncertainty belongs in the project. The interface was an exercise in catalog systems, client-side state, motion timing, and product restraint. The harder part was building a faithful parody without pretending I already knew what effect it would have.