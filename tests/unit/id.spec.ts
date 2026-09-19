import { describe, expect, it } from "vitest";

import { generateId } from "@/utils/id";

describe("generateId", () => {
  it("uses the browser crypto UUID API when available", () => {
    const originalCrypto = globalThis.crypto;

    Object.defineProperty(globalThis, "crypto", {
      value: {
        randomUUID: () => "browser-generated-id",
      },
      configurable: true,
    });

    expect(generateId()).toBe("browser-generated-id");

    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      configurable: true,
    });
  });

  it("falls back when crypto.randomUUID is unavailable", () => {
    const originalCrypto = globalThis.crypto;

    Object.defineProperty(globalThis, "crypto", {
      value: {},
      configurable: true,
    });

    const id = generateId();

    expect(id).toMatch(/^[0-9a-f-]{36}$/i);

    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      configurable: true,
    });
  });
});
