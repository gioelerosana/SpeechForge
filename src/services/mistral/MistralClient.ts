import { CapacitorHttp } from "@capacitor/core";
import { isCapacitorRuntime } from "../../utils/platform";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class MistralClient {
  private apiKey: string;
  private baseUrl = "https://api.mistral.ai/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(url: string, init: RequestInit = {}): Promise<any> {
    if (isCapacitorRuntime()) {
      const options = {
        url,
        method: init.method || "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          ...(init.headers as Record<string, string>),
        },
        data: init.body instanceof FormData ? undefined : (init.body ? JSON.parse(init.body as string) : undefined),
      };
      
      // Note: FormData is handled differently in Capacitor native bridge.
      // For transcription, we'll stick to standard fetch which Capacitor patches if possible,
      // or we'd need a specialized multi-part implementation.
      if (init.body instanceof FormData) {
          // Fallback to standard fetch for FormData
          return fetch(url, { ...init, headers: { "Authorization": `Bearer ${this.apiKey}`, ...init.headers } });
      }

      const response = await CapacitorHttp.request(options);
      return {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          text: async () => JSON.stringify(response.data),
          json: async () => response.data,
      };
    }

    return fetch(url, {
      ...init,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        ...init.headers,
      },
    });
  }

  async validateApiKey(): Promise<void> {
    const response = await this.request(`${this.baseUrl}/models`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${errorText}`;
      try {
        const json = JSON.parse(errorText);
        if (json.error && json.error.message) {
          errorMessage = json.error.message;
        }
      } catch {
        // Ignore parse errors.
      }

      throw new Error(errorMessage);
    }
  }

  async transcribe(audioBlob: Blob): Promise<string> {
    console.log(
      "[MistralClient] Starting transcription, blob size:",
      audioBlob.size,
    );

    const formData = new FormData();
    formData.append("file", audioBlob, "audio.mp3");
    formData.append("model", "voxtral-mini-latest");

    console.log("[MistralClient] Sending request to Mistral API...");
    
    // For transcription we use the standard fetch because of FormData complexity
    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    console.log("[MistralClient] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[MistralClient] Error response:", errorText);
      let errorMessage = `HTTP ${response.status}: ${errorText}`;
      try {
        const json = JSON.parse(errorText);
        if (json.error && json.error.message) {
          errorMessage = json.error.message;
        }
      } catch {
        /* ignore */
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[MistralClient] Transcription successful, result:", result);
    return result.text;
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    const { model = "mistral-small-latest", temperature = 0.7, maxTokens = 1024 } = options;

    console.log("[MistralClient] Starting chat with model:", model);

    const response = await this.request(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    console.log("[MistralClient] Chat response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[MistralClient] Chat error response:", errorText);
      let errorMessage = `HTTP ${response.status}: ${errorText}`;
      try {
        const json = JSON.parse(errorText);
        if (json.error && json.error.message) {
          errorMessage = json.error.message;
        }
      } catch {
        /* ignore */
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[MistralClient] Chat successful, result:", result);
    return result.choices[0].message.content;
  }
}
