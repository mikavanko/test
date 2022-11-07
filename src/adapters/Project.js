import AvatarAdapter from "./Avatar"
import LinkAdapter from "./Link"
import ProjectItemAdapter from "./ProjectItem"
import { map } from "lodash"

export default function (data) {
  return data
    ? {
        avatar: AvatarAdapter(data.avatar),
        id: data.id,
        name: data.name,
        link: LinkAdapter(data.link),
        items: map(data.items, ProjectItemAdapter)
      }
    : null;
}
