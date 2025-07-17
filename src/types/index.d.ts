


export type RequestUser = {
    id: number;
    email: string;
    role: string;
    accountType: string;
    name: string;
    roleId: string | number;
    phone: string;
    address: string;
};

export type RequestUserPayload = {
    id: number;
    email: string;
    role: string;
    accountType: string;
    name?: string;
    roleId: string;
    phone?: string;
    address?: string;
};

declare global {
    namespace Express {
        interface Request {
            user?: RequestUser;
        }
    }
}

export { };