export default function (data) {
  return data
    ? {
        field: data.field ?? null,
        direction: data.direction ?? null,
      }
    : null;
}
