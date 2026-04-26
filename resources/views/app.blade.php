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

            /* — — — sportify.ph rally loader — — — */
            #sportify-loader {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 2.25rem;
                background: #faf5ec;
                font-family: Georgia, 'Cormorant Garamond', 'Times New Roman', serif;
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

            .sl-stage {
                position: relative;
                width: min(360px, 78vw);
                aspect-ratio: 9 / 5;
            }

            .sl-court {
                width: 100%;
                height: 100%;
                display: block;
                opacity: 0.95;
            }

            .sl-track-x {
                position: absolute;
                top: 50%;
                left: 11.1%;     /* 40 / 360 */
                width: 77.8%;    /* 280 / 360 */
                height: 0;
                animation: sl-rally-x 1.6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
            }

            .sl-track-y {
                position: absolute;
                top: 0;
                left: 0;
                animation: sl-rally-y 0.8s cubic-bezier(0.33, 0, 0.67, 1) infinite;
            }

            .sl-ball {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #3e2817;
                box-shadow:
                    0 6px 12px -4px rgba(62, 40, 23, 0.45),
                    inset 0 -1px 2px rgba(0, 0, 0, 0.18);
                margin-left: -7px;
                margin-top: -7px;
            }

            .sl-shadow {
                position: absolute;
                top: 50%;
                left: 11.1%;
                width: 77.8%;
                height: 0;
                animation: sl-rally-x 1.6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
            }

            .sl-shadow-dot {
                width: 14px;
                height: 4px;
                border-radius: 50%;
                background: rgba(62, 40, 23, 0.18);
                margin-left: -7px;
                margin-top: 6px;
                animation: sl-shadow-pulse 0.8s ease-in-out infinite;
                filter: blur(1px);
            }

            @keyframes sl-rally-x {
                0%,
                100% {
                    transform: translateX(0);
                }
                50% {
                    transform: translateX(100%);
                }
            }

            @keyframes sl-rally-y {
                0%,
                100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-72px);
                }
            }

            @keyframes sl-shadow-pulse {
                0%,
                100% {
                    transform: scaleX(1);
                    opacity: 0.32;
                }
                50% {
                    transform: scaleX(0.45);
                    opacity: 0.1;
                }
            }

            .sl-wordmark {
                font-family: Georgia, 'Cormorant Garamond', serif;
                font-size: 1.75rem;
                font-weight: 700;
                letter-spacing: -0.02em;
                line-height: 1;
                margin: 0;
            }

            .sl-wordmark .sl-tld {
                font-style: italic;
                color: #f37021;
                font-size: 0.85em;
                margin-left: 0.02em;
            }

            .sl-tagline {
                margin: 0;
                font-family:
                    'Inter', ui-sans-serif, system-ui, sans-serif;
                font-size: 0.65rem;
                font-weight: 500;
                letter-spacing: 0.32em;
                text-transform: uppercase;
                color: #5c3a21;
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
            }

            .sl-tagline::before,
            .sl-tagline::after {
                content: '';
                width: 28px;
                height: 1px;
                background: rgba(62, 40, 23, 0.3);
            }

            @media (prefers-reduced-motion: reduce) {
                .sl-track-x,
                .sl-track-y,
                .sl-shadow,
                .sl-shadow-dot {
                    animation: none !important;
                }
            }
        </style>

        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=cormorant-garamond:400,500,600,700|inter:400,500,600|lora:400,500,600|instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        {{-- sportify.ph rally loader — shown until the page paints + a luxury minimum --}}
        <div id="sportify-loader" role="status" aria-live="polite" aria-label="Loading sportify.ph">
            <div class="sl-stage">
                <svg class="sl-court" viewBox="0 0 360 200" aria-hidden="true">
                    {{-- Court surface --}}
                    <rect x="40" y="60" width="280" height="100" rx="2" fill="#F37021"/>
                    {{-- Outer service-line frame --}}
                    <rect x="60" y="80" width="240" height="60" fill="none" stroke="#FAF5EC" stroke-width="0.8" opacity="0.6"/>
                    {{-- Centre service line --}}
                    <line x1="180" y1="80" x2="180" y2="140" stroke="#FAF5EC" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.55"/>
                    {{-- Net --}}
                    <line x1="180" y1="50" x2="180" y2="170" stroke="#3E2817" stroke-width="1.4"/>
                    <line x1="170" y1="50" x2="190" y2="50" stroke="#3E2817" stroke-width="1.6" stroke-linecap="round"/>
                </svg>

                {{-- Ball shadow follows x but pulses size --}}
                <div class="sl-shadow" aria-hidden="true">
                    <div class="sl-shadow-dot"></div>
                </div>

                {{-- Ball: outer x-track + inner y-track + visible ball --}}
                <div class="sl-track-x" aria-hidden="true">
                    <div class="sl-track-y">
                        <div class="sl-ball"></div>
                    </div>
                </div>
            </div>

            <p class="sl-wordmark">sportify<span class="sl-tld">.ph</span></p>
        </div>

        <script>
            (function () {
                var loader = document.getElementById('sportify-loader');

                if (!loader) {
                    return;
                }

                var MIN_DISPLAY_MS = 1100;
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
