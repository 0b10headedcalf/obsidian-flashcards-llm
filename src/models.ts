export function availableChatModels(): Array<string> {
  return ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"]
}

export function availableCompletionModels(): Array<string> {
  return []
}

export function availableReasoningModels(): Array<string> {
  return ["o1", "o1-mini", "o3", "o3-mini"]
}

export function allAvailableModels(): Array<string> {
  return availableChatModels().concat(availableReasoningModels(), availableCompletionModels())
}

export const PROVIDER_BASE_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
}
