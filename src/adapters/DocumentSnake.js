export default function (data) {
  return data
    ? {
        title: data.title ?? null,
      }
    : null;
}
