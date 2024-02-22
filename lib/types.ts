export type ImageUploadProps = {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    onUploadComplete: (url: string, file: File) => void;
};

export type ResponseData  = {
    data: any,
    msg: string,
    code: number,
}