import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { MistralClient, type ChatMessage } from "./MistralClient";

const originalFetch = globalThis.fetch;

describe("MistralClient", () => {
  beforeEach(() => {
    globalThis.fetch = originalFetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("sends transcription request with auth and returns text", async () => {
    let capturedUrl = "";
    let capturedInit: RequestInit | undefined;

    globalThis.fetch = (async (
      url: string | URL | Request,
      init?: RequestInit,
    ) => {
      capturedUrl = String(url);
      capturedInit = init;
      return new Response(JSON.stringify({ text: "transcribed text" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof fetch;

    const client = new MistralClient("secret-key");
    const result = await client.transcribe(
      new Blob(["audio-bytes"], { type: "audio/wav" }),
    );

    expect(result).toBe("transcribed text");
    expect(capturedUrl).toBe("https://api.mistral.ai/v1/audio/transcriptions");
    expect(capturedInit?.method).toBe("POST");
    expect(
      (capturedInit?.headers as Record<string, string>)?.Authorization,
    ).toBe("Bearer secret-key");
    expect(capturedInit?.body).toBeInstanceOf(FormData);

    const body = capturedInit?.body as FormData;
    expect(body.get("model")).toBe("voxtral-mini-latest");
    expect(body.get("file")).toBeInstanceOf(File);
  });

  it("uses API error message from JSON response when available", async () => {
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({ error: { message: "Invalid API key" } }),
        {
          status: 401,
        },
      );
    }) as unknown as typeof fetch;

    const client = new MistralClient("bad-key");
    await expect(client.transcribe(new Blob(["audio"]))).rejects.toThrow(
      "Invalid API key",
    );
  });

  it("falls back to HTTP status + body for non-JSON error", async () => {
    globalThis.fetch = (async () => {
      return new Response("gateway timeout", { status: 504 });
    }) as unknown as typeof fetch;

    const client = new MistralClient("key");
    await expect(client.transcribe(new Blob(["audio"]))).rejects.toThrow(
      "HTTP 504: gateway timeout",
    );
  });

  describe("chat", () => {
    it("sends chat request with messages and options", async () => {
      let capturedUrl = "";
      let capturedInit: RequestInit | undefined;

      globalThis.fetch = (async (
        url: string | URL | Request,
        init?: RequestInit,
      ) => {
        capturedUrl = String(url);
        capturedInit = init;
        return new Response(
          JSON.stringify({
            choices: [{ message: { content: "Hello! How can I help?" } }],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }) as unknown as typeof fetch;

      const client = new MistralClient("secret-key");
      const messages: ChatMessage[] = [
        { role: "user", content: "Hello" },
      ];
      const result = await client.chat(messages, {
        model: "mistral-tiny-latest",
        temperature: 0.7,
        maxTokens: 1024,
      });

      expect(result).toBe("Hello! How can I help?");
      expect(capturedUrl).toBe("https://api.mistral.ai/v1/chat/completions");
      expect(capturedInit?.method).toBe("POST");
      expect(
        (capturedInit?.headers as Record<string, string>)?.Authorization,
      ).toBe("Bearer secret-key");
      expect(
        (capturedInit?.headers as Record<string, string>)?.["Content-Type"],
      ).toBe("application/json");

      const body = JSON.parse(capturedInit?.body as string);
      expect(body.model).toBe("mistral-tiny-latest");
      expect(body.temperature).toBe(0.7);
      expect(body.max_tokens).toBe(1024);
      expect(body.messages).toEqual([{ role: "user", content: "Hello" }]);
    });

    it("uses default options when not provided", async () => {
      let capturedInit: RequestInit | undefined;

      globalThis.fetch = (async (
        _url: string | URL | Request,
        init?: RequestInit,
      ) => {
        capturedInit = init;
        return new Response(
          JSON.stringify({
            choices: [{ message: { content: "Default response" } }],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }) as unknown as typeof fetch;

      const client = new MistralClient("key");
      await client.chat([{ role: "user", content: "Hi" }]);

      const body = JSON.parse(capturedInit?.body as string);
      expect(body.model).toBe("mistral-small-latest");
      expect(body.temperature).toBe(0.7);
      expect(body.max_tokens).toBe(1024);
    });

    it("throws error on API failure", async () => {
      globalThis.fetch = (async () => {
        return new Response(
          JSON.stringify({ error: { message: "Rate limit exceeded" } }),
          { status: 429 },
        );
      }) as unknown as typeof fetch;

      const client = new MistralClient("key");
      await expect(
        client.chat([{ role: "user", content: "Hello" }]),
      ).rejects.toThrow("Rate limit exceeded");
    });

    it("falls back to HTTP status for non-JSON error", async () => {
      globalThis.fetch = (async () => {
        return new Response("Too many requests", { status: 429 });
      }) as unknown as typeof fetch;

      const client = new MistralClient("key");
      await expect(
        client.chat([{ role: "user", content: "Hello" }]),
      ).rejects.toThrow("HTTP 429: Too many requests");
    });
  });

});
