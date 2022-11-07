import ColorAdapter from "./Color";

export default function (data) {
  return data
    ? {
        color: ColorAdapter(data.color),
        deskFieldId: data.desk_field_id,
        id: data.id,
        name: data.name,
        order: data.order,
      }
    : null;
}
