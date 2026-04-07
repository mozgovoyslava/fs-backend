import { PrismaService } from "@/src/core/prisma/prisma.service";
import { TokenType, type User } from "@prisma/client";

import {v4 as uuidv4} from 'uuid';

export async function generateToken(
    prismaService: PrismaService, 
    user: User, 
    tokenType: TokenType,
    isUUID: boolean = true
) {
    let token: string;

    if (isUUID) {
        token = uuidv4();
    } else {
        token = Math.floor(
            Math.random() * (1_000_000 - 100_100) + 100_000
        ).toString()
    }

    const expiresIn = new Date(new Date().getTime() + 1000 * 60 * 10);

    const existingToken = await prismaService.token.findFirst({
        where: {
            type: tokenType,
            user: {
                id: user.id
            }
        }
    });

    if (existingToken) {
        await prismaService.token.delete({
            where: {
                id: existingToken.id
            }
        })
    }

    const newToken = await prismaService.token.create({
        data: {
            token,
            expiresIn,
            type: tokenType,
            user: {
                connect: {
                    id: user.id
                }
            }
        },
        include: {
            user: true
        }
    })

    return newToken
}