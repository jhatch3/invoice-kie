# Slop Audit Checklist

Use this in the REVIEW loop. For each tell, report **tell → why it reads as
machine-made → the specific fix**, then apply the highest-impact fix and
re-scan. Don't just enumerate — converge.

## Visual tells

### Color
- [ ] **Purple→blue or any hero gradient.** → replace with a flat surface or a
  3–5% lightness shift. Gradients on CTAs/heros are the #1 tell.
- [ ] **Tailwind blue `#3B82F6` or violet `#8B5CF6` as the primary.** → swap to a
  committed, product-specific accent.
- [ ] **Pure gray neutrals (`#808080` family), pure black text, pure white on
  everything.** → give neutrals a temperature; use near-black `--fg`.
- [ ] **Saturated semantic colors** (bright green/red/yellow blocks). → mute them
  (tinted bg + same-hue text).
- [ ] **Unrequested dark mode.** → default to light unless asked.

### Structure & layout
- [ ] **A border on every card / nested cards.** → remove borders; separate with
  whitespace → bg shift → soft shadow, in that order.
- [ ] **Three feature cards in a row by default.** → only keep if the content is
  genuinely three peers; otherwise vary the layout or use whitespace.
- [ ] **Centered hero + big number + small label + gradient accent.** → this is
  the template hero. Open with the most characteristic thing about *this*
  product instead (a live demo, a real artifact, a specific claim).
- [ ] **Numbered markers (01/02/03), eyebrows, dividers used decoratively.** →
  keep only where the content is a real sequence/category.
- [ ] **Everything full-viewport-width.** → set reading and container max-widths.
- [ ] **Arbitrary spacing (`p-[13px]`, `mt-[27px]`).** → snap to the 4px scale.
- [ ] **Inconsistent radius across buttons/inputs/cards.** → one base radius.

### Typography
- [ ] **Inter (or default) for headings + body + UI alike.** → introduce a
  display face; commit to a pairing.
- [ ] **Headings at default tracking.** → `tracking-tight` on large headings.
- [ ] **No type scale — sizes hand-picked per component.** → apply the modular
  scale from `tokens.md`.
- [ ] **Numbers/IDs in a proportional font, left-aligned.** → mono +
  `tabular-nums`, right-aligned in tables.

### Elevation & detail
- [ ] **Hard black shadows or glowy neon shadows.** → low, diffuse,
  neutral-tinted shadows.
- [ ] **Glassmorphism / heavy blur used to add "depth".** → drop it; use surface
  shifts.
- [ ] **Missing/removed focus states.** → visible accent focus ring everywhere.

### Motion
- [ ] **Animation on everything, or none at all.** → one orchestrated moment;
  tight hover/press feedback; `prefers-reduced-motion` respected.
- [ ] **Default `ease` + 300ms on all transitions.** → custom easing, purposeful
  durations.

## Copy tells (the textual purple gradient)

People clock generic copy as fast as generic visuals, even if they can't say
why. Flag and rewrite:

- [ ] **Empty value props:** "Empower your team to unlock productivity", "Built
  for modern teams", "Supercharge your workflow", "Seamlessly integrate". →
  Replace with a specific, concrete claim about what the product does. Be
  specific over clever.
- [ ] **System-side naming:** buttons/labels named after implementation ("Submit",
  "Webhook config", "Execute run"). → Name by what the user controls and
  recognizes ("Extract fields", "Notifications", "Run extraction").
- [ ] **Inconsistent action vocabulary:** button says "Publish", toast says
  "Success!". → An action keeps its name through the flow ("Publish" →
  "Published").
- [ ] **Vague errors / apologetic errors:** "Something went wrong", "Oops!". →
  Say what happened and how to fix it, in the interface's voice.
- [ ] **Mood empty states:** a shrug illustration and "Nothing here yet". → Make
  the empty state an invitation to act, with the primary action present.
- [ ] **Passive voice, filler, Title Case Everywhere.** → active voice, sentence
  case, no filler.

## Passing bar

The UI passes when: colors trace to a capped palette with a non-default accent;
cards separate without gratuitous borders; type uses a committed pairing and
scale; spacing snaps to the scale; copy is specific and active; motion is
restrained; and — the meta-test — with the text stripped out you could still
tell it apart from a stock shadcn demo. Then stop; further decoration is slop in
the other direction.
