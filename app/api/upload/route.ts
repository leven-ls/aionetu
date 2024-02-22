import path from "path";
import { writeFile } from "fs/promises";

import { NextResponse } from "next/server";


export const POST = async (req: Request, res: Response) => {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    if (!file) {
        return NextResponse.json({ msg: "No files received.", data: {}, code: 400 }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    console.log(`Received file ${filename}`);
    try {
        await writeFile(
            path.join(process.cwd(), "public/images/" + filename),
            buffer
        );
        return NextResponse.json({ data: { url: "/images/" + filename }, msg: "", code: 0 }, { status: 200 });
    } catch (error) {
        console.log("Error occured ", error);
        return NextResponse.json({ msg: "Error uploading file.", data: {}, code: 500 }, { status: 500 });
    }
};