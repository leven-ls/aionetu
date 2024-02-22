// import path from "path";
// import { writeFile } from "fs/promises";
import util from 'util';

import axios from "axios";
import { auth } from "@clerk/nextjs";
import { type NextRequest } from 'next/server';
import { zfd } from "zod-form-data";
import * as z from "zod";

import { prismadb } from "@/lib/prismadb";
import { comfyHost, comfyUploadImage } from "@/lib/comfy_api";
import { workflowCost } from "@/lib/workflow_cost";
import { getHuanLeDouCount } from "@/lib/huanledou_count";
import id_workflow_api from '@/lib/workflows/id_workflow_api.json';
import headshot_workflow from '@/lib/workflows/headshot_workflow_api.json';
import oldphoto_repair_workflow from '@/lib/workflows/oldphoto_repair_workflow_api.json';
import travl_anywhere_workflow from '@/lib/workflows/travel_workflow_api.json';
import { cos_client } from "@/lib/cos";
import COS from "cos-nodejs-sdk-v5";

const putObjectPromise = util.promisify(cos_client.putObject).bind(cos_client);

interface Dictionary {
    [key: string]: any;
}

const createPromptSchema = zfd.formData({
    workflow: zfd.text(),
    input: zfd.text(),
    prompt: zfd.text(),
    image: zfd.file(z.instanceof(File).optional()),
});

const preparePrompt = (workflow: string, input: Dictionary, image_name?: string) => {
    if (workflow === "id_photo") {
        let prompt_template = JSON.parse(JSON.stringify(id_workflow_api));
        prompt_template['10']['inputs']['image'] = image_name;
        prompt_template['1']['inputs']['seed'] = Math.floor(Math.random() * 1000000000);

        if (input['gender'] === 'boy') {
            prompt_template['4']['inputs']['text'] = prompt_template['4']['inputs']['text'].replace('girl', 'boy');
        }

        if (!image_name) {
            console.error(`[promt_task] preparePrompt ${workflow}: image_name is null`);
        }
        return prompt_template;
    } else if (workflow === 'headshot') {
        let prompt_template = JSON.parse(JSON.stringify(id_workflow_api));
        prompt_template['10']['inputs']['image'] = image_name;
        prompt_template['1']['inputs']['seed'] = Math.floor(Math.random() * 1000000000);

        if (!image_name) {
            console.error(`[promt_task] preparePrompt ${workflow}: image_name is null`);
        }

        if (input['gender'] === 'boy') {
            prompt_template['4']['inputs']['text'] = prompt_template['4']['inputs']['text'].replace('girl', 'boy');
            let random_num = Math.floor(Math.random() * 9) + 1;
            prompt_template['95']['inputs']['image'] = `male_xingxiangzhao_${random_num.toString().padStart(5, '0')}_.png`;
        } else {
            let random_num = Math.floor(Math.random() * 29) + 1;
            prompt_template['95']['inputs']['image'] = `female_xingxiangzhao_${random_num.toString().padStart(5, '0')}_.png`;
        }
        return prompt_template;
    } else if (workflow === 'oldphoto_repair') {
        let prompt_template = JSON.parse(JSON.stringify(oldphoto_repair_workflow));
        prompt_template['13']['inputs']['image'] = image_name;
        prompt_template['3']['inputs']['seed'] = Math.floor(Math.random() * 1000000000);
        return prompt_template;
    } else if (workflow === 'travelAnywhere') {
        let prompt_template = JSON.parse(JSON.stringify(travl_anywhere_workflow));
        prompt_template['10']['inputs']['image'] = image_name;
        prompt_template['64']['inputs']['seed'] = Math.floor(Math.random() * 1000000000);
        prompt_template['69']['inputs']['seed'] = Math.floor(Math.random() * 1000000000);
        prompt_template['1']['inputs']['seed'] = Math.floor(Math.random() * 1000000000);

        if (input['place'] === 'eiffel tower') {
            if (input['gender'] === 'boy') {
                prompt_template['4']['inputs']['text'] = 'A boy under the Eiffel Tower' + prompt_template['4']['inputs']['text']
                let image_rand_num = Math.floor(Math.random() * 4) + 1;
                prompt_template['57']['inputs']['image'] = `eiffel_tower_male_${image_rand_num}.jpg`;
            } else {
                prompt_template['4']['inputs']['text'] = 'A girl under the Eiffel Tower' + prompt_template['4']['inputs']['text']
                let image_rand_num = Math.floor(Math.random() * 23) + 1;
                prompt_template['57']['inputs']['image'] = `eiffel_tower_female_${image_rand_num}.png`
            }
        } else if (input['place'] === 'Sydney Opera House') {
            if (input['gender'] === 'boy') {
                prompt_template['4']['inputs']['text'] = 'A boy in Sydney Opera House' + prompt_template['4']['inputs']['text']
                let image_rand_num = Math.floor(Math.random() * 12) + 1;
                prompt_template['57']['inputs']['image'] = `sydney_opera_house_male_${image_rand_num}.JPG`;
            } else {
                prompt_template['4']['inputs']['text'] = 'A girl in Sydney Opera House' + prompt_template['4']['inputs']['text']
                let image_rand_num = Math.floor(Math.random() * 52) + 1;
                prompt_template['57']['inputs']['image'] = `sydney_opera_house_female_${image_rand_num}.png`;
            }
        }
        return prompt_template;
    } else {
        console.error(`[promt_task] preparePrompt: unknown workflow ${workflow}`);
        return null;
    }
};

