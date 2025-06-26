export { };

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
                accountType: string;
                name: string;
                roleId: string;
                phone: string;
                address: string;
            };
        }
    }
}