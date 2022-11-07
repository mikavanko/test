import ColorAdapter from "./Color"
import TaskAdapter from "./Task"
import { map } from "lodash"

export default function (data) {
  return data
    ? {
        color: ColorAdapter(data.color),
        count: data.count,
        id: data.id,
        name: data.name,
        order: data.order,
        tasks: map(data.tasks, TaskAdapter),
      }
    : null;
}
