export interface DomainUser {
  id: string
  name: string
  email: string
  createdAt: Date
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
}
