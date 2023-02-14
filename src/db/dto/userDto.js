class UserDto {
  constructor({_id, username, name, email}) {
    this.id = _id
    this.username = username
    this.name = name
    this.email = email
  }
}

export function userToDto(users) { 
  let data
  if (Array.isArray(users)) {
    data = users.map(u => new UserDto(u))
  } else {
    data = new UserDto(users)
  }
  return data
}