export const POST = async (req: NextRequest) => {

    const result = createPromptSchema.safeParse(await req.formData());
    if (!result.success) {
        return Response.json({ msg: result.error.format(), code: 400, data: null })
    }

    const { userId } = auth();

    if (!userId) {
        return Response.json({ msg: "Unauthorized", code: 401, data: null })
    }

    const { workflow, input, image } = result.data;
    // console.log(`[promt_task] POST: ${JSON.stringify(result)}`);

    const prompt = preparePrompt(workflow, JSON.parse(input), image?.name);

    // 检查是否有足够的欢乐豆
    const cost = workflowCost[workflow] || workflowCost["default"];
    const huanledouCount = await getHuanLeDouCount();

    if (huanledouCount < cost) {
        return Response.json({ msg: "Insufficient HuanLeDou", code: 400, data: null })
    }

    // 首先上传图片到 comfy
    if (image) {
        await comfyUploadImage(image);
    }

    const payload = {
        client_id: "aionetu",
        prompt: prompt,
    }
    const prompt_resp = await axios.post(`${comfyHost}/prompt`, payload);

    if (prompt_resp.status !== 200) {
        return Response.json({ msg: "Failed to create task", code: 500, data: null })
    }

    // 根据时间生成image name id
    // save image_data to public/images
    let output_image = '';
    if (image) {
        const image_id = `${Date.now()}_${image.name}}`;
        let buffer = Buffer.from(await image.arrayBuffer());
        try {
            const data = await putObjectPromise({
                Bucket: 'aionetu-1252618189',
                Region: 'ap-guangzhou',
                Key: image_id,
                Body: buffer,
            }) as COS.PutObjectResult;
        
            console.log(`存储成功，地址: https://${data.Location}`);
            output_image = `https://${data.Location}`;
        } catch (err) {
            console.error(`[promt_task] POST: Failed to upload image to COS: ${err}`);
        }
        // const image_id = `${Date.now()}_${image.name}}`;
        // const buffer = Buffer.from(await image.arrayBuffer());
        // await writeFile(
        //     path.join(process.cwd(), `public/images/input_${image.name}`),
        //     buffer
        // );
        // let buffer = Buffer.from(await image.arrayBuffer());
        // cos_client.putObject({
        //     Bucket: 'aionetu-1252618189',
        //     Region: 'ap-guangzhou',
        //     Key: image_id,
        //     Body: buffer,
        // }, (err, data) => {
        //     if (err) {
        //         console.error(`[promt_task] POST: Failed to upload image to COS: ${err}`);
        //     }
        //     // console.log(`存储成功，地址: https://${data.Location}`)
        // });
    }

    const create_resp = await prismadb.promtTask.create({
        data: {
            id: prompt_resp.data.prompt_id,
            userId: userId,
            workflow: workflow,
            input: JSON.stringify([output_image]),
            output: ``,
            prompt: prompt,
            queuePosition: 798
        }
    })

    // 扣除对应 欢乐豆
    await prismadb.huanLeDou.update({
        where: {
            userId: userId,
        },
        data: {
            count: {
                decrement: cost,
            }
        }
    })

    return Response.json({ msg: "Success", code: 0, data: create_resp })
};


export const GET = async (req: NextRequest, { params }: {
    params: {
        id?: string,
        workflow?: string,
        current?: boolean,
        limit?: number,
        offset?: number,
        sort?: string,
    }
}) => {
    const { userId } = auth();
    const searchParams = req.nextUrl.searchParams;

    if (!userId) {
        return Response.json({ msg: "Unauthorized", code: 401, data: null })
    }

    // 根据ID查找任务
    if (searchParams.has("id")) {
        const id = searchParams.get("id")
        if (!id) {
            return Response.json({ msg: "Missing id", code: 400, data: null })
        }

        const task = await prismadb.promtTask.findFirst({
            where: {
                id: id,
                userId: userId,
            }
        })

        return Response.json({ msg: "Success", code: 0, data: task });
    }

    // 查找用户的当前任务
    if (searchParams.has("current")) {
        // workflow 为必填参数
        const workflow = searchParams.get("workflow")
        if (!workflow) {
            return Response.json({ msg: "Missing workflow", code: 400, data: null })
        }

        const currentTasks = await prismadb.promtTask.findFirst({
            where: {
                userId: userId,
                workflow: workflow,
                status: "PENDING",
            }
        })

        return Response.json({ msg: "Success", code: 0, data: currentTasks });
    }

    // 查找用户的所有任务
    const tasks = await prismadb.promtTask.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: "desc",
        }
    });
    return Response.json({ msg: "Success", code: 0, data: tasks });
};

