import FieldAdapter from "./Field"
import MediaAdapter from "./Media"
import { TYPE } from "@/components/task/taskProperties";
import { map } from "lodash"

export default function (data) {
  const field = FieldAdapter(data.field)
  const value = valueAdapter(data.value, field.type)
  
  return data
    ? {
        id: data.id,
        value,
        field,
      }
    : null;
}

const valueAdapter = (value, type) => {
  switch (type) {
    case TYPE.NUMBER:
      return {
        format: value.format,
        number: value.number
      }
      break;
    case TYPE.FILE:
      return map(value, MediaAdapter)
      break;
    case TYPE.DATE:
      return {
        format: value.format ?? null,
        timeFormat: value.time_format ?? null,
        from: value.from ?? null,
        to: value.to ?? null,
        name: value.name ?? null,
      }
      break;
    default:
      return value

  }
}