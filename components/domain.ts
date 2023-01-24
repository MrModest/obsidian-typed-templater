export type FieldType =
    | 'TextField'
    | 'TextArea'
    | 'Number'
    | 'Boolean'
    | 'Date'
    | 'Time'
    | 'DateAndTime'

export interface FieldDefinition {
    key: string;
    label: string;
    type: FieldType;
}

export interface NotePage {
    frontmatter: { [key: string]: any }
    body: string
}