# TODO

- [x] Choosing template folder
- [x] Popup with list of templates
- [ ] Click Submit by Enter
- [ ] Stylise each input
- [ ] Add validation for each type of input
- [ ] Add more field types (get inspiration from Notion)
  - [ ] Date Picker
  - [x] Selector
  - [ ] Multi-Selector
  - [ ] Computed fields
    - [ ] Timestamp
- [ ] Add validation types for text fields
  - [ ] Email
  - [ ] Url
  - [ ] RegExp
- [ ] Allow to use variables in frontmatter
- [ ] Allow to create a new note via template
- [ ] Setup title of the modal window by template field (like "Adding book/movie/etc)
- [ ] Invent less verbose way to configure fields
- [ ] Add the plugin to the community plugin list

# Typed Templater - Obsidian Plugin

This plugin allows you to use custom and typed (number, text, date) variables in template, by filling them in before your template is applied to the note.

![Demo create a note via template](/doc/ScreenRecord_TypedTemplater.gif)

---

Each fields should be described in template's frontmatter in `templateVariables` array as an element: <br />
`{ key, type, label }`

```yaml
templateVariables:
  - key: name
    type: TextField
    label: 'Enter your name:'
  - key: age
    type: TextField
    label: 'Enter your age:'
  - key: fieldForTemplate
    type: Boolean
    label: 'YAML field'
  - key: status
    type: Select
    label: 'Status'
    options: ['New', 'In progress', 'Done']
  - key: about
    type: TextArea
    label: 'Tell about yourself'
```

The `type` describes a field type (you can find all of them [here](/components/domain.ts)). The `label` will be shown next to the field. Then you can use `key` as a replacement marker. All keys will be matched with respective fields and replaced with the respective values.

---

## Obsidian API Documentation

See https://github.com/obsidianmd/obsidian-api
