export default function (data) {
  return data
    ? {
        phone: data.phone,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
        id: data.id,
      }
    : null;
}
