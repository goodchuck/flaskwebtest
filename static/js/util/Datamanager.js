var W_result = [];
var W_Data = [];
var W_RectData = [];
var lastPotholeCount = 0;

var setting_lastPotholeCount = {
    "url": "http://165.246.196.154:3002/app/statis/lastPotholeCount",
}

$.ajax(setting_lastPotholeCount).done(function (response) {
    if(response.isSuccess){
        console.log("lastPotholeCount success", response);
        lastPotholeCount = response.lastPotholeCount[0]["COUNT(CASEWHENFILE_PATHLIKE'%00000000%'ANDHUMAN_CHECKED=0THEN1END)"]
    } else {
        console.log("lastPotholeCount failed");
    }
});

importWokersData = (type) => {
    var number_of_workers = document.getElementById('number_of_workers').value;
    var worker_id = document.getElementById('worker_id').value;

    if (W_Data.length !== 0) {
        alert('데이터를 먼저 내보내주세요.');
        return 0;
    } else if (number_of_workers == '' || worker_id =='') {
        alert('작업 인원과 순서를 모두 입력해주세요.')
        return 0;
    } else if (worker_id <= 0) {
        alert('작업 순서를 정확히 입력하여 주세요.');
    } else {
        var agree = confirm('데이터를 가져오시겠습니까?');
    }

    if (agree) {
        var settings_workers = {
            "url": "http://165.246.196.154:3001/app/inspect/worker",
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": {
                "number_of_workers": number_of_workers,
                "worker_id": worker_id - 1
            },
        };
        
        $.ajax(settings_workers).done(function (response) {
            if(response.isSuccess){
                console.log("woker success", response);
                W_result = response.result

                if (W_result.length == 0) {
                    alert('모든 데이터 검수가 끝났습니다.')
                } else {
                    arrayReverseDateValue(W_result)
                    arrayReverseDateData(W_result, W_Data)
                    arrayRectData(W_Data, W_RectData);
    
                    console.log('W_Data => ', W_Data)
                    console.log('W_RectData => ', W_RectData)
    
                    if (type == 'pic') {
                        arrayPaging(W_Data, W_RectData)
                        console.log('Paging_pic => ', Paging_pic)
                        console.log('Paging_rect => ', Paging_rect)
                        LoadPictures(0);
                        drawCanvas(Paging_rect);
                    } else if (type == 'piclist') {
                        arrayListPaging(W_Data, W_RectData)
                        LoadPictureList(0);
                        drawListCanvas(Paging_rect);
                    }
                    
                }
            } else {
                console.log("woker failed");
            }
        });
    }    
}

exportWorkerData = () => {
    console.log(W_Data)
    if (W_Data.length == 0) {
        alert('데이터를 불러오세요.')
    } else if (W_Data.length > 0) {
        var agree = confirm('데이터를 내보내시겠습니까?')
    }

    if (agree) {
        var List = [];
        var AverageData = 0;

        for (var i in W_Data) {
            for (var j in W_Data[i]) {

                var human_result = JSON.parse(W_Data[i][j]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
                for (let k = 0; k < Object.keys(human_result).length; k++) {
                    if (human_result[k] !== "0" && human_result[k] !== 0) {
                        AverageData += 1
                    }
                }

                List.push({
                    filename : W_Data[i][j].FILE_PATH,
                    human_result : W_Data[i][j]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'],
                    pothole_cnt : AverageData
                })

                AverageData = 0;
            }
        }

        console.log(List)

        var setting_export = {
            "url": "http://165.246.196.154:3001/app/inspect",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify({
                "list" : List
            },)
        };

        $.ajax(setting_export).done((response) => {
            if(response.isSuccess){
                console.log("export success");

                W_result = [];
                W_Data = [];
                W_RectData = [];

                Paging = [];
                pictemp = [];
                Rect_Index =[];
                Count = 1;
                canvasCount = 0;
                lastPotholeCount = 0;

                var Pictures = document.getElementById('Pictures');
                InnerHtml(Pictures, "")
            } else {
                console.log("export failed");
            }
        })
    }
}