export default function (data) {
  return data
    ? {
        document_target_id: data.documentTargetId ?? null,
      }
    : null;
}
