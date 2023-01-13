import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { FolderSuggest } from 'components/suggesters/FolderSuggester';
import { TemplateSuggesterModal } from 'components/modals';

interface TypedTemplaterSettings {
	templatesFolder: string;
}

const DEFAULT_SETTINGS: TypedTemplaterSettings = {
	templatesFolder: ''
}

export default class TypedTemplaterPlugin extends Plugin {
	settings: TypedTemplaterSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'obsidian-typed-templater-insert-template',
			name: 'Insert Template',
			callback: () => {
				new TemplateSuggesterModal(this.app, this).open()
			}
		})

		this.addSettingTab(new TypedTemplaterSettingTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

class TypedTemplaterSettingTab extends PluginSettingTab {
	plugin: TypedTemplaterPlugin;

	constructor(app: App, plugin: TypedTemplaterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Template folder location')
			.setDesc('Files in this folder will be availiable as templates.')
			.addSearch((cb) => {
                new FolderSuggest(this.app, cb.inputEl);
                cb.setPlaceholder("Example: folder1/folder2")
                    .setValue(this.plugin.settings.templatesFolder)
                    .onChange((newFolder) => {
                        this.plugin.settings.templatesFolder = newFolder;
                        this.plugin.saveSettings();
                    });
            });
	}
}
