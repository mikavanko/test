export default function (data) {
  return data
    ? {
        id: data.id,
        name: data.name,
        originalUrl: data.original_url,
        previewUrl: data.preview_url,
      }
    : null;
}
