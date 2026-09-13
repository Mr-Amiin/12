# Universal Converter Launch Checklist

Last updated: July 1, 2026

## Ready

- Static homepage, converter engine, calculators, SEO pages, references page, about, contact, and privacy pages are present.
- Local HTML links, sitemap targets, and service-worker cache targets resolve.
- Core conversion constants spot-checked: meter to feet, miles to km, kg to lbs, Celsius to Fahrenheit, liters to gallons, acre to hectare, PSI to bar, watts to horsepower.
- PWA manifest and service worker are included.
- Google Analytics 4 placeholder, Search Console verification placeholder, configured AdSense publisher script, ads.txt seller record, HTML sitemap, XML sitemap generator, ads, newsletter, currency API, and premium placeholders are present.
- Privacy policy includes analytics and advertising disclosures for launch review.
- BreadcrumbList structured data has valid Schema.org ListItem objects and no local filesystem paths.
- Popular Conversion cards are generated from the `popularConversions` database and use `/converter?category=...&from=...&to=...&value=...` routes that preload the main converter.
- The converter route accepts public aliases such as `kg`, `lb`, `mi`, `km`, `ha`, `gb`, and `mb`, then resolves them to the internal unit IDs.
- Netlify rewrites `/converter` to the main app, direct SEO pages still work, and the noindex 404 fallback routes known conversion slugs through `/converter`.
- The XML sitemap excludes `404.html` and the noindex `/convert/` helper, and contains only real public pages.
- Google production readiness checks passed for metadata, canonical links, Open Graph tags, JSON-LD schema, analytics scripts, sitemap targets, service-worker cache targets, and local links.

## Before Publishing

- Production domain is configured as `https://theuniversalconverter.com` across HTML metadata, `sitemap.xml`, `robots.txt`, and `generate-sitemap.ps1`.
- Replace `GA_MEASUREMENT_ID` in `analytics-config.js` with the real GA4 Measurement ID.
- AdSense Publisher ID is configured in `adsense-config.js` and the global page heads as `ca-pub-4632693492035799`.
- Add real AdSense ad unit slot IDs in `adsense-config.js`, then set `ADSENSE_ENABLED` to `true` after AdSense approval if you want the reusable ad components to render display ad units.
- Replace `GOOGLE_SEARCH_CONSOLE_VERIFICATION` in `index.html` with the Search Console verification token if using the meta-tag method.
- Regenerate the XML sitemap after adding pages: `powershell -NoProfile -ExecutionPolicy Bypass -File .\outputs\generate-sitemap.ps1`.
- Add the website to Google Search Console and submit `https://theuniversalconverter.com/sitemap.xml`.
- Connect the newsletter form to an email provider.
- Keep placeholder ad slots visible until AdSense approval; do not enable live ads before the account and site are approved.
- Connect a production currency exchange-rate API if live rates are required.
- Run browser QA on deployed HTTPS for service-worker install and offline behavior.

## Source References

- BIPM SI Brochure: https://www.bipm.org/en/publications/si-brochure
- NIST Special Publication 330: https://www.nist.gov/pml/special-publication-330
- NIST Special Publication 811: https://www.nist.gov/pml/special-publication-811
