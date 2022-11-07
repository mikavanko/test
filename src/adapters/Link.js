export default function (data) {
  return data
    ? {
        isAvailable: data.is_available,
        link: data.link,
      }
    : null;
}
