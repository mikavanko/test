import AvatarAdapter from "./Avatar"

export default function (data) {
  return data
    ? {
        avatar: AvatarAdapter(data.avatar),
        email: data.email,
        id: data.id,
        name: data.name,
        nickname: data.nickname,
        phone: data.phone,
        role: data.role,
      }
    : null;
}
