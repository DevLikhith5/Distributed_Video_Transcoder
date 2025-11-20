import api from "./axiosInstance";

export interface getPresignedUrlResponse {
    message: string,
    data: {
        uploadUrl: string,
        key: string,
    }
}

export async function getPresignedUrl(fileName: string, fileType: string) {
    console.log("HITTING SINGLE PRESIGNED URL")
    const response = await api.get('/video/get-presigned-single', {
        params: { fileName, fileType },
    });
    return response
}

export async function getPresignedUrlsMultipart(fileName: string, fileType: string, partsCount: number) {
    console.log("HITTING MULTI PRESIGNED URL")

    const response = await api.post('/video/get-presigned-multipart', {

        fileName,
        fileType,
        partsCount

    })
    console.log("RESPONSE IN CLIENT API FOLDER: ", response)
    return response
}


export async function completeMultipart(key: string, uploadId: string, parts: any) {
    const response = await api.post('/video/complete-multipart', {
        key,
        uploadId,
        parts,
    })
    return response
}

export async function createVideoRecord(originalFileName: string, s3InputKey: string, duration?: number, size?: number, resolution?: string, format?: string, maxRetries?: string) {

    console.log({
        originalFileName,
        s3InputKey,
        duration,
        size,
        resolution,
        format,
        maxRetries,
    });

    const response = await api.post('/video/create-videorecord', {
        originalFileName,
        s3InputKey,
        duration,
        size,
        resolution,
        format,
        maxRetries

    })
    return response

}

export async function updateVideoStatus(videoId: string, status: string){
    const response = await api.patch('/video/update-video-status', {
        videoId,
        status
    })
    return response
}

    export async function getVideosWithStatus(status:String){
        if(status == ''){
            status = "all"
        }
        const response = await api.get('/video',{
            params:{
                status:status
            }
        })
        return response.data
    }