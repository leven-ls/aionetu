import path from "path";
import { writeFile } from "fs/promises";
import util from 'util';

import { comfyHistory, comfyQueueInfo, comfyViewImage } from '@/lib/comfy_api';
import { type NextRequest } from 'next/server';

import { prismadb } from "@/lib/prismadb";
import { cos_client } from "@/lib/cos";
import COS from "cos-nodejs-sdk-v5";


const putObjectPromise = util.promisify(cos_client.putObject).bind(cos_client);


export const POST = async (req: NextRequest) => {
    // 限定 IP 地址
    // console.log(`[update_queue] ${req.ip}`);
    // console.log(`[update_queue] ${req.headers.get('x-forwarded-for')}`);
    let ip = req.headers.get('x-forwarded-for') || req.ip;
    if (ip?.startsWith("::ffff:")) {
        ip = ip.slice(7);
    }
    if (ip !== '127.0.0.1') {
        return Response.json({ msg: "Unauthorized", code: 401, data: null })
    };

    const pendingData = await prismadb.promtTask.findMany({
        where: {
            status: 'pending',
        }
    });

    // console.log(`当前: ${pendingData.length} 个任务在等待中`);

    const response = await comfyQueueInfo();
    const new_queue_data = response.data.queue_running.concat(response.data.queue_pending);

    for (let task of pendingData) {
        const index = new_queue_data.findIndex((item: any) => item[1] === task.id);
        if (index === -1) {
            task.queuePosition = -1;
            continue;
        }
        task.queuePosition = index+1;
        // update queue position
        await prismadb.promtTask.update({
            where: {
                id: task.id,
            },
            data: {
                queuePosition: task.queuePosition,
            }
        });
    }

    for (let task of pendingData.filter((item: any) => item.queuePosition === -1)) {
        const history_resp = await comfyHistory(task.id);
        // console.log(`[update_queue: task history ${task.id}] ${JSON.stringify(history_resp.data)}`);
        const history = history_resp.data;
        if (Object.keys(history).length > 0) {
            // task 完成
            let outputs: string[] = [];
            for (let k1 in history[task.id].outputs) {
                const image_node = history[task.id].outputs[k1];
                if (!image_node.images) {
                    continue;
                }
                for (let image of image_node.images) {
                    const image_resp = await comfyViewImage(image.filename, image.subfolder);
                    // save image to public
                    // await writeFile(
                    //     path.join(process.cwd(), `public/images/output_${image.filename}`),
                    //     image_resp.data
                    // );
                    // const image_id = `${Date.now()}_${image.name}}`;
                    // const buffer = Buffer.from(await image.arrayBuffer());
                    // await writeFile(
                    //     path.join(process.cwd(), `public/images/input_${image.name}`),
                    //     buffer
                    // );

                    // 改写成 await
                    try {
                        const data = await putObjectPromise({
                            Bucket: 'aionetu-1252618189',
                            Region: 'ap-guangzhou',
                            Key: image.filename,
                            StorageClass: 'STANDARD',
                            Body: image_resp.data,
                            ContentLength: image_resp.data.length,
                        }) as COS.PutObjectResult;
                    
                        console.log(`存储成功，地址: https://${data.Location}`);
                        outputs.push(`https://${data.Location}`);
                    } catch (err) {
                        console.error(`[promt_task] POST: Failed to upload image to COS: ${err}`);
                    }
                    
                }
            }

            if (outputs.length === 0) {
                // todo: 未检测到人脸之类的错误
                await prismadb.promtTask.update({
                    where: {
                        id: task.id,
                    },
                    data: {
                        status: 'completed',
                        output: JSON.stringify(outputs),
                        finishedAt: new Date(),
                        takeTime: ((new Date().getTime() - task.createdAt.getTime()) / 1000),
                        queuePosition: 0
                    }
                });
            } else {
                await prismadb.promtTask.update({
                    where: {
                        id: task.id,
                    },
                    data: {
                        status: 'completed',
                        output: JSON.stringify(outputs),
                        finishedAt: new Date(),
                        takeTime: ((new Date().getTime() - task.createdAt.getTime()) / 1000),
                        queuePosition: 0
                    }
                });
            }
        } else {
            // task 失败
            await prismadb.promtTask.update({
                where: {
                    id: task.id,
                },
                data: {
                    status: 'failed',
                }
            });
        }
    };

    return Response.json({ msg: "Success", code: 200, data: `当前: ${pendingData.length} 个任务在等待中` })
};