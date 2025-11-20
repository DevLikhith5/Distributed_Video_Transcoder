import { auth } from "../../lib/auth";
import { UserRepository } from "./user.repository";

export class UserService {
    private static instance: UserService;
    private userRepository = UserRepository.getInstance();

    private constructor() {}

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    async getUser(id: string) {
        try {
          const user = await this.userRepository.findById(id);
          return user;
        } catch (err) {
          throw err; 
        }
      }
    async loginUser(email:string, password:string){
        const user = await auth.api.signInEmail({
            body:{
                email,
                password,
                rememberMe:true,
                callbackURL:'/dashboard'
            }
        })
        return user
    }
    async registerUser(email:string,password:string,name:string) {
        const user = await auth.api.signUpEmail({
            body:{
                email,
                password,
                name,
                rememberMe:true,
                callbackURL:'/sign-in'
            }
        })
        return user
    }
}
