---
layout: project
weight: 0
featured: true
title: 'FakeHaul'
description: >
  A fictional marketplace I built with coding agents and offline AI pipelines, where every checkout ends at $0.00.
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
I built FakeHaul for a friend who struggles with impulse shopping. **1,800 fictional products, tracking, unboxing, and receipts recreate the shopping ritual; checkout always ends at $0.00.** Coding agents helped me build and refine it, and my job was mostly to point them in a direction, question what came back, and decide what shipped.

{% include pro/project-video.html id="BnSd8iSkFLQ" title="TODAY: New Simulated Shopping Sites Offer Thrill Without the Bill" start=62 caption="FakeHaul appears at 1:02. Playback starts there." %}

FakeHaul has been covered by TODAY, The New York Times, Fast Company, MarketWatch, and Digital Trends, and mentioned by the BBC, NPR, Vice, CBC, and Futurism, among others. [Read the coverage and the questions it raised](#press-and-uncertainty).
{:.note title="In the press"}

## Directing the agents

GitHub Copilot handled the original build; Claude Code worked on UX and receipts; ChatGPT and Codex helped with cleanup and the hosting migration. **I gave each task an objective, context, limits, and acceptance checks**, then reviewed the diff, rendered result, and test evidence.

Hermes came after the July build, as a coordinator across apps. It passes bounded tasks to the coding tools, checks their results through Git and the browser, and saves procedures that worked as reusable skills.

{% include pro/diagram.html
  src="/assets/img/projects/fakehaul/08-hermes-coordination.svg"
  title="Hermes coordinates across applications"
  height="670"
  alt="I set intent and limits. Hermes routes tasks to coding tools, the browser, and shell; collects diffs, test output, and rendered results; and returns evidence for my decisions. Useful procedures become reusable skills."
  caption="My setup after launch."
%}

## Building the content pipeline

**AI generation happens offline.** Models draft listings, fictional reviews, and product images. Scripts validate fields, checkpoint batches, and publish stored assets; I review tone and visual consistency. Browsing never waits on a model call.

The Next.js storefront serves that content, while Zustand keeps carts and orders in the browser. Versioned image URLs stay live, so saved items keep their pictures. There is no shopper database, which also means no cross-device recovery.

{% include pro/diagram.html
  src="/assets/img/projects/fakehaul/13-product-factory.svg"
  title="The product factory"
  height="1170"
  alt="Human direction feeds catalog generation and validation, then separate image, review, and authored-pack pipelines. Approved images become versioned WebPs; reviews become shards or stored profiles. Server and browser assemble the storefront from these artifacts."
  caption="The image lane shows the approved-publish workflow."
%}

## Reviews and Q&A

Reviews and Q&A are the parts of a listing people actually read, so they got the most offline work and the least runtime work.

**Reviews are model-written once, offline.** One product per request, six workers, up to five attempts each. A sanitizer bounds ratings and ranges, and a partial batch that clears 60% of the request is accepted rather than retried forever. The output is stored as 64 shards holding **15,104 reviews for 1,676 products**. Shards load on the server only — a test fails if review prose reaches a client bundle — so opening a listing parses one shard, not the whole set.

**Q&A is mostly not a model at all.** Category and universal question pools are seeded from the product ID, so a listing shows the same thread every time, and the repetition is the texture, because real marketplace Q&A is that formulaic. Where a product has an authored profile — 124 of them, six reviews and four questions each — those win and arrive as server props; the seeded thread covers everything else.

{% include pro/diagram.html
  src="/assets/img/projects/fakehaul/07-reviews-qa.svg"
  title="Reviews and Q&A take different paths"
  height="745"
  alt="Reviews are written offline in model batches, sanitized, and stored in 64 shards covering 1,676 products. Product profiles hold six reviews and four Q&A entries for 124 products. Q&A is assembled from seeded template pools in the browser. All three feed a lookup at render time, and no model call happens when a page loads."
  caption="Every path ends at a lookup. All reviewers, ratings, and votes are fictional."
%}

## Reviewing what looked finished

When I asked whether the on-screen and shared receipts matched, Claude Code found the same item priced at **$24.99 in one and $79.99 in the other**. I approved a shared pricing module and matching presentation.

During the Railway migration, a share-image response passed both the status and dimension checks, yet it showed a letter tile instead of the product photo. The fix was an asset fetch behind the proxy. The new check looks for the photo itself, because **a check can pass while the person still sees the wrong thing**.

{% include pro/diagram.html
  src="/assets/img/projects/fakehaul/09-automation-human-gates.svg"
  title="Automate the execution, keep the decisions"
  height="570"
  alt="Set an objective, scope a task, execute, produce artifacts, check evidence, and accept or reject. Approved live changes are applied and verified; rejected work returns to the objective."
  caption="The loop I ran with every tool. Approval was my own habit; the pipeline didn’t enforce it, and a push to the deploy branch would release the app."
%}

## What shipped

I launched in July 2026. Vercel's **monthly Visitors grew from 828 in July to 14,375 in September**. Feedback led to a local weekly report, and in September to a vintage category and an accessibility mode that came out of a dementia-caregiving thread. That tells me people found it and cared enough to ask for changes. It doesn't tell me whether rehearsing shopping helps anyone, which I get into below.

## Found by people it wasn't built for

In September, a caregiver posted FakeHaul to r/dementia, saying it wasn't designed for dementia but might help caregivers. I [joined the thread](https://www.reddit.com/r/dementia/comments/1wg6ez9/comment/pa3tfcv/?context=3) and asked what would make it safer and simpler. The replies asked for larger buttons, and for a vintage section with fashion and music. I committed both on September 15 and replied in the thread a few minutes later.

**The accessibility mode doesn't zoom the page.** It widens line height and letter spacing, raises the smallest type to 14px, and gives interactive controls 48px hit areas, because scaling a layout up still clips the controls it just enlarged. Settings open in a native dialog that returns focus, checkout accepts Enter or Space instead of the drag, and reduced motion follows the system preference. I haven't audited the app against an accessibility standard. Vintage needed its own work too: one slug helper shared by links, page metadata, and the sitemap, plus redirects from the older music and vintage paths.

FakeHaul takes no money, so the site has exactly one real-money link on it, and it isn't mine. It goes to the donation page of the [Alzheimer's Foundation of America](https://alzfdn.org/), tagged with the site as the source, and it stays out of the cart, checkout, and order screens so nobody mistakes it for part of the game. FakeHaul receives nothing and never sees what anyone gives. AFA's free national helpline, **866-232-8484**, sits beside the link, staffed by licensed social workers.

{:.note title="What this does and doesn't show"}
The thread shows what caregivers asked for and what shipped. It is not evidence that a person with dementia used the app or benefited from it. FakeHaul is entertainment, not a care tool, and it has never been tested with people living with dementia.

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
