export default function (data) {
  return data
    ? {
        id: data.id,
        name: data.name,
        format: data.format,
        formatWithTime: data.format_with_time,
      }
    : null;
}
