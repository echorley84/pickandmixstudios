# pickandmixstudios.com

This repo is the live source of https://pickandmixstudios.com, Emily Chorley's Pick & Mix Studios site. It's a hand-built static site: plain HTML pages, one stylesheet and one script, with no build step.

## How publishing works

- A cron job on Bluehost (cPanel account `cppedamy`, server box4021) runs every 5 minutes. It downloads `main` from this repo and unpacks it into `/home1/cppedamy/public_html`.
- Anything pushed to `main` is live within about 5 minutes. Pushing to `main` therefore publishes to the public site, so get Emily's OK on the change before pushing. Show her a preview first, such as a screenshot or a draft artifact.
- The job only adds and overwrites files. It never deletes anything. To remove a page, delete it here and also delete it on the server in cPanel's File Manager.
- `README.md` and `CLAUDE.md` are skipped by the job and never published.

## Do not touch on the server

`public_html` also holds things this repo does not manage. Never add files to this repo at these paths:

- `website_0f147f10/` (dreaminteractivedesign.com)
- `website_c589091c/` (projectsideways.com)
- `website_e5b228dd/` (beastwithin.co.uk)
- `buildsheet/` (the Build Sheet newsletter pages, from the separate `echorley84/buildsheet` repo)
- `demos/` (Storyline demo exports, managed by hand)
- `.htaccess`, `.well-known/`, `cgi-bin/`

## Files

- `index.html` (Home), `team-chorley.html`, `showcase.html`, `tutorials.html`, `popup-shop.html` and `contact.html` are the main pages. They share a header, nav and footer, so change them on every page.
- `examples/index.html` is the client examples page.
- `assets/site.css` holds the shared styles: brand blue page, white rounded cards, Maven Pro. `assets/site.js` holds the shared behaviour.
- Images are mostly embedded as data URIs inside the pages.

## Editing

- Keep the existing look and markup patterns. Check every edited page at phone (390px) and desktop widths before pushing.
- Commit with a plain message that says what changed on the site.
