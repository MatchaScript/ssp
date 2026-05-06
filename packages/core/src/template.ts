export const templateCss = `@layer reset, tokens, palette, semantics, base, utilities;

@layer reset {

    *,
    *::before,
    *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }
}

/* ── 1. Design Tokens ─────────────────────────────────────────────────── */
@layer tokens {
    :root {
        color-scheme: light dark;

        /* ── Typography: Scale ── */
        --type-scale-ratio: 1.125;
        --text-base-px: 14;

        --text-25: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), -3)), 1) * 1px);
        --text-50: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), -2)), 1) * 1px);
        --text-75: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), -1)), 1) * 1px);
        --text-100: calc(var(--text-base-px) * 1px);
        --text-200: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 1)), 1) * 1px);
        --text-300: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 2)), 1) * 1px);
        --text-400: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 3)), 1) * 1px);
        --text-500: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 4)), 1) * 1px);
        --text-600: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 5)), 1) * 1px);
        --text-700: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 6)), 1) * 1px);
        --text-800: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 7)), 1) * 1px);
        --text-900: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 8)), 1) * 1px);
        --text-1000: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 9)), 1) * 1px);
        --text-1100: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 10)), 1) * 1px);
        --text-1200: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 11)), 1) * 1px);
        --text-1300: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 12)), 1) * 1px);
        --text-1400: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 13)), 1) * 1px);
        --text-1500: calc(round(nearest, calc(var(--text-base-px) * pow(var(--type-scale-ratio), 14)), 1) * 1px);

        /* ── Typography: Line Heights ── */
        --lh-heading: 1.3;
        --lh-detail: 1.3;
        --lh-component: 1.3;
        --lh-body: 1.5;
        --lh-code: 1.5;

        --lh-cjk-heading: 1.5;
        --lh-cjk-component: 1.5;
        --lh-cjk-body: 1.7;

        /* ── Motion ── */
        --ease-out: cubic-bezier(0, 0, 0.40, 1);
        --ease-in: cubic-bezier(0.50, 0, 1, 1);
        --ease-in-out: cubic-bezier(0.45, 0, 0.40, 1);

        --duration-100: 130ms;
        --duration-200: 160ms;
        --duration-300: 190ms;
        --duration-400: 220ms;
        --duration-500: 250ms;
        --duration-600: 300ms;
        --duration-700: 350ms;
        --duration-800: 400ms;
        --duration-900: 450ms;
        --duration-1000: 500ms;

        --duration-fast: var(--duration-100);
        --duration-normal: var(--duration-200);
        --duration-slow: var(--duration-600);
        --duration-slower: var(--duration-1000);
        --ease-default: var(--ease-out);

        /* ── Layout & Spacing ── */
        --space-1: 0.25rem;
        --space-2: 0.5rem;
        --space-3: 0.75rem;
        --space-4: 1rem;
        --space-5: 1.25rem;
        --space-6: 1.5rem;
        --space-8: 2rem;
        --space-10: 2.5rem;
        --space-12: 3rem;
        --space-16: 4rem;

        /* {{ INJECT_TRANSPARENT_SCALES }} */

        /* ── Absolute B/W ── */
        --black: oklch(0 0 0);
        --white: oklch(1 0 0);

        /* ── Material Blurs ── */
        --blur-sm: blur(8px) saturate(120%);
        --blur-md: blur(20px) saturate(150%);
        --blur-lg: blur(40px) saturate(180%);
        --blur-xl: blur(60px) saturate(200%);
    }

    @media (max-width: 767px) {
        :root {
            --text-base-px: 17;
        }
    }
}

/* ── 2. Palette (Dynamically Generated from Config) ───────────────────── */
@layer palette {
    /* {{ INJECT_PALETTE }} */
}

/* ── 3. Semantics ──────────────────────────────────────────────────────── */
@layer semantics {
    :root {
        /* ── Project Tokens ── */
        --glass-bg-auto: light-dark(oklch(from var(--background-layer-2-color) l c h / 0.7), oklch(from var(--background-layer-2-color) l c h / 0.65));
        --glass-border-auto: light-dark(var(--transparent-black-100), var(--transparent-white-100));
        --glass-shadow: light-dark(0 1px 4px var(--transparent-black-200), 0 1px 4px var(--transparent-black-400));

        /* {{ INJECT_SEMANTICS }} */
    }
}

/* ── 4. Base Styles ────────────────────────────────────────────────────── */
@layer base {
    body {
        font-family: var(--font-sans);
        font-size: var(--text-200);
        line-height: var(--lh-body);
        background-color: var(--background-layer-1-color);
        color: var(--neutral-content-color-default);

        font-variant-numeric: tabular-nums;
        font-feature-settings: 'pwid' on, 'palt' on, 'pkna' on;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        color: var(--gray-900);
        line-height: var(--lh-heading);
    }

    :lang(ja),
    :lang(zh),
    :lang(ko) {
        --lh-heading: var(--lh-cjk-heading);
        --lh-body: var(--lh-cjk-body);
        --lh-component: var(--lh-cjk-component);
    }
}
`;
