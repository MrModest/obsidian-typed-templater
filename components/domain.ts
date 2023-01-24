export type FieldType =
    | 'TextField'
    | 'TextArea'
    | 'Number'
    | 'Boolean'
    | 'Date'
    | 'Time'
    | 'DateAndTime'
    | 'Select'
    | 'Multiselect'

export interface FieldDefinition {
    key: string;
    label: string;
    type: FieldType;
}

export type DropdownFieldDefinition = FieldDefinition & {
    options: string[]
}

export interface NotePage {
    frontmatter: { [key: string]: any }
    body: string
}