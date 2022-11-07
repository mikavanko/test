export default function (data) {
  return data
    ? {
        field: data.field ?? "projects.id",
        type: data.type ?? "!=",
        value: data.value ?? 0,
      }
    : null;
}
