import ExecutorAdapter from "./Executor";
import FieldValueAdapter from "./FieldValue";
import { map } from "lodash";

export default function (data) {
  return data
    ? {
        executors: map(data.executors, ExecutorAdapter),
        fields: map(data.fields, FieldValueAdapter),
        id: data.id,
        name: data.name,
        order: data.order,
      }
    : null;
}
