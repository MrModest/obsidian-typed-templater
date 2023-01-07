import { App, Modal, Setting } from "obsidian";
import { FieldDefinition } from "./domain";

export class VariableValuesModal extends Modal {
  fieldDefenitions: FieldDefinition[];
  fieldValuesMap: Map<string, string>;
  onSubmit: (fieldValuesMap: Map<string, string>) => void;

  constructor(
    app: App,
    fieldDefenitions: FieldDefinition[],
    onSubmit: (fieldValuesMap: Map<string, string>
  ) => void) {
    super(app);
    this.onSubmit = onSubmit;
    this.fieldDefenitions = fieldDefenitions;
    this.fieldValuesMap = new Map<string, string>()
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h1", { text: "Put values for the variables of the template" });

    this.fieldDefenitions.forEach(fieldDef => {
      this.addComponent(fieldDef)
    })

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Submit")
          .setCta()
          .onClick(() => {
            this.close();
            this.onSubmit(this.fieldValuesMap);
          }));
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }

  addComponent(fieldDef: FieldDefinition) {
    const setValueOnChange = (value: string | boolean) =>
      this.fieldValuesMap.set(fieldDef.key, value.toString())

    const setting = new Setting(this.contentEl)
      .setName(fieldDef.label);

    switch(fieldDef.type) {
      case 'TextArea':
        setting.addTextArea((comp) =>
          comp.onChange(setValueOnChange)
        )
        break
  
      case 'TextField':
        setting.addText((comp) =>
          comp.onChange(setValueOnChange)
        )
        break
  
      case 'Boolean':
        setting.addToggle((comp) =>
          comp.onChange(setValueOnChange)
        )
        break
    }
  }
}