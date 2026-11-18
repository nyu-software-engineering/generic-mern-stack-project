# NYU branding research for DormShare

Verified on November 16, 2026 using official NYU sources. The selected scope is NYU's university-wide identity. NYU Abu Dhabi and school-specific branding are outside this direction.

This research supports [the design research issue](https://github.com/agile-students-fall2026/generic-mern-stack-project-dormshare/issues/140) and [the whole-app redesign](https://github.com/agile-students-fall2026/generic-mern-stack-project-dormshare/issues/141). This stage covers research and issue planning. App implementation has not started.

## Verified colors

NYU identifies Violet as its main brand color. Ultra Violet is an accent to use sparingly. The official digital palette includes these values. [NYU Colors](https://www.nyu.edu/employees/resources-and-services/media-and-communications/nyu-brand-guidelines/designing-in-our-style/nyu-colors.html)

| Color | HEX |
| --- | --- |
| NYU Violet | `#57068C` |
| Ultra Violet | `#8900E1` |
| Deep Violet | `#330662` |
| Medium Violet 1 | `#702B9D` |
| Medium Violet 2 | `#7B5AA6` |
| Light Violet 1 | `#AB82C5` |
| Light Violet 2 | `#EEE6F3` |
| Black | `#000000` |
| Dark Gray | `#404040` |
| Medium Gray 1 | `#6D6D6D` |
| Medium Gray 2 | `#B8B8B8` |
| Medium Gray 3 | `#D6D6D6` |
| Light Gray | `#F2F2F2` |
| White | `#FFFFFF` |

The guide names `#333333` or `#404040` for digital body text. Light tints are suitable for surfaces and decoration. Palette membership alone does not make a text and background combination accessible. [NYU Colors: Using Color](https://www.nyu.edu/employees/resources-and-services/media-and-communications/nyu-brand-guidelines/designing-in-our-style/nyu-colors.html#using-color)

## Current typography and font access

The current primary font is **NYU Perstare**. Gotham appears in older guidance and logo artwork, so it should not be treated as the current default interface font. NYU recommends Regular for body text and heavier weights for headings. [NYU Typefaces and Fonts](https://www.nyu.edu/employees/resources-and-services/media-and-communications/nyu-brand-guidelines/designing-in-our-style/typefaces-and-fonts.html)

NetID holders can obtain desktop fonts through [NYU's font download](https://www.nyu.edu/brand/font). The guidance directs website users to request access from `digital.communications@nyu.edu`. A desktop download does not establish webfont access for this project. That access has not yet been confirmed. [Get NYU Perstare](https://www.nyu.edu/employees/resources-and-services/media-and-communications/nyu-brand-guidelines/designing-in-our-style/typefaces-and-fonts.html)

NYU names Montserrat for Google Workspace, and Helvetica followed by Arial as system alternatives for office use. These are scoped alternatives, not a university-wide website font specification. A practical proposal for DormShare is `Helvetica, Arial, sans-serif` until Perstare website access is established. This fallback is a DormShare choice. [NYU Perstare Alternatives](https://www.nyu.edu/employees/resources-and-services/media-and-communications/nyu-brand-guidelines/designing-in-our-style/typefaces-and-fonts.html)

## Accessibility and responsive behavior

Use NYU's dedicated digital accessibility guidance for contrast: at least 4.5:1 for normal text and 3:1 for large text. Color must not be the only cue for links, status, or errors. [NYU Color Contrast and Use of Color](https://www.nyu.edu/life/information-technology/web-and-digital-publishing/digital-publishing/accessibility/accessibility-checklist/sufficient-contrast.html)

Check logical reading order, heading structure, descriptive links, image descriptions, and keyboard access. [NYU Digital Accessibility Checklist](https://www.nyu.edu/life/information-technology/web-and-digital-publishing/digital-publishing/accessibility/accessibility-checklist.html)

NYU's reflow standard checks a 320 CSS pixel equivalent. This includes a 1280px-wide viewport at 400% zoom. Content should remain readable and operable without scrolling in two directions, apart from content that genuinely requires a two-dimensional layout. [NYU Reflow Testing Standard](https://digitalaccessibility.nyu.edu/testing/sc1410.html)

No university-wide app breakpoint, spacing scale, card radius, or navigation pattern was verified. Those should be designed for DormShare and tested on its actual routes.

## DormShare identity

NYU's logo guidance does not establish blanket permission for independent student apps to use its marks. Keep DormShare's own name and wordmark in the proposed direction. Questions about using NYU marks can be directed to `brand@nyu.edu`. No request has been sent. [NYU Logos and University Seal](https://www.nyu.edu/employees/resources-and-services/media-and-communications/nyu-brand-guidelines/designing-in-our-style/nyu-logos-and-university-seal.html#usagerights)

## Proposed direction for review

These are recommendations, not additional NYU rules:

- Use white and light gray surfaces, dark gray text, and Violet for primary actions and selected navigation. Use Ultra Violet sparingly.
- Build a clear shared type scale, spacing system, forms, buttons, status treatments, and visible focus styles.
- Design phone navigation and layouts deliberately. Give desktop pages enough room for their content.
- Preserve existing routes, API contracts, shared state, and working booking behavior during the visual rework.
- Cover loading, empty, error, validation, pending, disabled, and success states on every page group.
- Approve representative phone and desktop designs before implementation. Land the work in small commits and separate PRs by journey.

## Work sequence

1. [Verify guidance and approve the direction](https://github.com/agile-students-fall2026/generic-mern-stack-project-dormshare/issues/140).
2. [Shared styles, navigation, Browse, and item details](https://github.com/agile-students-fall2026/generic-mern-stack-project-dormshare/issues/142).
3. [Account and profile pages](https://github.com/agile-students-fall2026/generic-mern-stack-project-dormshare/issues/143).
4. [Listings and rental dashboards](https://github.com/agile-students-fall2026/generic-mern-stack-project-dormshare/issues/144).
5. [Booking and handoff journeys](https://github.com/agile-students-fall2026/generic-mern-stack-project-dormshare/issues/145).
6. [Messages and requests](https://github.com/agile-students-fall2026/generic-mern-stack-project-dormshare/issues/146).
7. [Notifications and trust pages](https://github.com/agile-students-fall2026/generic-mern-stack-project-dormshare/issues/147).
8. Complete the [cross-app mobile checks](https://github.com/agile-students-fall2026/generic-mern-stack-project-dormshare/issues/148).

Steps 3 through 7 can proceed independently after the shared foundation. Coordinate them with each teammate's account and API work. The mobile audit can start immediately.
