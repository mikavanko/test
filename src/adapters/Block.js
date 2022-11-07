export default function (data) {
  return data
    ? {
        blockNumber: data.block_number,
        text: data.text,
      }
    : null;
}
