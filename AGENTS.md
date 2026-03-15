This repo is a static GitHub Pages site built with plain HTML/CSS/JS.



Make minimal, high-confidence edits only.



Do not introduce React, build tools, package managers, or new frameworks.



Keep Korean copy natural and professional.



Use only relative paths.



When editing homepage images, use images from assets/images/home/.



Prefer editing existing files over restructuring the project.



Do not rename, move, or delete files unless explicitly required.



Do not invent unknown business information such as 사업자등록번호, 대표명, 전화번호, 주소, 예금주, or payment methods.



Preserve confirmed values already provided by the user.



Remove dead links and sample-only wording where appropriate.



\## Customer-facing site cleanup rules



\- Remove internal planning, demo, placeholder, and developer-facing wording from public pages.

\- If a value is unconfirmed, remove the entire placeholder field instead of guessing.

\- Do not leave TODO, sample, demo, “추후 확정”, or similar internal wording on public pages.

\- For static forms, use an honest inquiry flow such as mailto; never imply server submission works when it does not.

\- Preserve the existing layout, class names, and file structure whenever possible.



\## Design and IA rules for this project



\- This repo is a static GitHub Pages site built with plain HTML, CSS, and JS only.

\- Do not introduce React, Vue, Tailwind, Bootstrap, build tools, package managers, or large third-party UI libraries.

\- The visual direction is a restrained B2B industrial redesign for a Korean corrugated box / packaging supplier.

\- Keep the site feeling established, practical, and trustworthy.

\- Do not make it feel like a startup SaaS landing page.

\- Do not make it feel like a cafe, lifestyle brand, editorial shop, or luxury brand site.



\## Business information rules



\- Preserve confirmed business facts already present in the repo unless the user explicitly changes them.

\- Do not invent business history, years in operation, production capacity, nationwide coverage, same-day promises, certifications, client logos, or customer references.

\- Do not invent new services or product lines.

\- Keep pricing, minimum order quantity, lead time notes, shipping rules, and tax invoice rules factual and conservative.

\- If a value is uncertain, remove the claim instead of guessing.



\## Information architecture rules



\- Remove the fixed quick sidebar from public pages.

\- Keep top-level navigation compact and businesslike.

\- Preferred main navigation:

&#x20; - 상품안내

&#x20; - 맞춤견적

&#x20; - 거래안내

&#x20; - 문의/오시는 길

\- Do not expose bank account information in homepage hero, fixed UI, or other global emphasis areas.

\- If bank account information must remain, keep it only inside the payment section of the transaction/shipping page.



\## Homepage structure rules



\- Homepage should follow this order:

&#x20; 1. compact utility bar

&#x20; 2. header

&#x20; 3. hero

&#x20; 4. trust strip

&#x20; 5. category overview

&#x20; 6. featured products

&#x20; 7. process / order flow

&#x20; 8. transaction summary

&#x20; 9. real photo proof

&#x20; 10. contact / directions

&#x20; 11. footer

\- Do not overload the hero.

\- Hero must have at most 2 prominent CTAs.

\- Primary CTA site-wide is "맞춤견적 요청".



\## Product page rules



\- Keep existing product filenames and relative links.

\- Apply one consistent layout pattern across all `product-\*.html` pages.

\- Avoid duplicated data tables that repeat the same facts multiple times.

\- If no real product image exists, do not add fake 3D box renders or decorative placeholders.

\- Prefer a clean product summary card over fake visual filler.



\## Copy and Korean readability rules



\- Keep Korean copy concise, professional, and practical.

\- Use short paragraphs and clear headings.

\- Prioritize factual business information over slogan-like writing.

\- Avoid exaggerated sales language such as "업계 1위", "최저가", "국내 최고", or similar unverifiable claims.

\- Do not leave internal notes, demo text, placeholders, TODOs, or planning language on public pages.

\- Keep long text left-aligned for readability.



\## Visual system rules



\- Use a restrained industrial palette, mostly white / off-white / navy / gray.

\- Use warm accent colors sparingly.

\- Avoid glossy gradients, oversized shadows, pill-shaped buttons, and decorative blobs.

\- Reduce border clutter. Use spacing and type hierarchy instead of excessive boxes.

\- Use consistent button hierarchy:

&#x20; - Primary: solid

&#x20; - Secondary: outline

&#x20; - Utility: low emphasis

\- Keep section spacing generous but not airy or luxury-like.



\## Image rules



\- Use only real images already in the repository unless the user explicitly provides more.

\- Prioritize images under `assets/images/home/`.

\- Do not use stock photography.

\- Do not add abstract illustrations.

\- Use images as proof of real business operations, not as decoration.



\## Form and JS safety rules



\- Preserve the existing quote request flow.

\- Do not break:

&#x20; - `id="quoteForm"`

&#x20; - existing form field `name` attributes

&#x20; - honeypot field `website`

&#x20; - hidden `source\_page`

&#x20; - `window.APP\_CONFIG.QUOTE\_ENDPOINT`

&#x20; - related logic in `assets/site.js`

\- Keep JS lightweight and functional. No animation libraries.



\## Mobile and QA rules



\- Design for 360px / 375px / 390px mobile widths.

\- No horizontal scrolling.

\- Keep touch targets at least 44px high where practical.

\- Mobile sticky CTA should stay simple and conversion-focused.

\- Before finishing, verify:

&#x20; - no broken links

&#x20; - no broken images

&#x20; - no console errors

&#x20; - no fake content

&#x20; - no leftover demo/template sections

