"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { PromtTask } from "@prisma/client";


const HistoryPage = () => {

  const [gender, setGender] = useState('证件照');
  const [modalImage, setModalImage] = useState<string>('');
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const [taskList, setTaskList] = useState<PromtTask[]>([]);

  useEffect(() => {
    const fetchImageList = async () => {
      const resp = await axios.get(`api/promt_task`);
      if (resp.status !== 200) {
        console.log(`异常退出`);
        console.log(`resp: ${JSON.stringify(resp)}`);
        return;
      }
      const data = resp.data;
      if (data.code !== 0) {
        console.log(`异常退出`);
        console.log(`data: ${JSON.stringify(data)}`);
        return;
      }
      setTaskList(data.data);
    }
    fetchImageList();
  }, []);

  return (
    <>
      <div className="h-full w-full flex flex-col">
        <div className="px-4 lg:px-8 flex items-center gap-x-3 mb-8">
          <div className={cn("p-2 w-fit rounded-md", "bg-emerald-500/10")}>
            <ImageIcon className={cn("w-10 h-10", "text-violet-500")} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">历史记录</h2>
            <p className="text-sm text-muted-foreground">
              所有的生成记录都会在这里展示
            </p>
          </div>
          {/* <p className="ml-4">
            选择类别
          </p> */}
          {/* <Select value={gender} onValueChange={(v) => { setGender(v) }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择类别" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="boy">证件照</SelectItem>
                <SelectItem value="girl">老照片修复</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select> */}
        </div>
        <div className="px-4 lg:px-8 grid grid-cols-4 gap-2 items-center justify-center">
          {taskList.map((task, i) =>
            task.output &&
            <img
              key={i}
              src= { task.output ? JSON.parse(task.output)[0] : '/logo1.png'} className='' onClick={() => {
                setModalImage(task.output ? JSON.parse(task.output)[0] : '/logo1.png');
                setImageModalOpen(true);
              }
              }>
            </img>
          )}
          {/* {Array.from(Array(20).keys()).map((_, i) =>
            <img
              key={i}
              src='/logo1.png' className='' onClick={() => {
                setModalImage('/logo1.png');
                setImageModalOpen(true);
              }
              }>
            </img>)} */}
        </div>
      </div>
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share link</DialogTitle>
            <DialogDescription>
              Anyone who has this link will be able to view this.
            </DialogDescription>
          </DialogHeader>
          <img src={modalImage} className='h-full w-full object-contain'></img>
          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                <a href={modalImage} download>下载</a>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default HistoryPage;
