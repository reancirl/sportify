<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: #faf5ec;
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            /* ─────────────────────────────────────────────────────────────
               sportify.ph  —  three-court loader
               Tennis · Pickleball · Badminton courts draw in sequentially.
               All animation uses stroke-dashoffset + CSS keyframes so it
               works before any JS or React loads.
            ───────────────────────────────────────────────────────────── */

            #sportify-loader {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 2.5rem;
                background: #faf5ec;
                color: #3e2817;
                opacity: 1;
                visibility: visible;
                transition:
                    opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
                    visibility 0s linear 0.7s;
            }

            #sportify-loader.is-hidden {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
            }

            /* ── Wordmark ───────────────────────────────────────────── */
            .sl-wordmark {
                font-family: Georgia, 'Times New Roman', serif;
                font-size: 1.75rem;
                font-weight: 700;
                letter-spacing: -0.02em;
                line-height: 1;
                margin: 0;
                opacity: 0;
                animation: sl-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards 0.05s;
            }

            .sl-tld {
                font-style: italic;
                color: #f37021;
                font-size: 0.85em;
                margin-left: 0.02em;
            }

            /* ── Three courts row ───────────────────────────────────── */
            .sl-courts-row {
                display: flex;
                align-items: flex-end;
                justify-content: center;
                gap: 20px;
            }

            @media (max-width: 380px) {
                .sl-courts-row { gap: 12px; }
            }

            .sl-court-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }

            .sl-court-svg {
                display: block;
                width: 64px;
                /* Each court is portrait — taller for tennis/badminton */
            }

            @media (max-width: 380px) {
                .sl-court-svg { width: 50px; }
            }

            /* ── Draw animation — stroke-dashoffset 1→0 ─────────────
               All stroked elements use stroke-dasharray="1" pathLength="1"
               set as HTML attributes. CSS sets the initial dashoffset to 1
               (fully hidden) then animates to 0 (fully drawn). */

            .sl-court-svg [stroke-dasharray] {
                stroke-dashoffset: 1;
            }

            /* Court 1 — Tennis (draws first) */
            .sl-court-tennis [stroke-dasharray] {
                animation: sl-draw 0.85s ease-in-out forwards 0.25s;
            }
            /* Court 2 — Pickleball (draws second) */
            .sl-court-pickleball [stroke-dasharray] {
                animation: sl-draw 0.85s ease-in-out forwards 0.6s;
            }
            /* Court 3 — Badminton (draws third) */
            .sl-court-badminton [stroke-dasharray] {
                animation: sl-draw 0.85s ease-in-out forwards 0.95s;
            }

            /* Net posts (circles) — pop in right as their court finishes */
            .sl-court-svg circle {
                opacity: 0;
            }
            .sl-court-tennis circle   { animation: sl-pop 0.3s ease forwards 1.0s; }
            .sl-court-pickleball circle { animation: sl-pop 0.3s ease forwards 1.35s; }
            .sl-court-badminton circle  { animation: sl-pop 0.3s ease forwards 1.7s; }

            /* ── Sport labels ────────────────────────────────────────── */
            .sl-court-label {
                font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
                font-size: 0.58rem;
                font-weight: 600;
                letter-spacing: 0.32em;
                text-transform: uppercase;
                color: #5c3a21;
                margin: 0;
                opacity: 0;
            }

            .sl-court-item:nth-child(1) .sl-court-label { animation: sl-fade-up 0.4s ease forwards 0.95s; }
            .sl-court-item:nth-child(2) .sl-court-label { animation: sl-fade-up 0.4s ease forwards 1.3s;  }
            .sl-court-item:nth-child(3) .sl-court-label { animation: sl-fade-up 0.4s ease forwards 1.65s; }

            /* ── Bottom tagline ─────────────────────────────────────── */
            .sl-tagline {
                margin: 0;
                font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
                font-size: 0.6rem;
                font-weight: 500;
                letter-spacing: 0.32em;
                text-transform: uppercase;
                color: #5c3a21;
                opacity: 0;
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                animation: sl-fade-up 0.5s ease forwards 1.85s;
            }

            .sl-tagline::before,
            .sl-tagline::after {
                content: '';
                width: 24px;
                height: 1px;
                background: rgba(62, 40, 23, 0.28);
            }

            /* ── Keyframes ──────────────────────────────────────────── */
            @keyframes sl-draw {
                from { stroke-dashoffset: 1; }
                to   { stroke-dashoffset: 0; }
            }

            @keyframes sl-fade-up {
                from { opacity: 0; transform: translateY(8px); }
                to   { opacity: 1; transform: translateY(0);   }
            }

            @keyframes sl-pop {
                from { opacity: 0; transform: scale(0.4); }
                to   { opacity: 1; transform: scale(1);   }
            }

            /* ── Balls ──────────────────────────────────────────────────
               Each ball uses SMIL <animate> so movement is in SVG user
               units (viewBox space), not CSS pixels — stays accurate at
               any rendered size.  CSS only handles the initial hide +
               reduced-motion opt-out. */

            /* Balls start invisible; SMIL handles the reveal timing */
            .sl-ball { overflow: visible; }

            /* ── Reduced motion — skip all animations ───────────────── */
            @media (prefers-reduced-motion: reduce) {
                .sl-wordmark,
                .sl-court-label,
                .sl-tagline {
                    animation: none !important;
                    opacity: 1 !important;
                    transform: none !important;
                }
                .sl-court-svg [stroke-dasharray] {
                    animation: none !important;
                    stroke-dashoffset: 0 !important;
                }
                .sl-court-svg circle {
                    animation: none !important;
                    opacity: 1 !important;
                    transform: none !important;
                }
                /* Hide balls — they appear as static dots which looks odd */
                .sl-ball { display: none !important; }
            }
        </style>

        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=fraunces:400,700,900|newsreader:400,500,600|instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">

        {{--
            sportify.ph three-court loader
            Three overhead court diagrams draw themselves in sequence:
              Tennis → Pickleball → Badminton
            Each court uses stroke-dasharray="1" pathLength="1" so that
            CSS can animate stroke-dashoffset 1→0 to reveal the lines.
        --}}
        <div id="sportify-loader" role="status" aria-live="polite" aria-label="Loading sportify.ph">

            <p class="sl-wordmark">sportify<span class="sl-tld">.ph</span></p>

            <div class="sl-courts-row" aria-hidden="true">

                {{-- ── Tennis Court ──────────────────────────────────── --}}
                <div class="sl-court-item">
                    <svg class="sl-court-svg sl-court-tennis" viewBox="0 0 60 100" fill="none" aria-hidden="true">
                        {{-- Court surface fill --}}
                        <rect x="3" y="3" width="54" height="94" fill="#f1e8d8"/>
                        {{-- Outer perimeter --}}
                        <rect x="3" y="3" width="54" height="94"
                              stroke="#3e2817" stroke-width="1.6"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Singles sidelines --}}
                        <line x1="13" y1="3"  x2="13" y2="97"
                              stroke="#3e2817" stroke-width="0.7" stroke-opacity="0.45"
                              stroke-dasharray="1" pathLength="1"/>
                        <line x1="47" y1="3"  x2="47" y2="97"
                              stroke="#3e2817" stroke-width="0.7" stroke-opacity="0.45"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Service lines --}}
                        <line x1="13" y1="25" x2="47" y2="25"
                              stroke="#3e2817" stroke-width="0.7" stroke-opacity="0.45"
                              stroke-dasharray="1" pathLength="1"/>
                        <line x1="13" y1="75" x2="47" y2="75"
                              stroke="#3e2817" stroke-width="0.7" stroke-opacity="0.45"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Centre service line --}}
                        <line x1="30" y1="25" x2="30" y2="75"
                              stroke="#3e2817" stroke-width="0.6" stroke-opacity="0.3"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Baseline centre marks --}}
                        <line x1="30" y1="3"  x2="30" y2="10"
                              stroke="#3e2817" stroke-width="0.8" stroke-opacity="0.3"
                              stroke-dasharray="1" pathLength="1"/>
                        <line x1="30" y1="90" x2="30" y2="97"
                              stroke="#3e2817" stroke-width="0.8" stroke-opacity="0.3"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Net (Hermès orange) --}}
                        <line x1="3"  y1="50" x2="57" y2="50"
                              stroke="#f37021" stroke-width="2.2"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Net posts --}}
                        <circle cx="3"  cy="50" r="3" fill="#f37021"/>
                        <circle cx="57" cy="50" r="3" fill="#f37021"/>
                        {{-- Tennis ball — appears after court draws, rallies cross-court diagonally --}}
                        <circle class="sl-ball" cx="16" cy="72" r="2.8" fill="#c8e64a" opacity="0">
                            <animate attributeName="opacity" from="0" to="1" dur="0.25s" begin="1.1s" fill="freeze"/>
                            <animate attributeName="cx" values="16;44;16" dur="1.4s" begin="1.1s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>
                            <animate attributeName="cy" values="72;28;72" dur="1.4s" begin="1.1s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>
                        </circle>
                    </svg>
                    <p class="sl-court-label">Tennis</p>
                </div>

                {{-- ── Pickleball Court ───────────────────────────────── --}}
                <div class="sl-court-item">
                    {{-- Pickleball courts are shorter relative to width —
                         real ratio ≈ 44×20 ft. We keep the same viewBox
                         but adjust the markings accordingly. --}}
                    <svg class="sl-court-svg sl-court-pickleball" viewBox="0 0 60 100" fill="none" aria-hidden="true">
                        {{-- Court surface fill --}}
                        <rect x="3" y="3" width="54" height="94" fill="#f1e8d8"/>
                        {{-- Outer perimeter --}}
                        <rect x="3" y="3" width="54" height="94"
                              stroke="#3e2817" stroke-width="1.6"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Kitchen / NVZ lines (7 ft from net on 22-ft half = 31.8%) --}}
                        <line x1="3"  y1="35" x2="57" y2="35"
                              stroke="#3e2817" stroke-width="0.8" stroke-opacity="0.55"
                              stroke-dasharray="1" pathLength="1"/>
                        <line x1="3"  y1="65" x2="57" y2="65"
                              stroke="#3e2817" stroke-width="0.8" stroke-opacity="0.55"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Centre line — top service box --}}
                        <line x1="30" y1="3"  x2="30" y2="35"
                              stroke="#3e2817" stroke-width="0.7" stroke-opacity="0.38"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Centre line — bottom service box --}}
                        <line x1="30" y1="65" x2="30" y2="97"
                              stroke="#3e2817" stroke-width="0.7" stroke-opacity="0.38"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Net --}}
                        <line x1="3"  y1="50" x2="57" y2="50"
                              stroke="#f37021" stroke-width="2.2"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Net posts --}}
                        <circle cx="3"  cy="50" r="3" fill="#f37021"/>
                        <circle cx="57" cy="50" r="3" fill="#f37021"/>
                        {{-- Pickleball — fast dink exchange near the kitchen lines --}}
                        <circle class="sl-ball" cx="20" cy="62" r="2.4" fill="#ffe135" opacity="0">
                            <animate attributeName="opacity" from="0" to="1" dur="0.25s" begin="1.45s" fill="freeze"/>
                            <animate attributeName="cx" values="20;40;20" dur="0.85s" begin="1.45s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>
                            <animate attributeName="cy" values="62;38;62" dur="0.85s" begin="1.45s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>
                        </circle>
                    </svg>
                    <p class="sl-court-label">Pickleball</p>
                </div>

                {{-- ── Badminton Court ─────────────────────────────────── --}}
                <div class="sl-court-item">
                    <svg class="sl-court-svg sl-court-badminton" viewBox="0 0 60 100" fill="none" aria-hidden="true">
                        {{-- Court surface fill --}}
                        <rect x="3" y="3" width="54" height="94" fill="#f1e8d8"/>
                        {{-- Outer perimeter (doubles boundary) --}}
                        <rect x="3" y="3" width="54" height="94"
                              stroke="#3e2817" stroke-width="1.6"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Singles sidelines (tram lines) --}}
                        <line x1="11" y1="3"  x2="11" y2="97"
                              stroke="#3e2817" stroke-width="0.65" stroke-opacity="0.4"
                              stroke-dasharray="1" pathLength="1"/>
                        <line x1="49" y1="3"  x2="49" y2="97"
                              stroke="#3e2817" stroke-width="0.65" stroke-opacity="0.4"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Back boundary lines for doubles service --}}
                        <line x1="3"  y1="13" x2="57" y2="13"
                              stroke="#3e2817" stroke-width="0.65" stroke-opacity="0.4"
                              stroke-dasharray="1" pathLength="1"/>
                        <line x1="3"  y1="87" x2="57" y2="87"
                              stroke="#3e2817" stroke-width="0.65" stroke-opacity="0.4"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Short service lines --}}
                        <line x1="3"  y1="30" x2="57" y2="30"
                              stroke="#3e2817" stroke-width="0.75" stroke-opacity="0.5"
                              stroke-dasharray="1" pathLength="1"/>
                        <line x1="3"  y1="70" x2="57" y2="70"
                              stroke="#3e2817" stroke-width="0.75" stroke-opacity="0.5"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Centre line (between short service lines only) --}}
                        <line x1="30" y1="30" x2="30" y2="70"
                              stroke="#3e2817" stroke-width="0.6" stroke-opacity="0.3"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Net --}}
                        <line x1="3"  y1="50" x2="57" y2="50"
                              stroke="#f37021" stroke-width="2.2"
                              stroke-dasharray="1" pathLength="1"/>
                        {{-- Net posts --}}
                        <circle cx="3"  cy="50" r="3" fill="#f37021"/>
                        <circle cx="57" cy="50" r="3" fill="#f37021"/>
                        {{-- Shuttlecock — wide arcing smash across the full court.
                             <g> at origin + animateTransform lets us move the
                             white body + orange cork together in SVG user units. --}}
                        <g class="sl-ball" opacity="0">
                            <animate attributeName="opacity" from="0" to="1" dur="0.25s" begin="1.8s" fill="freeze"/>
                            <animateTransform attributeName="transform" type="translate"
                                values="15,80; 45,20; 15,80" dur="1.6s" begin="1.8s"
                                repeatCount="indefinite" calcMode="spline"
                                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>
                            {{-- Feather body (white) --}}
                            <circle cx="0" cy="0" r="2.6" fill="#faf5ec" stroke="#5c3a21" stroke-width="0.7"/>
                            {{-- Cork tip (orange) --}}
                            <circle cx="0" cy="0" r="0.9" fill="#f37021"/>
                        </g>
                    </svg>
                    <p class="sl-court-label">Badminton</p>
                </div>

            </div>{{-- .sl-courts-row --}}

            <p class="sl-tagline">Iligan City · Racquet Sports</p>

        </div>{{-- #sportify-loader --}}

        <script>
            (function () {
                var loader = document.getElementById('sportify-loader');

                if (!loader) {
                    return;
                }

                // Keep loader visible long enough for courts to draw + balls to rally.
                var MIN_DISPLAY_MS = 2800;
                var startedAt = performance.now();
                var dismissed = false;

                function dismiss() {
                    if (dismissed) {
                        return;
                    }

                    var elapsed = performance.now() - startedAt;
                    var wait = Math.max(0, MIN_DISPLAY_MS - elapsed);

                    dismissed = true;

                    window.setTimeout(function () {
                        loader.classList.add('is-hidden');
                        window.setTimeout(function () {
                            loader.parentNode && loader.parentNode.removeChild(loader);
                        }, 800);
                    }, wait);
                }

                if (document.readyState === 'complete') {
                    dismiss();
                } else {
                    window.addEventListener('load', dismiss, { once: true });
                }

                // Safety net — if `load` never fires (e.g. broken asset), dismiss after 6s.
                window.setTimeout(dismiss, 6000);
            })();
        </script>

        <x-inertia::app />
    </body>
</html>
