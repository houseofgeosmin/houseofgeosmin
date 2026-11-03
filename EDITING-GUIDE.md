# House of Geosmin — Website Editing Guide (for beginners)

You don't need to know coding. You only ever do three things: **open a file → change some words → save ("commit")**. A minute later the live website updates by itself.

---

## 1. What's in your website folder

| File / Folder | What it does | Do you edit it? |
|---|---|---|
| `index.html` | The page itself: all the text (about, services, contact) | Sometimes |
| `projects.js` | **Your projects list.** Names, details, photo paths | **Most often** |
| `images/` | All your project photos | Yes (add photos) |
| `style.css` | Colours, fonts, look and feel | Rarely |
| `main.js` | Dark-mode button, pop-up, rotating message, WhatsApp number | Rarely |
| `EDITING-GUIDE.md` | This guide | No |

---

## 2. The 5-step way to edit anything (on GitHub, from any computer)

1. Go to **github.com** and open your repository (`houseofgeosmin`).
2. Click the file you want to change (for example `projects.js`).
3. Click the **pencil icon** ✏️ (top right of the file) to edit.
4. Change the words. Press **Ctrl + F** to search inside the file (e.g. search "Project Name 1").
5. Click the green **Commit changes** button, then **Commit changes** again in the pop-up.

Wait about 30 to 60 seconds, then refresh your website (press **Ctrl + Shift + R** to force a fresh load). Done!

> **Safety net:** GitHub remembers every version. If you break something, open the file → **History** → pick an older version → restore it. You can't permanently ruin the site.

---

## 3. Adding a new project (the important one)

### Step A: Prepare the photos (on your computer)

1. Pick 3 to 8 of your best photos for the project. Bright, daytime, straight angles work best.
2. Make them smaller so the site loads fast. Go to **squoosh.app** (free), drop a photo in, set the width to about **1600 px** and quality ~75%. Aim for **under 400 KB** each.
3. Rename them simply, all lowercase, no spaces:
   - `cover.jpg` (the picture shown on the project card, pick the best one)
   - `1.jpg`, `2.jpg`, `3.jpg` … (the photos inside the pop-up)
4. Put them in a new folder on your computer named for the project, e.g. `project-5`.

### Step B: Upload the photos to GitHub

1. In your repository, click the **images** folder.
2. Click **Add file → Upload files**.
3. **Drag the whole `project-5` folder** from your computer into the box. (Dragging the folder keeps it as a folder.)
4. Click **Commit changes**.

Now your photos live at `images/project-5/cover.jpg`, `images/project-5/1.jpg`, and so on.

### Step C: Add the project details

