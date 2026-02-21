# Token Change Communication

How to communicate design system token changes to consuming projects.

## Change Categories

### Safe — Adding new tokens

New tokens don't affect existing consumers. No action needed.

**Commit prefix:** `[tokens:safe]`

**Example:** Adding `--color-warning-subtle` alongside existing warning tokens.

### Check — Changing a token's resolved value

The token name stays the same but its value changes. Consumers' layouts may shift.

**Commit prefix:** `[tokens:check]`

**Example:** `--space-md` changes from `1rem` to `1.25rem`. Any component using `--space-md` for padding or gap will have more space. Consumers should visually check affected pages.

### Breaking — Removing or renaming a token

Consumers referencing the old name will get `undefined` and fall back to browser defaults. Builds won't break (CSS doesn't error on undefined variables) but layouts will.

**Commit prefix:** `[tokens:breaking]`

**Example:** Renaming `--color-brand` to `--color-accent`. Add a `CHANGELOG.md` entry with the old name, new name, and a find-and-replace command.

## Commit Message Convention

```
[tokens:check] Increase base spacing scale by 1 step

--space-sm: 0.5rem → 0.75rem
--space-md: 1rem → 1.25rem
--space-lg: 1.5rem → 2rem

Consumers: check card layouts and form spacing.
```

The prefix makes token changes greppable in git log:
```bash
git log --oneline --grep='\[tokens:'
git log --oneline --grep='\[tokens:breaking\]'
```

## What Consumers Should Do

### On `[tokens:safe]`
Nothing. New tokens are additive.

### On `[tokens:check]`
1. Pull the updated token files
2. Run the dev server and visually check key pages
3. If you have Playwright visual regression set up, run it — diffs are expected but should be reviewed

### On `[tokens:breaking]`
1. Read the `CHANGELOG.md` entry for migration steps
2. Find-and-replace the old token name in your CSS
3. Pull the updated token files
4. Verify the build and visual output

## Visual Regression Guidance for Consuming Projects

Each consuming project should own its own visual regression baselines. Recommended setup:

1. Install Playwright: `npm init playwright@latest`
2. Write a test that screenshots key pages at 1440px and 375px widths
3. Commit baselines to the repo
4. Run after pulling design system updates flagged `[tokens:check]` or `[tokens:breaking]`
5. Use a percentage-based diff threshold (~0.1%) to filter anti-aliasing noise

The design system repo does not run visual regression itself — the docs site reflects intentional changes. The real test is whether those changes look right in your app's specific layouts.

## Reference

The current token set is always documented in `reference/tokens.md`. For the full token architecture, see `dev_docs/solutions/three-tier-token-architecture.md`.
