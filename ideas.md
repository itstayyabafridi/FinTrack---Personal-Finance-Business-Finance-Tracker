# FinTrack Design Direction

## Approach 1 — Quiet Ledger
A calm editorial finance workspace with paper-white surfaces, ink-blue typography, and measured data density. It should feel like a trusted modern ledger: composed, legible, and quietly premium.

**Probability:** 0.03

## Approach 2 — Signal Room
A high-contrast operations dashboard with dark chrome, vivid status colors, and luminous analytical cues. It emphasizes speed, monitoring, and decisive action.

**Probability:** 0.07

## Approach 3 — Harbor OS
A light, tactile SaaS workspace inspired by navigation charts and well-organized financial instruments. It uses a warm mineral canvas, deep navy anchors, clear blue actions, and small coral signals to make money management feel steady rather than stressful.

**Probability:** 0.05

# Chosen Direction — Harbor OS

## Design Movement
Contemporary Swiss information design softened with coastal cartography: precise grids, strong typographic hierarchy, and small navigational markers layered over an airy workspace.

## Core Principles
1. **Orient before optimizing.** Every screen should make the user's financial position obvious within seconds.
2. **Calm density.** Show meaningful detail without turning the interface into a spreadsheet wall.
3. **Signal with restraint.** Blue is for action, green and coral are reserved for financial direction, and dark navy creates moments of focus.
4. **Progress is visible.** Empty states explain what to do next; filled states emphasize movement, not noise.

## Color Philosophy
The canvas is a warm fog-blue rather than a sterile white, giving the interface a stable, grounded atmosphere. Navy is the anchor color for trust and focus; a precise harbor blue marks action; mint green means progress; coral marks money leaving or attention needed; lilac and apricot add secondary categorization without competing with the financial hierarchy.

## Layout Paradigm
A persistent left rail acts like a chart legend, while the content area uses an asymmetric 8/4 split: broad analytical surfaces on the left, compact insight and action surfaces on the right. Major cards align to a clear baseline but avoid a uniform tile wall through varied widths and intentional breathing room.

## Signature Elements
- A small compass-style FinTrack mark: a four-point financial navigation glyph, never a wordmark in default text.
- Dashed chart-grid accents and miniature coordinate labels for time ranges.
- Navy insight panels with a thin mint route-line motif that visually connects signals to actions.

## Interaction Philosophy
Interactions should feel like placing a marker on a map: direct, reversible, and clearly acknowledged. Buttons compress slightly on press; filters update immediately; dialogs use short, focused transitions; destructive or financially consequential actions require explicit confirmation.

## Animation
Use 160–240ms ease-out transitions for hover, dropdowns, tabs, and card focus. Dashboard sections enter with a 40ms stagger, using opacity and a short upward translate only. Charts draw in gently on first load, but never animate repeatedly on every filter change. Respect reduced-motion preferences.

## Typography System
Use **Plus Jakarta Sans** for interface text and **DM Sans** for numbers and compact metric readouts. Headlines use Plus Jakarta Sans 700 with slightly tight tracking; labels use 11–12px uppercase with 0.08em tracking; metric amounts use DM Sans 700 with tabular numerals; body copy stays at 13–15px with generous line height.

## Brand Essence
**FinTrack is a calm financial command center for people balancing personal money and small-business work, designed to turn scattered obligations into a clear next move.**

Personality: grounded, clear, quietly ambitious.

## Brand Voice
Headlines are crisp and directional. CTAs are specific and action-led. Microcopy is reassuring, never scolding, and always tells the user what happens next.

Example lines:
- “Know what moved. Decide what matters next.”
- “Your next clear number is one transaction away.”

## Wordmark & Logo
The mark is a compact compass with one emphasized northeast point, built from four rounded blades and a central square. The wordmark uses a custom lockup where “Fin” is set in navy and “Track” in harbor blue, with the compass replacing the dot of the i.

## Signature Brand Color
**Harbor Blue — #2F6BFF**, a precise, confident action color that feels navigational rather than corporate.

## Style Decisions

- Dashboard overview begins with a dominant financial position surface before secondary metrics.
- Dashed chart grids, coordinate labels, compass markers, and thin mint route-lines recur across the overview.
- Visible copy points toward a clear next financial move instead of using generic dashboard language.
