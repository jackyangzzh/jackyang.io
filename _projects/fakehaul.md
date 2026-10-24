---
layout: project
weight: 0
featured: true
title: 'FakeHaul'
description: >
  A case study in agent-driven development: building a fictional marketplace through coding agents, offline AI pipelines, and human review.
date: '2026-07-01'
category: personal
image:
  path: /assets/img/projects/fakehaul.webp
  srcset:
    - [480, /assets/img/projects/fakehaul-480.webp]
    - [720, /assets/img/projects/fakehaul-720.webp]
    - [960, /assets/img/projects/fakehaul-960.webp]
    - [1200, /assets/img/projects/fakehaul.webp]
  alt: FakeHaul checkout graphic showing a $1,248.50 cart reduced to $0.00
  # Native shape for the case-study hero; crops elsewhere keep the headline (left).
  ratio: 40 / 21
  position: left
links:
  - title: Live site
    url: https://fakehaul.com/
  - title: Product Hunt launch
    url: https://www.producthunt.com/products/fakehaul
  - title: Origin story on Medium
    url: https://jackyangzzh.medium.com/i-built-a-fake-shopping-app-nothing-ships-it-might-be-the-most-useful-thing-ive-made-220919e6b6ce

---
I built FakeHaul for a friend who struggles with impulse shopping. **1,800 fictional products, tracking, unboxing, and receipts recreate the shopping ritual; checkout always ends at $0.00.** Coding agents helped me build and refine it. My work was to set direction, question results, and decide what shipped.

{% include pro/project-video.html id="BnSd8iSkFLQ" title="TODAY: New Simulated Shopping Sites Offer Thrill Without the Bill" start=62 caption="FakeHaul appears at 1:02. Playback starts there." %}

