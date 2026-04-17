import { App, Modal, Setting } from "obsidian"
import { FlashcardsSettings } from "./settings"
import FlashcardsLLMPlugin from "./main"
import { availableReasoningModels } from "./models"


// TODO:
// - sticky settings

export class InputModal extends Modal {
  plugin: FlashcardsLLMPlugin
  configuration: FlashcardsSettings;
  multiline: boolean;
  keypressed: boolean;
  onSubmit: (configuration: FlashcardsSettings, multiline: boolean) => void;

  constructor(app: App, plugin: FlashcardsLLMPlugin, onSubmit: (configuration: FlashcardsSettings, multiline: boolean) => void) {
    super(app);
    this.plugin = plugin;
    this.onSubmit = onSubmit;
    this.configuration = { ...this.plugin.settings };
    this.keypressed = false;
  }

  onOpen() {
    let { contentEl } = this;
    contentEl.createEl("h1", { text: "Prompt configuration" });

    new Setting(contentEl)
    .setName("Provider")
    .addDropdown((dropdown) =>
      dropdown
      .addOptions({ openai: "OpenAI", openrouter: "OpenRouter" })
      .setValue(this.configuration.provider)
      .onChange((value: "openai" | "openrouter") => {
        this.configuration.provider = value;
        const isOpenRouter = value === "openrouter";
        reasoningEffortSetting.setDisabled(isOpenRouter || !availableReasoningModels().includes(this.configuration.model));
      })
    );

    new Setting(contentEl)
    .setName("Model")
    .setDesc(this.configuration.provider === "openrouter"
      ? "e.g. anthropic/claude-3-5-sonnet, google/gemini-2.0-flash"
      : "e.g. gpt-4o, o3-mini")
    .addText((text) =>
      text
      .setPlaceholder(this.configuration.provider === "openrouter" ? "anthropic/claude-3-5-sonnet" : "gpt-4o")
      .setValue(this.configuration.model)
      .onChange((value) => {
        this.configuration.model = value;
        reasoningEffortSetting.setDisabled(
          this.configuration.provider === "openrouter" ||
          !availableReasoningModels().includes(value)
        );
      })
    );

    const reasoningEffortSetting = new Setting(contentEl)
    .setName("Reasoning Effort")
    .setDesc("Only applies to OpenAI reasoning models (o1, o3).")
    .addDropdown((dropdown) =>
      dropdown
      .addOptions(Object.fromEntries(["low", "medium", "high"].map(k => [k, k])))
      .setValue(this.configuration.reasoningEffort)
      .onChange((value) => {
        this.configuration.reasoningEffort = value;
      })
    );
    reasoningEffortSetting.setDisabled(
      this.configuration.provider === "openrouter" ||
      !availableReasoningModels().includes(this.configuration.model)
    );

    new Setting(contentEl)
    .setName("Number of flashcards to generate")
    .addText((text) =>
      text
      .setValue(this.configuration.flashcardsCount.toString())
      .onChange((value) => {
        this.configuration.flashcardsCount = Number(value)
      })
    );

    new Setting(contentEl)
    .setName("Flashcards tag")
    .addText((text) =>
      text
      .setPlaceholder("#flashcards")
      .setValue(this.configuration.tag)
      .onChange((value) => {
        this.configuration.tag = value
      })
    );

    new Setting(contentEl)
    .setName("Additional prompt")
    .addText((text) =>
      text
      .setValue(this.configuration.additionalPrompt)
      .onChange((value) => {
        this.configuration.additionalPrompt = value
      })
    );

    new Setting(contentEl)
      .setName("Multiline")
      .addToggle((on) =>
        on
        .setValue(false)
        .onChange((on) => {
          this.multiline = on
        })
      );

    new Setting(contentEl)
      .addButton((btn) =>
        btn
        .setButtonText("Submit")
        .setCta()
        .onClick(() => {
          this.submit();
        })
      );

    contentEl.addEventListener("keyup", ({key}) => {
      if (key === "Enter") {
        if (this.keypressed) {
          this.submit();
        }
        else {
          this.keypressed = true;
        }
      }
    });

  }

  submit() {
    this.close();
    this.onSubmit(this.configuration, this.multiline);
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}
