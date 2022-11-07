import UserAdapter from "./User"
import LinkAdapter from "./Link"

export default function (data) {
  return data
    ? {
        editor: UserAdapter(data.editor),
        id: data.id,
        isActive: data.is_active,
        itemId: data.item_id,
        itemType: data.item_type,
        link: LinkAdapter(data.link),
        name: data.name,
        order: data.order,
      }
    : null;
}
