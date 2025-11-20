import { Database } from "../../config/database";
import {  DatabaseError, NotFoundError } from "../../utils/error";

export class UserRepository {
    private static instance: UserRepository;
    private db = Database.getInstance();

    private constructor() {}


    public static getInstance(): UserRepository {
        if (!UserRepository.instance) {
          UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;
    
    }

    async findById(id: string) {
        try {
          const user = await this.db.user.findUnique({ where: { id } });
          if (!user) throw new NotFoundError("User not found");
          return user;
        } catch (err: any) {
          throw new DatabaseError("Database query failed", err);
        }
    }
        
    
}