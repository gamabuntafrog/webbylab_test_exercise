import UserRepository from "@repositories/UserRepository";
export interface UserData {
  id: string;
  email: string;
}

class UserService {
  constructor(private readonly userRepository: UserRepository) {}
}

export default UserService;
