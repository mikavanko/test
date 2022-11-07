export default function (data) {
  return data
    ? {
        old_password: data.oldPassword,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
      }
    : null;
}
