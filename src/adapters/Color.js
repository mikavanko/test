export default function (data) {
  return data
    ? {
        color: data.color,
        id: data.id,
        name: data.name,
      }
    : null;
}
