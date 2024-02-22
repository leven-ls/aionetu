"use client";

import axios from "axios";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import { cn } from "@/lib/utils";
import ImageUpload from "@/components/image-upload";

const HeadShotPage = () => {
  
  const router = useRouter();
  const [rawPhotoUrl, setRawPhotoUrl] = useState<string>('');
  const [rawPhoto, setRawPhoto] = useState<File | null>(null);
  const [restroredPhoto, setRestroredPhoto] = useState<string>('');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [gender, setGender] = useState('girl');
  const [taskID, setTaskID] = useState<string>('');
  const [queuePosition, setQueuePosition] = useState<number>(798);

  const fetchTaskStatus = async () => {
    console.log(`开始 fetch 任务状态`);
    while (true) {
      if (!isFetching) {
        console.log(`结束 fetch `)
        return;
      }
      if (!taskID) {
        console.log(`结束 fetch , 任务ID为空`);
        setIsFetching(false);
        return;
      }
      const resp = await axios.get(`api/promt_task`, {
        params: {
          id: taskID,
        }
      });
      if (resp.status !== 200) {
        console.log(`结束 fetch , 异常退出`);
        console.log(`resp: ${JSON.stringify(resp)}`);
        return;
      }
      const data = resp.data;
      if (data.code !== 0) {
        console.log(`结束 fetch , 任务异常`);
        console.log(`data: ${JSON.stringify(data)}`);
        return;
      }
      // console.log(`task status: ${JSON.stringify(data.data.status)}`)
      if (data.data.status === 'completed') {
        const output_data = JSON.parse(data.data.output);
        if (output_data.length === 0) {
          console.log(`结束 fetch , 任务异常`);
          setIsFetching(false);
          toast.error("上传图片格式错误或者无法识别");
          return;
        }
        console.log(`结束 fetch , 任务完成`);
        setRestroredPhoto(output_data[0]);
        setIsFetching(false);
        return;
      }
      if (data.data.status === 'failed') {
        console.log(`结束 fetch , 任务失败`);
        console.log(`data: ${JSON.stringify(data)}`);
        setIsFetching(false);
        return;
      }
      if (data.data.status === 'pending') {
        // console.log(`任务排队中: ${JSON.stringify(data.data)}`);
        setQueuePosition(data.data.queuePosition);
        let waitTime = data.data.queuePosition;
        // 最多30秒
        if (waitTime > 30) {
          waitTime = 30;
        }
        if (waitTime < 1) {
          waitTime = 1;
        }
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      }
    }
  };

  useEffect(() => {
    fetchTaskStatus();
  }, [isFetching, taskID]);

  const queuePrompt = async () => {
    if (isFetching) {
      toast.error("Please wait for the previous generation to complete.");
      return;
    }

    const formData = new FormData();
    if (!rawPhoto) {
      toast.error("Please upload an image.");
      return;
    }

    formData.append('image', rawPhoto);
    formData.append('prompt', JSON.stringify({}));
    formData.append('workflow', 'headshot');
    formData.append('input', JSON.stringify({
      gender: gender
    }));

    const response = await axios.post(`api/promt_task`, formData);
    setTaskID(response.data.data.id);
    setIsFetching(true);
  };

  const onSubmit = async () => {
    try {
      await queuePrompt();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-4 lg:px-8 flex items-center gap-x-3 mb-8">
        <div className={cn("p-2 w-fit rounded-md", "bg-emerald-500/10")}>
          <ImageIcon className={cn("w-10 h-10", "text-violet-500")} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">形象照</h2>
          <p className="text-sm text-muted-foreground">
            每次消耗10欢乐豆
          </p>
        </div>
        <p className="ml-4">
          选择性别
        </p>
        <Select value={gender} onValueChange={(v) => { setGender(v) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择性别" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="boy">男</SelectItem>
              <SelectItem value="girl">女</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onSubmit}>
          点击生成
        </Button>
        <Button className="ml-auto bg-blue-600 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
          onClick={() => router.push('/history')}>
          历史记录
        </Button>
      </div>
      <div className="px-4 lg:px-8 flex flex-col h-full">
        <div className="flex h-full pb-6 pl-1 pr-6 space-x-2">
          <div className="md:w-1/2 relative border">
            <div className="flex items-center justify-center h-full">
              {rawPhotoUrl ?
                <>
                  <Image src={rawPhotoUrl || '/empty.png'} alt="" className="p-12" layout="fill" objectFit="contain" sizes="100vw"></Image>
                  <button
                    className="absolute top-0 right-0 m-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      setRawPhotoUrl('');
                      setRawPhoto(null);
                    }}
                  >
                    清除重传
                  </button>
                </>
                :
                <ImageUpload
                  maxWidth={1024}
                  maxHeight={1536}
                  onUploadComplete={(url: string, file: File) => {
                    setRawPhotoUrl(url);
                    setRawPhoto(file);
                  }}
                />
              }
            </div>
          </div>
          <div className="md:w-1/2 relative border flex items-center justify-center">
            {isFetching ?
              <div className="flex-col items-center justify-center">
                <div className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-blue-600" ></div>
                <p className="pt-4"> 当前排队 {queuePosition}</p>
              </div>
              :
              <>
                <Image src={restroredPhoto || '/id_example.png'} alt="" className="p-2" layout="fill" objectFit="contain" sizes="100vw"></Image>
                {restroredPhoto &&
                  <button
                    className="absolute top-0 right-0 m-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = restroredPhoto;
                      link.download = 'download.png';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    下载图片
                  </button>
                }
              </>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeadShotPage;
