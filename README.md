# Easy Plumbing FL

Marketing website for a Florida plumbing company, built as a portfolio piece: logo, brand palette and a one-page site. Plain HTML, CSS and JavaScript, no build step and no dependencies.

![Easy Plumbing FL](images/og-image.jpg)

## The brand

"Sunshine Coast": a Florida sunset set inside a water drop. Water for the trade, sun and surf for the state. The same scene is reused across the site, most visibly as the striped sun that sets behind the hero's quote form.

| Colour | Hex | Used for |
| --- | --- | --- |
| Deep Teal | `#0B4A56` | Headings, dark sections |
| Gulf Teal | `#13828D` | Brand accents, icons |
| Sunset | `#E8611A` | Logo script, display text |
| Sunset 600 | `#CF4711` | Buttons (4.6:1 with white text) |
| Citrus | `#F68A1F` | Sun, small accents |
| Gold | `#FDB42D` | Highlights on dark |
| Sand | `#FBF4EA` | Light sections |

Type: **Pacifico** for script accents, **Montserrat** ExtraBold for headings, **Inter** for body text.

Logo text is converted to vector outlines, so `images/logo.svg` renders identically anywhere, including as an `<img>` and without the fonts installed.

## Running it

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
```

VS Code's Live Server works too. All paths are relative to the project root.

## Structure

```
index.html          one page: hero, services, process, about, reviews, areas, FAQ
css/styles.css      tokens → base → layout → components → sections
js/main.js          mobile menu, scroll reveal, active nav link, quote form
images/             logo, favicons, social share image
brand/              logo concept sheet from the exploration round
```

The nav links jump to sections on the one page; there are no separate subpages.

## About the content

The business name is real; everything else is placeholder copy for the demo. The phone number, email, reviews, ratings, job counts and claims such as "licensed & insured" are invented and should be replaced before this is used as a live business site. The quote form validates and shows a confirmation, but sends nothing: there's a marked spot in `js/main.js` for connecting a form service.
