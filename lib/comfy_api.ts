import path from "path";
import { writeFile } from "fs/promises";

import axios from "axios";

import { prismadb } from "@/lib/prismadb";


export const comfyHost = 'http://127.0.0.1:8188';

export const comfyUploadImage = async (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await axios.post(`${comfyHost}/upload/image`, formData);
    return response;
};

export const comfyHistory = async (promptID: string) => {
    const response = await axios.get(`${comfyHost}/history/${promptID}`);
    return response;
};

export const comfyViewImage = async (filename: string, subfolder: string = '') => {
    const response = await axios.get(`${comfyHost}/view`, {
        params: {
            filename,
            subfolder,
        },
        responseType: 'arraybuffer'
    });
    return response;
}

export const comfyQueueInfo = async () => {
    const response = await axios.get(`${comfyHost}/queue`);
    return response;
};

const updateQueue = async () => {
    
};


