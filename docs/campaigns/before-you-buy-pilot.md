# Before You Buy | staging-only acquisition campaign pilot

Status: approved for staging work only. No advertising spend, production deployment, or CRM workflow activation authorised.

## Objective
Generate qualified Brisbane and SEQ commercial acquisition appointments, with signed buyer mandates and revenue as downstream measures.

## Creative concepts
A: The advertised yield is only part of the story. Assess tenant covenant, lease terms, rental sustainability, outgoings, capital expenditure and leasing risk before purchase. CTA: Get an Independent Acquisition Assessment.
B: Buying your business premises? Assess operational suitability, access, parking, future flexibility and ownership economics. CTA: Discuss Your Property Requirements.

## Staging experience
Use the existing Preliminary Acquisition Brief as the conversion destination. Keep existing live form unchanged pending staging audit. Progressive qualification fields: buyer purpose (investment/owner occupier/exploring), property type (industrial/retail/office/flexible), indicative budget, timing, whether a property has already been identified, and contact details with privacy notice. No promise of specific returns.

## Tracking and CRM acceptance criteria
Preserve existing rc-attribution.v1.js 90-day first-touch and session last-touch values; validate UTM source, medium, campaign, content, landing page, and referral. Extend existing /functions/api/website-lead.js only after inspection. Create/update HighLevel contact without automatically creating an opportunity for unqualified leads. Verify deduplication and personal review queue. Test invalid/missing values, consent, mobile layout, submission and error states.

## QA gates
1. Identify the real page source and current submission handler.
2. Implement and test only on staging-qa.
3. Test social campaign UTM URLs end to end and inspect HighLevel records.
4. Present screenshots, test evidence and copy for explicit sign-off.
5. Do not merge to main, deploy to production or activate Meta ads without separate approval.

## Initial budget hypothesis
A$600 over 28 days, indicative only; no spend authorised. Judge on cost per qualified appointment and mandate potential, not engagement alone.
