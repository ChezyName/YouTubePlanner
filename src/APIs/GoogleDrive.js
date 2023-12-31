import Psd from "@webtoon/psd";

function JSONtoBlob(json){
    const str = JSON.stringify(json);
    const bytes = new TextEncoder().encode(str);
    const jsonToBlob = new Blob([bytes], {
        type: "application/json;charset=utf-8"
    });
    return jsonToBlob;
}

export async function PSDtoPNGBlob(arrayBuffer){
    return new Promise(async (resolve) => {
        const psdFile = Psd.parse(arrayBuffer);
        const compositeBuffer = await psdFile.composite();
        const imageData = new ImageData(
          compositeBuffer,
          psdFile.width,
          psdFile.height
        );
        let PNG = ImageDataToBlob(imageData);
        resolve(PNG);
    })
}

export function ImageDataToBlob(imageData){
    let w = imageData.width;
    let h = imageData.height;
    let canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    let ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);        // synchronous
  
    return new Promise((resolve) => {
          canvas.toBlob(resolve); // implied image/png format
    });
  }

export function ImagetoBlob(img){
    return new Promise((resolve) => {
        var reader = new FileReader();
        reader.addEventListener("load", (event) => {
            resolve(event.target.result);
        });
        reader.readAsDataURL(img);
    })
}

export function UploadPSD(auth, psd, fileName){
    return new Promise((resolve) => {
        //const ImageBlob = await ImagetoBlob(img);

        var formData = new FormData();
        var fileMetadata = {
            "name": fileName,
            "parents": ["appDataFolder"],
            "mimeType": "image/x-photoshop"
        };

        formData.append("metadata", JSONtoBlob(fileMetadata), {
            contentType: "application/json; charset=UTF-8",
        });

        formData.append("data", psd);

        fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
                method: "POST",
                body: formData,
                headers: { Authorization: "Bearer " + auth },
            })
            .then((res) => resolve(res.json()));
    });
}


export function UploadImage(auth, img, fileName){
    return new Promise((resolve) => {
        //const ImageBlob = await ImagetoBlob(img);

        var formData = new FormData();
        var fileMetadata = {
            "name": fileName,
            "parents": ["appDataFolder"],
            "mimeType": fileName.type
        };

        formData.append("metadata", JSONtoBlob(fileMetadata), {
            contentType: "application/json; charset=UTF-8",
        });

        formData.append("image", img);

        fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
                method: "POST",
                body: formData,
                headers: { Authorization: "Bearer " + auth },
            })
            .then((res) => resolve(res.json()));
    });
}

let MainFileID = "";

export function uploadJSONGoogleDriveData(data, fileName, auth){
    return new Promise((resolve) => {
        var formData = new FormData();
        var fileMetadata = {
            "name": fileName,
            "parents": ["appDataFolder"],
            "mimeType": "application/json"
        };

        formData.append("metadata", JSONtoBlob(fileMetadata), {
            contentType: "application/json; charset=UTF-8",
        });

        formData.append("data", JSONtoBlob(data), {
            contentType: "application/json",
        });

        fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
                method: "POST",
                body: formData,
                headers: { Authorization: "Bearer " + auth },
            })
            .then((res) => resolve(res.json()));
    });
}

export function UploadVideoPlan(auth, data, oldFileID = ""){
    return new Promise((resolve) => {
        let fileName = Date.now() + ".VideoPlan";
        if(oldFileID == null || oldFileID == "" || oldFileID == undefined){
            //create new file
            uploadJSONGoogleDriveData(data,fileName,auth).then((d) => {resolve(d)});
        }
        else{
            fetch("https://www.googleapis.com/upload/drive/v3/files/" + oldFileID, {
                    method: "PATCH",
                    body: JSON.stringify(data),
                    headers: { Authorization: "Bearer " + auth },
                })
                .then((res) => resolve(res.json()));
        }
    });
}

export function UpdateMainFile(auth, data){
    return new Promise(async (resolve) => {
        if(MainFileID == "" || MainFileID == null || MainFileID == undefined){
            await getMainFile();
        }
        fetch("https://www.googleapis.com/upload/drive/v3/files/" + MainFileID, {
            method: "PATCH",
            body: JSON.stringify(data),
            headers: { Authorization: "Bearer " + auth },
        })
        .then((res) => resolve(res.json()));
    });
}

export function getMainFile(auth){
    console.log("Getting JSON Data -> Auth Token: ", auth);
    return new Promise((resolve) => {
        fetch("https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&orderBy=createdTime&q:mimeType='application/json'", {
        method: "GET",
        headers: {
            "Authorization": 'Bearer ' + auth,
        },
        }).then((response) => {
            response.json().then(async (data) => {
                //array of files
                let files = data["files"];
                let mainFileID = "";
                let fileFound = false;

                for(let i = 0; i < files.length; i++){
                    if(files[i].name == "MainDataFile"){
                        fileFound = true;
                        MainFileID = files[i].id;
                        mainFileID = files[i].id;
                        break;
                    }
                }
                if(fileFound){
                    //return file data
                    getSingleGoogleDriveData(auth,mainFileID).then((d) => {
                        resolve(d);
                    });
                }
                else{
                    //create new file with empty data and return
                    let baseFileData = {
                        videoCount: 0,
                        activeVideoPlans: [],
                    }

                    uploadJSONGoogleDriveData(baseFileData,"MainDataFile",auth).then(() => {
                        resolve(baseFileData);
                    })
                }
            })
        });
    });
}

export function getSingleGoogleDriveData(auth,id){
    return new Promise((resolve) => {
        fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
            method: "GET",
            headers: {
                "Authorization": 'Bearer ' + auth,
            },
        }).then((d) => {resolve(d.json())});
    });
}

