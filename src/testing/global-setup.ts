// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
/**
 * This file is automatically executed by vitest before the actual test suite is run.
 * See `vite.config.ts` and https://vitest.dev/config/#setupfiles
 */
import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined") {
    // Running with mocked dom (happy-dom or jsdom)
    if (!globalThis.ResizeObserver) {
        const ResizeObserver = (await import("resize-observer-polyfill")).default;
        globalThis.ResizeObserver = ResizeObserver;
    }
}
