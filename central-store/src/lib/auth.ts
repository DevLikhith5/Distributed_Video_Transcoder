import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Database } from "../config/database";
import { bearer, openAPI } from "better-auth/plugins";
import dotenv from "dotenv"
import { config } from "../config/config";


dotenv.config()

const prisma = Database.getInstance()
export const auth = betterAuth({
    plugins: [bearer(),openAPI()],
    
    trustedOrigins:["http://localhost:5173"],

    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword:{
        enabled:true
    },
    
    socialProviders: {
        google: { 
            clientId: config.google.clientId, 
            clientSecret: config.google.clientSecret, 
        }, 
        github: { 
            clientId: config.github.clientId, 
            clientSecret: config.github.clientSecret, 
        }
    },
});