1. Open **projects.js** → click the pencil ✏️.
2. Scroll to the end. Find the last project block and the `/* To add another project... */` note.
3. Put a **comma** right after the last `}` (if there isn't one already), then paste this block:

```js
  {
    name: "Mehta Residence",
    location: "Koramangala, Bengaluru",
    type: "Residential · Villa",
    area: "3,500 sq ft",
    year: "2025",
    duration: "11 months",
    scope: "Architecture, Construction, Interiors",
    about: "A warm family home built around a courtyard.\n\nThe family wanted lots of light and a kitchen that opens to the garden. We delivered both.",
    cover: "images/project-5/cover.jpg",
    photos: [
      "images/project-5/1.jpg",
      "images/project-5/2.jpg",
      "images/project-5/3.jpg"
    ]
  }
```

4. Change the words **inside the quotes** to your project's details.
5. Click **Commit changes**. Wait a minute, refresh the site. Your project card appears, and clicking it opens the big pop-up with photos on the left and details on the right.

### What each line means

| Line | What to write |
|---|---|
| `name` | Project name. This is what people click. |
| `location` | Area and city. |
| `type` | e.g. Residential · Apartment Interiors |
| `area` | Built-up area. |
| `year`, `duration` | When and how long. |
| `scope` | What you did: Architecture, Construction, Interiors. |
| `about` | A short story. Use `\n\n` where you want a new paragraph. |
| `cover` | Photo shown on the project card. |
| `photos` | The list of photos in the pop-up. Add or remove lines freely. |

**Don't want a detail?** Leave it as `""` (empty quotes) and that row simply won't show.

### Removing, hiding or re-ordering projects
- **Remove:** delete the whole block from `{` to `}` (and one comma next to it).
- **Re-order:** cut and paste blocks. The site shows them in the same order as the file.
- **Hide for now:** put `/*` before the block and `*/` after it.

---

## 4. Changing the words on the page

Open **index.html** and press **Ctrl + F**. Every place you may want to edit has a note like `✏️ EDIT` next to it. Handy searches:

| To change… | Search for |
|---|---|
| About heading and paragraphs | `We build houses` |
| "25+" projects number | `data-count` (change the 25, in two places: `data-count="25"` and the `25+` text) |
| Name story (Geosmin meaning) | `earthy scent` |
| A service card | `Architecture`, `Construction`, `Interior Design` |
| How-we-work steps | `Talk &amp; Plan` |
| Footer quote | `Leave People and Place` |
| Rotating messages under the title | open **main.js**, search `LINES` |

**Careful:** only change the plain words. Don't delete anything inside `< >` brackets (like `<p>` or `</p>`).

---

## 5. Changing phone, email, WhatsApp, Instagram

Open **index.html**, press Ctrl + F and search:

- `8884942593`: appears a few times (WhatsApp links and the call link). Change every one. Keep the format `91` + number for WhatsApp (e.g. `919876543210`) and `+91` + number for the call link.
- `88849 42593`: the number as *displayed* on the page.
- `geosminconstructions@gmail.com`: email (appears twice).
- `thehouseofgeosmin`: Instagram handle (appears a few times).

Also open **main.js** and change `WA_NUMBER` at the top (this is the number used by the "Enquire about a project like this" button inside the pop-up).

---

## 6. Changing colours

Open **style.css**. At the very top there are two blocks of colours, one for light mode and one for dark mode:

```css
--accent: #b4200c;     /* main red */
--accent-2: #e0401a;   /* orange */
```

Change the `#` codes. Find a colour code with Google: "colour picker".

---

## 7. Fixing common problems

| Problem | Why it happens | Fix |
|---|---|---|
| New project doesn't show | Missing **comma** between two blocks in `projects.js`, or a missing quote `"` | Check the block above yours ends with `},` and every line inside ends with a comma except the last |
| Photo shows "Photo coming soon" | Photo name or folder doesn't match | Names are case-sensitive: `Cover.JPG` ≠ `cover.jpg`. Also `.jpeg` ≠ `.jpg`. Fix the name in `projects.js` or rename the photo |
| Whole site looks broken after an edit | A bracket or quote got deleted | GitHub → the file → **History** → open the previous version → copy it back |
| Changes not showing | Browser remembers the old page | Press **Ctrl + Shift + R**; on phone, open in a private tab |
| Photos load slowly | Pictures too big | Re-save at 1600 px wide (squoosh.app) |

**Tip to test before publishing:** download the folder to your computer and double-click `index.html`. It opens in your browser, so you can check your changes first.

---

## 8. Good things to do next (optional)

1. **Fix the `www` link** in Vercel/Zoho (the CNAME step you paused).
2. Create a free **Google Business Profile** for your HSR Layout office. This is how people find you on Google Maps.
3. Add a **link-preview image** (what shows when you share the link on WhatsApp): save a 1200×630 image as `images/og.jpg`, then in `index.html` add this line under the other `og:` lines: `<meta property="og:image" content="https://www.houseofgeosmin.com/images/og.jpg">`
4. Use real client testimonials (with permission) once you have them, and I can add a section for them.

---

### Quick cheat sheet

- **New project** → upload photos to `images/project-X/` → paste a block into `projects.js`.
- **Change words** → edit `index.html`.
- **Change contact details** → search `8884942593` in `index.html` and `main.js`.
- **Always** → Commit changes → wait a minute → Ctrl + Shift + R.
