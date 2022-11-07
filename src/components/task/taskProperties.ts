export enum TYPE {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  PROPERTY = "PROPERTY",
  MULTI_LIST = "MULTI_LIST",
  DATE = "DATE",
  PEOPLE = "PEOPLE",
  FILE = "FILE",
  CHECKBOX = "CHECKBOX",
  URL = "URL",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
}

export const TYPE_ICONS = {
  [TYPE.TEXT]: "text",
  [TYPE.NUMBER]: "number",
  [TYPE.PROPERTY]: "arrow-circle",
  [TYPE.MULTI_LIST]: "multi-list",
  [TYPE.DATE]: "calendar",
  [TYPE.PEOPLE]: "users",
  [TYPE.FILE]: "clip",
  [TYPE.CHECKBOX]: "tick-square",
  [TYPE.URL]: "link",
  [TYPE.EMAIL]: "email",
  [TYPE.PHONE]: "phone",
}

export const TYPE_PLACEHOLDERS = {
  [TYPE.TEXT]: "Текст",
  [TYPE.NUMBER]: "Номер",
  [TYPE.PROPERTY]: "Свойства",
  [TYPE.MULTI_LIST]: "Множественный список",
  [TYPE.DATE]: "Дата",
  [TYPE.PEOPLE]: "Люди",
  [TYPE.FILE]: "Файлы и медиа",
  [TYPE.CHECKBOX]: "Чекбокс",
  [TYPE.URL]: "Ссылка",
  [TYPE.EMAIL]: "Email",
  [TYPE.PHONE]: "Телефон",
}

export enum NUMBER_FORMAT {
  NUMBER = "NUMBER",
  PERCENT = "PERCENT",
  DOLLAR = "DOLLAR",
  EURO = "EURO",
  RUBBLE = "RUBBLE",
}

export enum NUMBER_FORMAT_NAMES {
  NUMBER = "Номер",
  PERCENT = "Процент",
  DOLLAR = "Доллар",
  EURO = "Евро",
  RUBBLE = "Рубль",
}
export enum NUMBER_FORMAT_NAMES_TO_SIGNS {
  NUMBER = "",
  PERCENT = "%",
  DOLLAR = "$",
  EURO = "€",
  RUBBLE = "₽",
}

export enum TIME_ZONES {
  MOSCOW = 427,
}

export enum TIME_FORMATS {
  FULL_DATE = "YYYY-MM-DD hh:mm:ss",
  TYPE_2 = "DD/MM/YYYY",
  TYPE_3 = "YYYY/MM/DD",
  TYPE_4 = "YYYY-MM-DD",
} 

export enum TIME_FORMATS_ID{
  DEFAULT = 4,
}

export const TIME_FORMATS_ID_NO_TIME = [2,3,4]
export const TIME_FORMATS_ID_WITH_TIME = [6,7,8]
export const TIME_FORMATS_ID_RELATED = {
  2: 6,
  3: 7,
  4: 8,
  6: 2,
  7: 3,
  8: 4,
}

export const FILE_TYPE = {
  IMAGE: "IMAGE",
  DOC: "DOC",
}

export const FILE_TYPE_EXTENSION = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif'],
}

