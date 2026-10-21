function shouldRetryAiStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callAI(apiKey: string | undefined, prompt: string): Promise<string> {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
  const maxAttemptsPerModel = 3;

  let lastErrorMessage = "AI call failed after retries with all models";

  const modelErrors: string[] = [];
  for (const model of models) {
    console.log(`Attempting AI call with model: ${model}`);
    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt++) {
      let response: Response;
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
              },
            }),
          }
        );
      } catch (error) {
        const err = error instanceof Error ? error.message : String(error);
        lastErrorMessage = `AI request error with ${model}: ${err}`;
        if (attempt < maxAttemptsPerModel) {
          const backoffMs = 1000 * attempt + Math.floor(Math.random() * 400);
          console.warn(`${lastErrorMessage} | retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxAttemptsPerModel})`);
          await sleep(backoffMs);
          continue;
        }
        break; // All attempts for this model failed, break to try the next model
      }

      if (!response.ok) {
        const errText = await response.text();
        const message = `AI call failed with ${model} [${response.status}]: ${errText}`;
        lastErrorMessage = message;
        if (shouldRetryAiStatus(response.status) && attempt < maxAttemptsPerModel) {
          const backoffMs = 1000 * attempt + Math.floor(Math.random() * 400);
          console.warn(`${message} | retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxAttemptsPerModel})`);
          await sleep(backoffMs);
          continue;
        }
        break; // All attempts for this model failed, break to try the next model
      }

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part?.text || "")
        .join("")
        .trim();
      if (!content) {
        lastErrorMessage = `No content returned from AI with ${model}`;
        if (attempt < maxAttemptsPerModel) {
          const backoffMs = 1000 * attempt + Math.floor(Math.random() * 400);
          console.warn(`${lastErrorMessage} | retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxAttemptsPerModel})`);
          await sleep(backoffMs);
          continue;
        }
        break; // All attempts for this model failed, break to try the next model
      }
      return content; // Successfully got content, return it
    }
    modelErrors.push(lastErrorMessage);
  }

  throw new Error(modelErrors.join("\n"));
}

