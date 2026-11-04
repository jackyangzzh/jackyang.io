# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Hiring managers and recruiters** for real-time, agentic, and multimodal AI roles. They arrive from a résumé, LinkedIn, or a referral. They need to judge fit fast and then act: email, book a call (Calendly), or open the résumé PDF.
- **Engineers and peers.** They read the project case studies and writing to see how the work was built and what Jack thinks.
- **Press and community.** They arrive through FakeHaul coverage, Product Hunt, or Medium. They need to understand a project quickly and find accurate facts about it.

## Product Purpose

jackyang.io is Jack Yang's personal site and portfolio. It presents his work, projects, and writing, and turns interest into contact. Success means the right visitor understands what Jack builds and reaches out, or leaves with an accurate picture of a project.

## Positioning

Jack is a software engineer who connects low-latency systems with generative models, and he cares as much about how the interaction feels as about how the system is built. Shipped work at scale backs the claim: Facilitator, the Microsoft 365 Copilot meeting agent at Microsoft Teams AI, and the shared UI framework and avatar pipeline at Microsoft Mesh. HCI research at Georgia Tech (Ground Tracker) backs it too. Every page reinforces this combination: real-time AI plus interaction craft.

## Operating Context

- Visitors usually come in from a résumé, LinkedIn, a referral, or press and Medium links. Many land deep, on a project page or a writing page, rather than on the home page.
- The contact actions are email, Calendly, and the résumé PDF. They are shared by the hero, the footer, and the command menu (`_config.yml` → `contact`).
- The home page hero ("Fig. 1") is an illustrated, scrubbable waveform of a hiring sync. In it, an agent waits for the decision and a real pause before it speaks. The hero demonstrates the turn-taking work. It is not a recording.

## Capabilities and Constraints

- Built as a static Jekyll site (`_config.yml`, `_layouts`, `_includes`, `_sass`) with a `projects` collection (`_projects/*.md`). It deploys on Netlify (`netlify.toml`).
- Résumé data lives in `_data/resume.yml`, using the JSON Resume schema. It feeds the site and the Person structured data.
- Writing comes mostly from Medium, through a cached feed (`_data/medium_posts_cache.json`), and a monthly GitHub Action rebuilds the site.
- Sections: About/home, Experience, Projects (professional, research, personal), and Writing.
- **Claim discipline (binding):** every claim about Jack comes from `_data/resume.yml` at the level stated there ("works on", "key contributor", "under review"/"under consideration"). Do not add invented praise, metrics, testimonials, or upgraded claim levels.
- Not established as product requirements: a specific performance budget, a WCAG level, and print parity with the résumé PDF. The repo has Lighthouse scripts and `_print.scss`, but the user has not made either one binding.

## Brand Commitments

- Name: Jack Yang. Domain: jackyang.io. Handles: `jackyangzzh` on GitHub, Medium, and LinkedIn, and `jackyang` on X.
- Voice: first person, plain, specific, and factual. Statements stay at the claim level the résumé sets.

## Evidence on Hand

- Résumé: `assets/Jack_Yang_Resume.pdf`. Structured data: `_data/resume.yml`.
- Papers: `assets/files/Breaking Binocular Redundancy.pdf`, `assets/files/too-late-to-rely.pdf`.
- Case studies: FakeHaul, DishVue, Holos, Microsoft Mesh & Avatars for Teams, Robot Control Through VR, Project Virtualso, and Color Vision & Binocular Rivalry in VR (`_projects/`).
- Press, as stated in the résumé: FakeHaul was covered by *The New York Times*, *Fast Company*, *Digital Trends*, *BBC*, and *TODAY*, and its monthly visitors grew 18x in two months (828 to 14,375); see `projects` in `_data/resume.yml`. Satya Nadella showed Jack's outfit-selection flow at Microsoft Ignite. Holos secured a $750K U.S. Air Force contract and a place in Techstars.
- Images: project imagery in `assets/img/projects/`, the portrait in `assets/img/profile*.webp`, and the link-preview card in `assets/img/og-card.png`.
- Absent, and not to be fabricated: testimonials, quotes from colleagues, and usage metrics beyond those in the résumé.

## Product Principles

1. **Fit, then action.** A hiring visitor should grasp the positioning within seconds and always have a contact action within reach.
2. **Show the work, don't describe it.** Demonstrate real-time and interaction craft through the site itself, as the Fig. 1 waveform does, rather than through adjectives.
3. **Claims stay at their source level.** `_data/resume.yml` is the single authority for anything stated about Jack.
4. **Every page is an entry point.** Project and writing pages must stand on their own for visitors who never see the home page.
