import { Modal, Setting, FuzzySuggestModal, MarkdownView, TFile, Editor } from "obsidian";
import { DropdownFieldDefinition, FieldDefinition } from "./domain";
import TypedTemplaterPlugin from 'main'
import { errorWrapperSync, getTFilesFromFolder, logError, omit, TemplaterError, toNotePage, toRawString } from "./utils";
import _ from 'lodash'

export class VariableValuesModal extends Modal {
  fieldDefenitions: FieldDefinition[];
  fieldValuesMap: Map<string, string>;
  onSubmit: (fieldValuesMap: Map<string, string>) => void;

  constructor(
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

      case 'Select':
        setting.addDropdown((comp) => {
          const options = (fieldDef as DropdownFieldDefinition).options
            .reduce(
              (acc, item) => (acc[item] = item, acc),
              {} as Record<string, string>
            )

          comp.addOptions(options)
            .onChange(setValueOnChange)
        })
    }
  }
}

export class TemplateSuggesterModal extends FuzzySuggestModal<TFile> {
  private plugin: TypedTemplaterPlugin

  constructor(plugin: TypedTemplaterPlugin) {
    super(app);
    this.plugin = plugin;
    this.setPlaceholder("Type name of a template...");
  }

  getItems(): TFile[] {
    if (!this.plugin.settings.templatesFolder) {
      return [];
    }
    const files = errorWrapperSync(
      () => getTFilesFromFolder(this.plugin.settings.templatesFolder),
      `Couldn't retrieve template files from templates folder ${this.plugin.settings.templatesFolder}`
    );
    if (!files) {
      return [];
    }
    return files;
  }

  getItemText(item: TFile): string {
      return item.basename;
  }

  async onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): Promise<void> {
    let templateContent = await this.app.vault.cachedRead(item)

    const { frontmatter, body } = toNotePage(templateContent)
    const fieldDefs = (frontmatter.templateVariables || []) as FieldDefinition[]
    const frontmatterCopy = _.omit(frontmatter, ["templateVariables"])
    const preparedTemplate = toRawString({ frontmatter: frontmatterCopy, body: body })

    console.log({ item, templateContent, frontmatter, frontmatterCopy, fieldDefs })

    new VariableValuesModal(fieldDefs, valuesMap => {
      const editor = this.getEditor();

      editor?.setValue(this.renderTemplate(preparedTemplate, valuesMap))
    }).open()
  }

  renderTemplate(templateContent: string, valuesMap: Map<string, string>): string {
    let contentRaw = templateContent

    for (const [id, value] of valuesMap) {
      contentRaw = contentRaw.replace(`{{${id}}}`, value)
    }

    return contentRaw
  }

  getEditor(): Editor | undefined {
    const active_view = app.workspace.getActiveViewOfType(MarkdownView);
    if (active_view === null) {
      logError(
        new TemplaterError("No active view, can't append templates.")
      );
      return;
    }

    return active_view.editor;
  }
}