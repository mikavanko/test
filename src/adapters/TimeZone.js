export default function (data) {
  return data
    ? {
        id: data.id,
        name: data.name,
        difference: data.difference,
      }
    : null;
}
