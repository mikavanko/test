import OptionAdapter from "./Option";
import { map } from "lodash";

export default function (data) {
  return data
    ? {
      id: data.id,
      name: data.name,
      order: data.order,
      type: data.type,
      ...data.options && { options: map(data.options, OptionAdapter) },
      ...data.additional_data && { additionalData: additionalDataAdapter(data.additional_data) },
    }
    : null;
}


function additionalDataAdapter (data) {
  return data ? {
    format: data.format,
    hasEnd: data.has_end,
    hasTime: data.has_time,
    timezone: data.timezone,
  } : null
}