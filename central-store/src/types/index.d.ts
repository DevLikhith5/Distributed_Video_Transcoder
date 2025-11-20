import { user , session} from "../types/user.types"
declare global {
    namespace Express {
        export interface Request{
            user?:user,
            session?:session
        }
    }
}