import { auth } from "@clerk/nextjs";
import { type NextRequest } from 'next/server';

import { prismadb } from "@/lib/prismadb";

const HUANLEDOU_DEFAULT_VALUE = process.env.HUANLEDOU_DEFAULT_VALUE? parseInt(process.env.HUANLEDOU_DEFAULT_VALUE) : 100;

export const GET = async (req: NextRequest) => {
    const { userId } = auth();

    if (!userId) {
        return Response.json({ msg: "Unauthorized", code: 401, data: null })
    }

    // 找到 userId 对应的欢乐豆，如果不存在，则创建
    const user_huanledou = await prismadb.huanLeDou.findUnique({
        where: {
            userId: userId,
        },
    });

    if (!user_huanledou) {
        const create_resp = await prismadb.huanLeDou.create({
            data: {
                userId: userId,
                count: HUANLEDOU_DEFAULT_VALUE,
            }
        });

        return Response.json({ msg: "Success", code: 0, data: create_resp })
    }

    return Response.json({ msg: "Success", code: 0, data: user_huanledou });
};

