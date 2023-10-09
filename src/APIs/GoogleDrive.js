function JSONtoBlob(json){
    const str = JSON.stringify(json);
    const bytes = new TextEncoder().encode(str);
    const jsonToBlob = new Blob([bytes], {
        type: "application/json;charset=utf-8"
    });
    return jsonToBlob;
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
                        let d = await getSingleGoogleDriveJSONData(auth,files[i].id);
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
                    let d = await getSingleGoogleDriveJSONData(auth,files[i].id);
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

export default {
    UploadJSON: uploadJSONGoogleDriveData,
    LoadAllJSON: getAllGoogleDriveJSONData,
    Load: getSingleGoogleDriveData,
    LoadMainFile: getMainFile,
    UploadPlan: UploadVideoPlan,
    UpdateMainFile: UpdateMainFile,
    LoadAllVideoPlans: getAllVideoPlans,
} 