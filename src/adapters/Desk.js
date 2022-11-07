import FieldAdapter from "./Field"
import ColumnAdapter from "./Column"
import ProjectItemAdapter from "./ProjectItem"
import { map } from "lodash"

export default function (data) {
  return data
    ? {
        id: data.id,
        columns: map(data.columns, ColumnAdapter),
        fields: map(data.fields, FieldAdapter),
        projectItem: ProjectItemAdapter(data.project_item),
      }
    : null;
}
