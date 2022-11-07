import BlockAdapter from "./Block"
import ProjectItemAdapter from "./ProjectItem"
import { map } from "lodash"

export default function (data) {
  return data
    ? {
        id: data.id,
        blocks: map(data.blocks, BlockAdapter),
        projectItem: ProjectItemAdapter(data.project_item),
      }
    : null;
}
