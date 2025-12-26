import UserService from "@services/userService";

class UserController {
  constructor(private readonly userService: UserService) {}
}

export default UserController;
