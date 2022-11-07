export default function (data) {
  return data
    ? {
        old_phone_code: data.oldPhoneCode,
        phone: data.phone,
        code: data.code,
      }
    : null;
}
