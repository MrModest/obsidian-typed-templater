import { FieldDefinition, NotePage } from "components/domain";
import { normalizePath, Notice, TAbstractFile, TFile, TFolder, Vault } from "obsidian";
import graymatter from 'gray-matter'
import _ from "lodash";

export function getTFilesFromFolder(folder_str: string): Array<TFile> {
    const folder = resolveTFolder(folder_str);

    const files: Array<TFile> = [];
    Vault.recurseChildren(folder, (file: TAbstractFile) => {
        if (file instanceof TFile) {
            files.push(file);
        }
    });

    files.sort((a, b) => {
        return a.basename.localeCompare(b.basename);
    });

    return files;
}

export function resolveTFolder(folderStr: string): TFolder {
    folderStr = normalizePath(folderStr);

    const folder = app.vault.getAbstractFileByPath(folderStr);
    if (!folder) {
        throw new TemplaterError(`Folder "${folderStr}" doesn't exist`);
    }
    if (!(folder instanceof TFolder)) {
        throw new TemplaterError(`${folderStr} is a file, not a folder`);
    }

    return folder;
}

export async function errorWrapper<T>(
    fn: () => Promise<T>,
    msg: string
): Promise<T> {
    try {
        return await fn();
    } catch (e) {
        if (!(e instanceof TemplaterError)) {
            logError(new TemplaterError(msg, e.message));
        } else {
            logError(e);
        }
        return null as T;
    }
}

export function errorWrapperSync<T>(fn: () => T, msg: string): T {
    try {
        return fn();
    } catch (e) {
        logError(new TemplaterError(msg, e.message));
        return null as T;
    }
}

export function logError(e: Error | TemplaterError): void {
    const notice = new Notice("", 8000);
    if (e instanceof TemplaterError && e.console_msg) {
        // TODO: Find a better way for this
        // @ts-ignore
        notice.noticeEl.innerHTML = `<b>Templater Error</b>:<br/>${e.message}<br/>Check console for more information`;
        console.error(`Templater Error:`, e.message, "\n", e.console_msg);
    } else {
        // @ts-ignore
        notice.noticeEl.innerHTML = `<b>Templater Error</b>:<br/>${e.message}`;
    }
}

export class TemplaterError extends Error {
    constructor(msg: string, public console_msg?: string) {
        super(msg);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export function omit(obj: any, omitKey: string): { [key: string]: any; } {
    return Object.keys(obj)
        .filter(key => key != omitKey)
        .reduce((result, key) => ({...result, [key]: obj[key]}), {})
}

export function toNotePage(raw: string): NotePage {
    const { data, content } = graymatter(raw)

    return { frontmatter: _.clone(data), body: content }
}

export function toRawString(note: NotePage): string {
    return graymatter.stringify(note.body, note.frontmatter)
}