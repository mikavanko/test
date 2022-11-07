export enum Types {
  unset = "unset",
  document = "document",
  table = "table",
  desk = "desk",
}

export enum DocumentViewsKeys {
  title = "title",
  icon = "icon",
}

export const DocumentViews = {
  [Types.desk]: {
    [DocumentViewsKeys.title]: "Kanban Доска",
    [DocumentViewsKeys.icon]: "board",
  },
  [Types.table]: {
    [DocumentViewsKeys.title]: "Таблица",
    [DocumentViewsKeys.icon]: "board",
  },
}

export const DocumentRoutes = {
  [Types.document]: {
    singular: Types.document,
    plural: Types.document + 's',
  },
  [Types.desk]: {
    singular: Types.desk,
    plural: Types.desk + 's',
  },
  [Types.table]: {
    singular: Types.table,
    plural: Types.table + 's',
  },
}