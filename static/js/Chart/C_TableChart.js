var Data_detected_ALL = 0;
var Data_checked_ALL = 0;
var Data_deviceDetected_ALL = [];
var Data_deviceChecked_ALL = [];

var TableTitle = document.getElementById('TableTitle');
var T_ScrollBox = document.getElementById('T_ScrollBox')

var array1 = [
    {title : '금일 포트홀 검수 현황'},
]
var array2 = [
    {title : '전체 검출된 데이터 개수'},
    {title : '전체 검수된 데이터 개수'},
    {title : '전체 검수된 포트홀 개수'},
]

var array3 = [
    {title1 : '디바이스', title2 : '검출된 데이터 개수', title3 : '전체 검수된 데이터 개수', title4 : '전체 검수된 포트홀 개수'},
]

var settings_statis_today = {
    "url": "http://165.246.196.154:3002/app/statis/today",
    "method": "GET",
};

$.ajax(settings_statis_today).done(function (response) {
    if (response.isSuccess) {
        console.log("settings_statis_today success", response);

        Data_detected_ALL = response.detected_ALL[0]['COUNT(*)'];
        Data_checked_ALL = response.checked_ALL[0]['COUNT(*)'];
        Data_pothole_ALL = response.pothole_ALL[0]["POTHOLE_TODAY"];
        Data_deviceDetected_ALL = response.deviceDetected_ALL;
        Data_deviceChecked_ALL = response.deviceChecked_ALL;
        Data_devicePothole_ALL = response.pothole_DEVICE;

        var e = document.getElementById('btn_Today')
        TodayData(e);
    } else {
        console.log("settings_statis_today failed", response);
    }
});

// console.log(Data)

//
// 날짜
//
AllData = (e) => {
    clickedBtn(e, 'T_DateBtns');
    console.log('전체');
    // console.log(Paging)

}

YesterdayData = (e) => {
    clickedBtn(e, 'T_DateBtns');
    console.log('어제');
    // console.log(Paging)

}

TodayData = (e) => {
    // clickedBtn(e, 'T_DateBtns');
    console.log('오늘');

    // 제목
    InnerHtml(TableTitle, '금일 포트홀 검수 현황')

    // 전체 데이터
    //JSON
    array2[0]['values'] = Data_detected_ALL;
    array2[1]['values'] = Data_checked_ALL;
    array2[2]['values'] = Data_pothole_ALL;

    console.log(array2)

    InnerHtml(detected_ALL, Data_detected_ALL)
    InnerHtml(checked_ALL, Data_checked_ALL)
    InnerHtml(pothole_ALL, Data_pothole_ALL)

    // 기기별 데이터
    var html = '';
    var DeviceList = [];
    
    var temp = Object.keys(Data_deviceChecked_ALL[0])


    for (let i = 0; i < temp.length; i++) {
        DeviceList.push(secretariat[i])
    }

    for (let i = 0; i < Object.keys(Data_deviceChecked_ALL[0]).length; i++) {
        //JSON
        array3.push(
            { 
                value1 : DeviceList[i], 
                value2 : Data_deviceDetected_ALL[0][temp[i]], 
                value3 : Data_deviceChecked_ALL[0][temp[i]], 
                value4 : Data_devicePothole_ALL[0][temp[i]] 
            }
        )
        html += 
            '<div class="flex_mid">' +
                '<div class="T_text boxes flex_mid" style="width: 25%">' + DeviceList[i] + '</div>' +
                '<div class="T_text boxes flex_mid" style="width: 25%">' + Data_deviceDetected_ALL[0][temp[i]] + '</div>' +
                '<div class="T_text boxes flex_mid" style="width: 25%">' + Data_deviceChecked_ALL[0][temp[i]] + '</div>' +
                '<div class="T_text boxes flex_mid" style="width: 25%">' + Data_devicePothole_ALL[0][temp[i]] + '</div>' +
            '</div>';
    }
    console.log('array3 => ', array3)
    InnerHtml(T_ScrollBox, html)
}

ThisWeekData = (e) => {
    clickedBtn(e, 'T_DateBtns');
    console.log('주');
    // console.log(Paging)

}

ThisMonthData = (e) => {
    clickedBtn(e, 'T_DateBtns');
    console.log('월');
    // console.log(Paging)

}

ThisPeriod = (e) => {
    var btn_Period = document.getElementById('btn_Period')

    clickedBtn(btn_Period, 'T_DateBtns');
    console.log('기간');

    if (PeriodStart == null || PeriodStart  == null) {
        alert('기간을 지정해주세요.')

        var e = document.getElementById('btn_All')
        AllData(e);
        return;
    } else {
        var Start = PeriodStart.value;
        var End = PeriodEnd.value;
    }
    
}

exportCSV = () => {
    var csv = "";

    csv += array1[0]['title'] + "\r\n";

    $.each(array2, function(i, item){
        var keys = Object.keys(item)
        console.log(keys)
        for (let j = 0; j < keys.length; j++){
            if (j == keys.length-1) {
                csv += item[keys[j]] + "\r\n"
            } else {
                csv += item[keys[j]] + ","
            }
        }
    });

    $.each(array3, function(i, item){
        var keys = Object.keys(item)
        console.log(keys)
        for (let j = 0; j < keys.length; j++){
            if (j == keys.length-1) {
                csv += item[keys[j]] + "\r\n"
            } else {
                csv += item[keys[j]] + ","
            }
        }
    });

    console.log(csv)

    var downloadLink = document.createElement("a");
    var blob = new Blob(["\ufeff"+csv], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = "pothole.csv";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

//
// 실행
//
SideBar();
clickedChart();