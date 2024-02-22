'use client';

import React, { ChangeEvent, use, useEffect, useState } from 'react';
// import axios from 'axios';
import Compressor from 'compressorjs';
import { ImageUploadProps } from '@/lib/types';
import { useDropzone } from 'react-dropzone';


export const ImageUpload: React.FC<ImageUploadProps> = ({ quality, maxWidth, maxHeight, onUploadComplete }) => {
  const [progress, setProgress] = useState(100); // Add this line
  const [error, setError] = useState(null); // And this line
  const [preview, setPreview] = useState(''); // And this line

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: async (acceptedFiles) => {
      // setFiles(acceptedFiles.map(file => Object.assign(file, {
      //   preview: URL.createObjectURL(file)
      // })));
      new Compressor(acceptedFiles[0], {
        quality: quality ? quality : 0.8,
        maxHeight: maxHeight?  maxHeight : undefined,
        maxWidth: maxWidth? maxWidth : undefined,
        success(result) {
          let imageName = acceptedFiles[0].name;
          // 如果不是 jpg, 则转换为 jpg
          // if (imageName.split('.').pop() !== 'jpg') {
          //   imageName = imageName.split('.')[0] + '.jpg';
          // }

          const previewData = URL.createObjectURL(result);
          setPreview(previewData);
          // 如果 result 是 blob 否则需要转换为 File 对象
          if (result instanceof Blob) {
            const file = new File([result], imageName);
            // 现在你可以使用 file 对象了
            onUploadComplete(previewData, file);
          } else {
            // 现在你可以使用 result 对象了
            onUploadComplete(previewData, result);
          }
        },
        error(err) {
          console.log(err.message);
        },
      });


      // const previewData = URL.createObjectURL(acceptedFiles[0]);
      // setPreview(previewData);
      // onUploadComplete(previewData, acceptedFiles[0]);

      // save to public images folder
      // const formData = new FormData();
      // formData.append('file', acceptedFiles[0]);
      // const resp = await axios.post(`/api/upload`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   },
      //   onUploadProgress: (progressEvent) => {
      //     if (progressEvent.total) {
      //       const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      //       setProgress(percentCompleted); // Update progress here
      //     }
      //   }
      // });

      // if (resp.status === 200 && resp.data.code === 0) {
      //   onUploadComplete(resp.data.data.url, acceptedFiles[0]);
      // } else {
      //   console.log(resp.data);
      //   setError(resp.data.msg);
      // }
    }
  });

  useEffect(() => {
    return () => {
      // Make sure to revoke the data uris to avoid memory leaks
      URL.revokeObjectURL(preview);
    };
  }, []);

  return (
    <div {...getRootProps()} className="border-dashed border-2 bg-slate-400 flex items-center justify-center mx-8 w-2/3 h-1/2 mb-12">
      <input {...getInputProps()} className='absolute inset-0 w-full h-full opacity-0 z-50' />
      <div className="text-center">
        <img className="mx-auto h-12 w-12" src="/image-upload.svg" alt="" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          <label className="relative cursor-pointer">
            <span>拖拽或者</span>
            <span className="text-indigo-600"> 点击 </span>
            <span>上传图片</span>
          </label>
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          支持PNG, JPG格式，大小限制10MB
        </p>
        {progress < 100 && <p>上传进度: {progress}%</p>}
        {error && <p>错误: {error}</p>}
      </div>
    </div>
  );
};

export default ImageUpload;