export declare class UserRepository {
    private static instance;
    private db;
    private constructor();
    static getInstance(): UserRepository;
    findById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=user.repository.d.ts.map