export function deleteGoogleDriveFile(auth,id){
    return new Promise((resolve) => {
        fetch(`https://www.googleapis.com/drive/v2/files/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": 'Bearer ' + auth,
            },
        })
        .then((res) => {
            console.log(res);
            resolve(res)
        });
    });
}

export function getGoogleDriveMetadata(auth,id){
    return new Promise((resolve) => {
        fetch(`https://www.googleapis.com/drive/v3/files/${id}`, {
            method: "GET",
            headers: {
                "Authorization": 'Bearer ' + auth,
            },
        }).then(async (response) => {
            console.log(response);
            let json = await response.json()
            resolve(json)
        })
    });
}

export function getGoogleDriveFileBLOB(auth,id){
    return new Promise((resolve) => {
        fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
            method: "GET",
            headers: {
                "Authorization": 'Bearer ' + auth,
            },
        }).then(async (response) => {
            console.log(response);
            let blob = await response.blob()
            resolve(blob)
        })
    });
}

export function getGoogleDriveBlobData(auth,id){
    return new Promise((resolve) => {
        fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
            method: "GET",
            headers: {
                "Authorization": 'Bearer ' + auth,
            },
        }).then(async (response) => {
            console.log(response);
            let blob = await response.blob()
            if(blob.type == "image/x-photoshop"){
                let buffer = await blob.arrayBuffer();
                let PNGBlob = await PSDtoPNGBlob(buffer);
                resolve(PNGBlob);
            }
            else{
                resolve(blob)
            }
        })
    });
}

export function getAllVideoPlans(auth){
    console.log("Getting JSON Data -> Auth Token: ", auth);
    return new Promise((resolve) => {
        fetch("https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&orderBy=createdTime&q:mimeType='application/json'", {
        method: "GET",
        headers: {
            "Authorization": 'Bearer ' + auth,
        },
        }).then((response) => {
            response.json().then(async (data) => {
                //array of files
                let files = data["files"];
                let jsonFiles = [];

                for(let i = 0; i < files.length; i++){
                    if(files[i].name.contains(".VideoPlan")){
                        let d = await getSingleGoogleDriveData(auth,files[i].id);
                        let thumbnail;
                        console.log(d.ThumbnailID, "Loading This Up.")
                        if(d.ThumbnailID){
                            console.log("Getting Thumbnail for " + d.ThumbnailID)
                            thumbnail = await getGoogleDriveBlobData(auth,d.ThumbnailID);
                        }
                        const blobUrl = URL.createObjectURL(thumbnail)
                        d.Thumbnail = blobUrl;
                        jsonFiles.push({
                            fileID: files[i].id,
                            data: d,
                        })
                    }
                }
                resolve(jsonFiles);
            })
        });
    });
}

export function DeleteEverything(auth){
    console.log("Removing All Data...");
    return new Promise((resolve) => {
        fetch("https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&orderBy=createdTime", {
        method: "GET",
        headers: {
            "Authorization": 'Bearer ' + auth,
        },
        }).then((response) => {
            response.json().then(async (data) => {
                //array of files
                let files = data["files"];
                let jsonFiles = [];

                for(let i = 0; i < files.length; i++){
                    if(files[i].name == "MainDataFile"){
                        let d = await getSingleGoogleDriveData(auth,files[i].id);
                        d.videoCount = 0;
                        d.activeVideoPlans = [];
                        console.log("Override Video File: ", d);
                        await UpdateMainFile(auth,d);
                    }
                    else{
                        await deleteGoogleDriveFile(auth,files[i].id);
                    }
                }
                resolve(jsonFiles);
            })
        });
    });
}

export function getAllGoogleDriveJSONData(auth){
    console.log("Getting JSON Data -> Auth Token: ", auth);
    return new Promise((resolve) => {
        fetch("https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&orderBy=createdTime&q:mimeType='application/json'", {
        method: "GET",
        headers: {
            "Authorization": 'Bearer ' + auth,
        },
        }).then((response) => {
            response.json().then(async (data) => {
                //array of files
                let files = data["files"];
                let jsonFiles = [];

                for(let i = 0; i < files.length; i++){
                    let d = await getSingleGoogleDriveData(auth,files[i].id);
                    jsonFiles.push({
                        fileID: files[i].id,
                        data: d,
                    })
                }
                resolve(jsonFiles);
            })
        });
    });
}

export function getGoogleDriveData(auth){
    return new Promise((resolve) => {
        fetch(`https://www.googleapis.com/drive/v3/about?fields=storageQuota`, {
            method: "GET",
            headers: {
                "Authorization": 'Bearer ' + auth,
            },
        }).then((response) => response.json())
        .then(async (json) => {
            console.log(json);
            resolve(json)
        });
    });
}

export default {
    UploadJSON: uploadJSONGoogleDriveData,
    LoadAllJSON: getAllGoogleDriveJSONData,
    Load: getSingleGoogleDriveData,
    LoadBlob: getGoogleDriveBlobData,
    LoadMainFile: getMainFile,
    UploadPlan: UploadVideoPlan,
    UpdateMainFile: UpdateMainFile,
    LoadAllVideoPlans: getAllVideoPlans,
    ImageToBlob: ImagetoBlob,
    UploadImage: UploadImage,
    Delete: deleteGoogleDriveFile,
    GetData: getGoogleDriveData,
    DeleteAll: DeleteEverything,
    ImageDataToBlob: ImageDataToBlob,
    UploadPSD: UploadPSD,
    PSDtoPNGBlob: PSDtoPNGBlob,
    LoadMetadata: getGoogleDriveMetadata,
    getGoogleDriveFileBLOB: getGoogleDriveFileBLOB,
} 