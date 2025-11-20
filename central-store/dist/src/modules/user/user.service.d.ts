export declare class UserService {
    private static instance;
    private userRepository;
    private constructor();
    static getInstance(): UserService;
    getUser(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    loginUser(email: string, password: string): Promise<{
        redirect: boolean;
        token: string;
        url: string | undefined;
        user: {
            id: string;
            email: string;
            name: string;
            image: string | null | undefined;
            emailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    registerUser(email: string, password: string, name: string): Promise<{
        token: null;
        user: {
            id: string;
            email: string;
            name: string;
            image: string | null | undefined;
            emailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } | {
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            image: string | null | undefined;
            emailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
//# sourceMappingURL=user.service.d.ts.map