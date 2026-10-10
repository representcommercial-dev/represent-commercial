# Claude Design hand-off | Before You Buy

Project 07, Represent Commercial. Design-only work. Use repository `representcommercial-dev/represent-commercial`, branch `staging-qa`. Create a dedicated design branch; do not merge to main.

## Source-of-truth files
- `styles.v3.css`: authoritative shared design tokens/components
- `preliminary-acquisition-brief.html`: primary form/page reference
- `buyers-agency.html`: acquisition service positioning
- `before-you-buy-pilot.html`: refine this page
- `rc-attribution.v1.js` and `functions/api/website-lead.js`: integration boundary, do not change

## Brand tokens
British Racing Green #004225; deep green #002D18; brushed gold #C9A84C; gold ink #8C6E1A; light background #F8F9F8; borders #E1E4E1; body text #4A504A. Fonts: Barlow Condensed (headings), Cormorant Garamond (editorial italic accents), DM Sans (body and forms). Reuse established header/footer, button styles, spacing, visual hierarchy, and responsive rules. Sole tagline: Exclusively on your side of the table.

## Objective
Make the staging Before You Buy campaign feel native to the Represent Commercial site: editorial, premium, restrained and commercially credible. Main headline: “The advertised yield is only part of the story.” Message covers lease terms, tenant covenant, sustainability of rent, future leasing risk and capital expenditure. Keep principal-led independent buyer representation, covering investors and owner-occupiers.

## Functional contract
Maintain the five-step sequence: buyer purpose; preferred property type; indicative budget; timeframe; contact details / identified property. Do not rename input names, change values, submit logic, attribution fields, Web3Forms handoff, HighLevel contact-only route, or duplicate handling. Do not edit production. Keep page `noindex,nofollow` while staging. Ensure SEO-critical copy is in initial HTML, not injected by JS. Accessible labels/focus states, validation and clear error states, mobile performance.

## Deliverables and review gate
Commit design changes to a new branch based on `staging-qa`, provide desktop/mobile previews and a concise change log. Confirm integrations untouched. No merge to main, production deploy, Meta ad activation or expenditure without Nick's explicit signoff.