FakeHaul has been covered by TODAY, The New York Times, Fast Company, MarketWatch, and Digital Trends, and mentioned by the BBC, NPR, Vice, CBC, and Futurism, among others. [Read the coverage and the questions it raised](#press-and-uncertainty).
{:.note title="In the press"}

## Directing the agents

GitHub Copilot handled the original build; Claude Code worked on UX and receipts; ChatGPT and Codex helped with cleanup and the hosting migration. **I gave each task an objective, context, limits, and acceptance checks**, then reviewed the diff, rendered result, and test evidence.

Hermes came later as a coordinator across applications. It can pass bounded work to coding tools, check their results through Git and the browser, and retain useful procedures as skills. The tools worked at different times, with deliberately selected context.

{% include pro/diagram.html
  src="/assets/img/projects/fakehaul/08-hermes-coordination.svg"
  title="Hermes coordinates across applications"
  height="670"
  alt="I set intent and limits. Hermes routes tasks to coding tools, the browser, and shell; collects diffs, test output, and rendered results; and returns evidence for my decisions. Useful procedures become reusable skills."
  caption="The later coordination setup. Dashed lines show available access routes; Hermes did not orchestrate the original July build."
%}

## Building the content pipeline

**AI generation happens offline.** Models draft listings, fictional reviews, and product images. Scripts validate fields, checkpoint batches, and publish stored assets; I review tone and visual consistency. Browsing never waits on a model call.

The Next.js storefront serves that content, while Zustand keeps carts and orders in the browser. Versioned image URLs remain available for saved items. There is no shopper database or cross-device recovery.

{% include pro/diagram.html
  src="/assets/img/projects/fakehaul/13-product-factory.svg"
  title="The product factory"
  height="1170"
  alt="Human direction feeds catalog generation and validation, then separate image, review, and authored-pack pipelines. Approved images become versioned WebPs; reviews become shards or stored profiles. Server and browser assemble the storefront from these artifacts."
  caption="Separate pipelines feed one storefront. Products, sellers, reviews, and activity counts are fictional. The image lane shows the approved-publish workflow."
%}

## Reviewing what looked finished

When I asked whether the on-screen and shared receipts matched, Claude Code found the same item priced at **$24.99 in one and $79.99 in the other**. I approved a shared pricing module and matching presentation.

During the Railway migration, a share-image response passed status and dimension checks but showed a letter tile instead of a product photo. The fix corrected an asset fetch behind the proxy; the new check looks for the photo itself. **The acceptance criteria had to describe the experience.**

{% include pro/diagram.html
  src="/assets/img/projects/fakehaul/09-automation-human-gates.svg"
  title="Automate the execution, keep the decisions"
  height="570"
  alt="Set an objective, scope a task, execute, produce artifacts, check evidence, and accept or reject. Approved live changes are applied and verified; rejected work returns to the objective."
  caption="A working practice across tools. Approval was a process boundary, not an enforced release gate; an autodeploying branch push could release the app."
%}

## What shipped

I launched in July 2026. Vercel's **monthly Visitors grew from 828 in July to 14,375 in September**. Feedback led to a local weekly report, a vintage category, and larger controls. The project demonstrates shipping, iteration, and reach; whether rehearsing shopping helps people remains unresolved.

## Press and uncertainty

Coverage started in July 2026, during a wider conversation about "dopamine sites" that simulate consumption without selling anything, and it continued into October.

<div class="press-quotes-grid">
  <a href="https://www.nytimes.com/2026/09/11/world/asia/dopamine-sites-popularity.html" class="press-quote-card no-mark-external" target="_blank" rel="noopener noreferrer">
    <span class="press-source">The New York Times</span>
    <span class="press-quote">Placed FakeHaul within the trend and traced the idea back to the friend I built it for.</span>
    <span class="press-link-label">Read article ↗</span>
  </a>
  <a href="https://www.bbc.com/news/articles/cwn741v5rdpxo" class="press-quote-card no-mark-external" target="_blank" rel="noopener noreferrer">
    <span class="press-source">BBC</span>
    <span class="press-quote">Cited FakeHaul among the sites carrying the trend internationally and examined the psychology of anticipation versus ownership.</span>
    <span class="press-link-label">Read article ↗</span>
  </a>
  <a href="https://www.fastcompany.com/91577117/fake-temu-dopamine-site-gives-shoppers-a-boost-without-buying-anything-online-shopping-addiction" class="press-quote-card no-mark-external" target="_blank" rel="noopener noreferrer">
    <span class="press-source">Fast Company</span>
    <span class="press-quote">Questioned whether keeping habit-forming mechanics could undermine the idea.</span>
    <span class="press-link-label">Read article ↗</span>
  </a>
</div>

Additional coverage and commentary:

- [MarketWatch](https://www.marketwatch.com/story/fake-shopping-sprees-and-happiness-insurance-the-latest-fintech-apps-reveal-our-financial-anxieties-77770a46) looked at simulated shopping sprees alongside new consumer finance apps shaped by spending fatigue and financial anxiety.
- [Digital Trends](https://www.digitaltrends.com/computing/i-tried-the-internets-weirdest-shopping-trend-and-my-brain-fell-for-it-more-than-i-expected/) described feeling urgency from a countdown on a product that didn't exist, and questioned the impulse loops behind it.
- [NPR's Planet Money](https://www.npr.org/sections/planet-money/2026/09/25/nx-s1-5980393/why-this-pokemon-set-is-dropping-in-value) included it in a newsletter roundup of sites that simulate online shopping, alongside FoodNeverComes and ImaginAir.
- [Vice](https://www.vice.com/en/article/the-internet-has-invented-fake-online-shopping-and-theres-a-wild-reason-why-people-love-it/) described it as a way to "experience the thrilling ritual of buying a thing that doesn't exist."
- [CBC Radio's The Current](https://www.cbc.ca/radio/thecurrent/fake-shopping-website-app-dopamine-9.7313588) covered it among the mock shopping sites spreading beyond South Korea.
- [Futurism](https://futurism.com/future-society/bizarre-websites-dopamine-brain) called it a dopamine site that "convincingly imitates shopping on Temu."
- [Money Talks News](https://www.moneytalksnews.com/the-free-fake-shopping-sites-designed-to-cure-your-spending-and-the-catch-nobody-mentions/) called it "the biggest U.S. entry" in the trend and focused on its guardrails, including my plan to shut it down if the evidence turns against it.
- [Newser](https://www.newser.com/story/393338/site-lets-you-gleefully-shop-without-spending-money.html) focused on how completely the catalog is invented.
- [t3n](https://t3n.de/news/fake-shop-bestellung-dopamin-1749518/) read it as a parody of online retail mechanics.
- [Cybernews](https://cybernews.com/tech/digital-diy-ai-projects/) explored what AI makes possible for personal projects. We also discussed my choice not to collect accounts, email addresses, or IP-based tracking data. That leaves me without retention data, a trade-off I'm comfortable with.
- [The Cool Down](https://www.thecooldown.com/green-tech/dopamine-sites-south-korea-shopping-trend/) looked at shopping without spending, with the caveat that redirecting a habit isn't the same as resolving it.
- [Gizbot](https://www.gizbot.com/features/dopamine-sites-fake-food-delivery-foodnevercomes-128777.html) in India and [Oti Simveni](https://otisimveni.gr/2026/07/27/fakehaul-ti-einai-to-pseftiko-temu-opou-psonizeis-choris-na-agorazeis-tipota/) in Greece wrote it up for readers abroad.

I don't know whether FakeHaul helps people change their shopping habits. The friend I built it for says it helps; a moderator of a shopping-addiction community warned me that rehearsing the ritual could reinforce it. Neither is enough to establish a broader outcome. **FakeHaul is an entertainment product exploring an idea**, and I don't present it as a treatment. If people tell me it's making things worse, I'm prepared to take it down.
