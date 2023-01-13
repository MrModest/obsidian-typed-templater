// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { App, TAbstractFile, TFile } from "obsidian";
import { TextInputSuggest } from "./suggest";
import { getTFilesFromFolder, errorWrapperSync } from "components/utils";

export class FileSuggest extends TextInputSuggest<TFile> {
    constructor(
        app: App,
        public inputEl: HTMLInputElement,
        private templateFolder: string
    ) {
        super(app, inputEl);
    }

    getSuggestions(input_str: string): TFile[] {
        const allFiles = errorWrapperSync(
            () => getTFilesFromFolder(this.templateFolder),
            `Templates folder doesn't exist`
        );
        if (!allFiles) {
            return [];
        }

        const files: TFile[] = [];
        const lowerInputStr = input_str.toLowerCase();

        allFiles.forEach((file: TAbstractFile) => {
            if (
                file instanceof TFile &&
                file.extension === "md" &&
                file.path.toLowerCase().contains(lowerInputStr)
            ) {
                files.push(file);
            }
        });

        return files;
    }

    renderSuggestion(file: TFile, el: HTMLElement): void {
        el.setText(file.path);
    }

    selectSuggestion(file: TFile): void {
        this.inputEl.value = file.path;
        this.inputEl.trigger("input");
        this.close();
    }
}