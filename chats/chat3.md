# Website Rework

_Started 2026-05-24 23:35 UTC_

---

## User

rework website based on attached capability statement

## Assistant

_[tool: list_files]_

_[tool: invoke_skill]_

_[tool: run_script]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: copy_files]_

_[tool: update_todos]_

I'll rework the website to align with the capability statement. The key changes:

1. **New 4 pillars** (Principal-led / Specialist / AI-native / Owner-aligned) — current "Owner's mindset" + "20 years depth" don't match the doc
2. **Replace "Iron Lease Promise"** (not in PDF) with the **Track Record stats** ($500M+, $20M+ value, 100% occupancy, etc.)
3. **Three service tiers** (Foundation / Active / Portfolio) replace the four flat services
4. **Add "How we work"** — 4-step Grade/Manage/Improve/Report rhythm
5. **Add "Who we work with"** — private investors, syndicates, SMSF landlords
6. **Broaden scope** — office, retail AND industrial (not industrial-only)
7. **Update bio** with real details (Nicolas Malouf, UQ degrees, Spring Hill, West End)
8. **Add REIQ Licence 494809 and ABN** to footer

Preserving the old version first:

_[tool: str_replace_edit]_

Now starting edits — metadata + hero first:Now the hero text and noscript:

_[tool: str_replace_edit]_

Now replacing the Operating Model pillars and Iron Lease Promise with the new sections from the capability statement:

_[tool: str_replace_edit]_

Now replacing Iron Lease Promise with Track Record stats:

_[tool: str_replace_edit]_

Now replacing ServicesStrip with Three Tiers, and PrecinctFocus with Who We Work With + How We Work:

_[tool: str_replace_edit]_

Now replace PrecinctFocus with How We Work + Who We Work With:

_[tool: str_replace_edit]_

Now update the HomePage composition:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now update About page with real bio + project highlights, and Services page to three tiers:Now rewrite the Services page to be three tiers (matching capability statement):

_[tool: str_replace_edit]_

Now update the Footer with REIQ Licence 494809 and ABN, and tweak the contact page copy lightly:

_[tool: str_replace_edit]_

Now let me verify the build and also check the SectionLabel handling of `dark gold` props (since I'm passing both in `ServiceTiers`):

_[tool: grep]_

_[tool: show_html]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Website reworked to mirror the capability statement.

**Homepage flow now follows the PDF structure:**
1. Hero — *Your asset. Our obsession.* / Brisbane, $2M–$30M, office + retail + industrial
2. **01 · The Represent Difference** — four pillars rewritten verbatim from the doc (Principal-led / Specialist / AI-native / Owner-aligned)
3. **The Principal's Track Record** — six stats grid (20+ yrs, $500M+, $20M+, $7M+, 100% occupancy, 8% outgoings reduction)
4. **02 · Three Tiers** — Foundation / Active (most engaged) / Portfolio with full bullet lists
5. **03 · How We Work** — Grade · Manage · Improve · Report rhythm
6. **04 · Who We Work With** — Private investors / Syndicates / SMSF landlords
7. **Selected Project Highlights** — Spring Hill (3→15 storeys) and West End ($5M→$12M)

**Other pages updated:**
- **About** — real bio: Nicolas Malouf Investments (13 yrs), UQ degrees, $20M+ lease transactions, project highlights card
- **Services** — three full tiers + operating rhythm strip
- **Footer + Contact** — REIQ Licence 494809 and ABN 59 696 915 170 surfaced
- **Removed** — "Iron Lease Promise" (not in the doc) and SEQ-industrial-precincts-only framing in nav/footer (broadened to office + retail + industrial)

Old version preserved at `website/index v1.html`. Precinct sub-pages (Acacia Ridge / Yatala / Hemmant / Brendale) still exist as files but no longer in nav — let me know if you want them removed or updated next.

