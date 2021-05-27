// ALERT FLAG

var canAlertFlag = true  


// Data
var Data_devicePothole_ALL = [];
var tempAllImg = [];
var PicData = [];
var RectData = [];


// chart
var chart;
var ctx = document.getElementById('chart').getContext('2d')
var gradientFill = ctx.createLinearGradient(0, 300, 0, 0);
    gradientFill.addColorStop(0, "rgba(51, 231, 148, 0.6)");
    gradientFill.addColorStop(1, "rgba(0, 158, 253, 0.6)");
    
var gradientStroke = ctx.createLinearGradient(0, 300, 0, 0);
    gradientStroke.addColorStop(0, "rgba(51, 231, 148)");
    gradientStroke.addColorStop(1, "rgba(0, 158, 253)");

var count = 1;
var office = 0;
var ShowData = [];

// Paging
var Paging_pic = [];
var Paging_rect = [];
var pictemp = [];
var recttemp = [];

var picCount = 1;
var rectCount = 1;
var Index = 0;

var Pictures = document.querySelector('#C_Pictures');
var TxtCurrentPage = document.querySelector('#TxtCurrentPage');
var TxtTotalPage = document.querySelector('#TxtTotalPage');

importImage = (date_from, date_to) => {
    PicData = [];
    RectData = []
    Paging_pic = [];
    Paging_rect = [];
    Data_devicePothole_ALL = [];
    Index = 0
    
    var settings_statis_showImagesByDate = {
        "url": "http://165.246.196.154:3002/app/statis/showImagesByDate?date_from=" + date_from + "&date_to=" + date_to,
        "method": "GET",
    };
    
    $.ajax(settings_statis_showImagesByDate).done(function (response) {
        if (response.isSuccess) {
            console.log("settings_statis_showImagesByDate success", response);

            var result = response.ImagesByDate;
            if (result.length == 0) {

                if(canAlertFlag){
                alert('해당 일자의 데이터가 없습니다.')
                canAlertFlag = false 

                }

                var e = document.getElementById('btn_Today')
                TodayData(e);
            } else {
                result.find(element => {
                    for (var i in element) {
                        tempAllImg.push(element[i])
                    }
                })
    
                var temp = response.device_PTH_CNT
    
                temp.find(element => {
                    var pothole_data = element.rows[0][element.metaData[0].name]
                    if (pothole_data == null) {
                        Data_devicePothole_ALL.push(0)
                    } else {
                        Data_devicePothole_ALL.push(pothole_data)
                    }
                })
    
                console.log(Data_devicePothole_ALL)
    
                // Chart
                for (let i = 0; i < Data_devicePothole_ALL.length; i++) {
                    if (count == 2) {
                        count = 0;
                        ShowData.push(office);
                        office = 0;
                    }
    
                    office += Data_devicePothole_ALL[i];
                    count += 1;
                }
                MakeChart();
                
                // Data Repacking
                arrayReverseDateValue(tempAllImg)
                arrayReverseDateData(tempAllImg, PicData);
                arrayRectData(PicData, RectData);
                arrayPaging(PicData, RectData);
                
                // Pictures
                LoadPictures(Index);
                drawCanvas_GB(Paging_rect , Index, Paging_pic, '20.5729vw', '395px','11.5723vw', '222.188px');
    
                ShowData = [];
                tempAllImg = [];
                PicData = [];
                RectData = [];
            }
        } else {
            console.log("settings_statis_showImagesByDate failed", response);
        }
    });
}

//
// Chart
//
MakeChart = () => {
    if (chart) {
        chart.destroy();
    }

    var chartdata = {
        type: 'bar',

        data: {
            labels: [
                '수원', '의정부', '홍천', '강릉', '정선',
                '논산', '충주', '보은', '예산', '광주',
                '남원', '순천', '전주', '진주', '포항',
                '영주', '진영', '대구'
            ], 
            datasets: [
                {
                    label: '검출 포트홀 개수',
                    backgroundColor: '#4679CC',
                    borderColor: '#4679CC',
                    data: ShowData
                },
            ]
        },
    
        // Configuration options go here
        options: {
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(tooltipItems, data) {
                        return tooltipItems.yLabel + "개";
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            legend: {
                display: false
            },
            maintainAspectRatio: false, // default value. false일 경우 포함된 div의 크기에 맞춰서 그려짐.
            // responsive: false,
            scales: {
                xAxes: [{
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        // maxTicksLimit: 5
                    },
                }],
                yAxes: [{
                    ticks: {
                        stepSize: 100,
                        beginAtZero: true
                    }
                }]
            },
        },
    }

    chart = new Chart(ctx, chartdata);
}

// 사진 로딩
arrayPaging = (picdata, rectdata) => {
    console.log('picdata => ', picdata)
    console.log('rectdata => ', rectdata)
    for (let i = 0; i < picdata.length; i++) {
        for (let j = 0; j < picdata[i].length; j++){
            var human_result = JSON.parse(picdata[i][j]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
            if (typeof human_result == 'string') {
                human_result = JSON.parse(human_result)
            }

            pictemp.push({ 
                picCount: (picCount - 1),
                src: 'http://165.246.196.154:3001/downloads/' + picdata[i][j].FILE_PATH, 
                name : picdata[i][j].FILE_PATH, 
                id: 'img_' + (picCount-1),
                human_result :  human_result
            })

            if (picCount % 300 == 0) {
                Paging_pic.push(pictemp)
                pictemp=[]; 
            }
    
            picCount += 1
        }
    
        if (i == picdata.length-1 && pictemp.length !== 0) {
            Paging_pic.push(pictemp)
            pictemp=[];
        }
    }

    for (let i = 0; i < rectdata.length; i++) {
        recttemp.push(rectdata[i])
        if (rectCount % 300 == 0) {
            Paging_rect.push(recttemp);
            recttemp = [];
        }

        rectCount += 1

        if (i == rectdata.length - 1 && recttemp.length !== 0) {
            Paging_rect.push(recttemp);
            recttemp = [];
        }
    }

    InnerHtml(TxtTotalPage, Paging_pic.length)
    InnerHtml(TxtCurrentPage, CountPage(1))

    picCount = 1
    rectCount = 1
}

LoadPictures = (I) => {
    var division = [0]
    
    var a = Math.floor(Paging_pic[I].length / 20)

    if (Paging_pic[I].length <= 20) {
        division.push(Paging_pic[I].length)
    } else {
        for (let i = 1; i < a; i++) {
            division.push(i * 20)
        }
        if (Paging_pic[I].length % 20 !== 0) {
            division.push(Paging_pic[I].length)
        }
    }

    console.log(division)
    
    for (let i = 0; i < division.length; i++) {
        for (var j = division[i]; j < division[i+1]; j++) {
            var wrapper = document.createElement("div")
            SetAttribute(wrapper, 'class', 'ImgWrapper')

            var img = document.createElement("img");
            SetAttribute(img, 'id', Paging_pic[I][j].id)
            SetAttribute(img, 'class', 'LoadImg')
            SetAttribute(img, 'src', Paging_pic[I][j].src)
            SetAttribute(img, 'name', Paging_pic[I][j].name)

            // canvas
            var canvas = document.createElement("canvas");
            SetAttribute(canvas, 'id', 'canvas_'+ Paging_pic[I][j].picCount);
            SetAttribute(canvas, 'class', 'picCanvas')
            SetAttribute(canvas, 'ondblclick', 'LoadModal(this,' + I + ')')
            SetAttribute(canvas, 'width', 1920)
            SetAttribute(canvas, 'height', 1080)
            SetAttribute(canvas, 'style', 'position: absolute; top: 0; left: 0;');

            wrapper.appendChild(img)
            wrapper.appendChild(canvas)
            Pictures.appendChild(wrapper)
        }
    }

    var addblank = Paging_pic[I].length % 4
    console.log(addblank)

    if (addblank == 3) {
        addblank = 1;
    } else if (addblank == 2) {
        addblank = 2;
    } else if (addblank == 1) {
        addblank = 3;
    } else {
        addblank = 0;
    }

    for (let i = 0; i < addblank; i++) {
        var div = document.createElement("div");
        SetAttribute(div, 'style', 'width: 20.5208vw; max-width: 394px; height: 11.0221vw; max-height: 211.625px;');

        Pictures.appendChild(div);
    }
}

//
// Paging_pic
//
CountPage = (num) => {
    var CurrentNum = '<span onclick="ChangePage()">' + num + '</span>'
    return CurrentNum;
}

PagingLeft = () => {
    $('#C_Pictures').scrollTop(0);

    if (Paging_pic.length == 1) {
        return;
    }
    if (Index !== 0) {
        Index -= 1;
        while (Pictures.hasChildNodes()) { 
            Pictures.removeChild(Pictures.firstChild); 
        }
    }
    PageLoad(Index);
}

PagingRight = () => {
    $('#C_Pictures').scrollTop(0);

    if (Paging_pic.length == 1) {
        return;
    }
    if (Index < Paging_pic.length - 1) {
        Index += 1;
        while (Pictures.hasChildNodes()) { 
            Pictures.removeChild(Pictures.firstChild); 
        }
    }
    PageLoad(Index);

}

PagingMove = () => {
    var InputCurrentPage = document.querySelector('#InputCurrentPage');

    Index = InputCurrentPage.value - 1
    PageLoad(Index);
}

ChangePage = () => {
    var input = '<input type="text" id="InputCurrentPage" onchange="PagingMove()"></input>';
    InnerHtml(TxtCurrentPage, input)
}

PageLoad = (I) => {
    console.log(Paging_pic[I])
    LoadPictures(I)
    InnerHtml(TxtCurrentPage, CountPage(I+1))
}



// ----------------------------------------------------------
// Date Filter 
// -----------------------------------------------------------

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

ThisMonthData = (e) => {
    canAlertFlag = true
    clickedBtn(e, 'C_DateBtns')

    console.log('어제')

    while (C_Pictures.hasChildNodes()) { 
        C_Pictures.removeChild(C_Pictures.firstChild); 
    }

    // Image Date
    var Today = getToday().toString();


    const thisMonth = new Date()
    thisMonth.setDate(1)

    var nextMonth = new Date(thisMonth)

    if (thisMonth.getMonth() == 11) {
        nextMonth  = new Date(thisMonth.getFullYear() + 1, 0, 1);
    } else {
        nextMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 1);
    }


    var date_from = formatDate(thisMonth)
    var date_to = formatDate(nextMonth)

    console.log("C_IMG_CHART_TODAY_DATA_RANGE", date_from, date_to)


    var period_Start = document.getElementById('period_Start');
    var period_End = document.getElementById('period_End');

    period_Start.value = date_from
    period_End.value = date_to

    
    importImage(date_from, date_to);

}

ThisWeekData = (e) => {
    canAlertFlag = true
    clickedBtn(e, 'C_DateBtns')

    while (C_Pictures.hasChildNodes()) { 
        C_Pictures.removeChild(C_Pictures.firstChild); 
    }

    // Image Date
    var Today = getToday().toString();

    const today = new Date()
    const beforeWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)


    var date_from = formatDate(beforeWeek)
    var date_to = formatDate(today)

    var period_Start = document.getElementById('period_Start');
    var period_End = document.getElementById('period_End');

    period_Start.value = date_from
    period_End.value = date_to

    console.log("C_IMG_CHART_TODAY_DATA_RANGE", date_from, date_to)
    importImage(date_from, date_to);

}



YesterdayData = (e) => {
    canAlertFlag = true
    clickedBtn(e, 'C_DateBtns')
    while (C_Pictures.hasChildNodes()) { 
        C_Pictures.removeChild(C_Pictures.firstChild); 
    }

    // Image Date
    var Today = getToday().toString();

    const today = new Date()
    const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)


    var date_from = formatDate(yesterday)
    var date_to = formatDate(today)


    var period_Start = document.getElementById('period_Start');
    var period_End = document.getElementById('period_End');

    period_Start.value = date_from
    period_End.value = date_to

    console.log("C_IMG_CHART_TODAY_DATA_RANGE", date_from, date_to)
    importImage(date_from, date_to);

}

TodayData = (e) => {
    canAlertFlag = true
    clickedBtn(e, 'C_DateBtns')

    while (C_Pictures.hasChildNodes()) { 
        C_Pictures.removeChild(C_Pictures.firstChild); 
    }

    // Image Date
    var Today = getToday().toString();

    const today = new Date()
    const tomorrow = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)


    var date_from = formatDate(today)
    var date_to = formatDate(tomorrow)

    
    var period_Start = document.getElementById('period_Start');
    var period_End = document.getElementById('period_End');

    period_Start.value = date_from
    period_End.value = date_to

    console.log("C_IMG_CHART_TODAY_DATA_RANGE", date_from, date_to)
    importImage(date_from, date_to);


}

AllData = (e) => {
    canAlertFlag = true
    clickedBtn(e, 'C_DateBtns');
    console.log('전체');
    console.log("today: " + getToday())

    var period_Start = document.getElementById('period_Start');
    var period_End = document.getElementById('period_End');


    const today = new Date()
    var Today = formatDate(today)

    period_Start.value = '2021-03-25'
    period_End.value = Today
    while (C_Pictures.hasChildNodes()) { 
        C_Pictures.removeChild(C_Pictures.firstChild); 
    }

    importImage('2021-03-25', '2100-01-01');
}

DailyData = () => {
    canAlertFlag = true
    
    var btn_Period = document.getElementById('btn_Period');
    var period_Start = document.getElementById('period_Start');
    var period_End = document.getElementById('period_End');

    clickedBtn(btn_Period, 'C_DateBtns');

    console.log('일일')
    var Date = 0

    while (C_Pictures.hasChildNodes()) { 
        C_Pictures.removeChild(C_Pictures.firstChild); 
    }

    
    console.log("period_Start", period_Start.value)
    console.log("period_End", period_End.value)

    date_from = period_Start.value
    date_to = period_End.value

    importImage(date_from, date_to);
    
}
var Modal = document.getElementById('C_Modal'); 

LoadModal = (e, I) => {
    var thisindex = e.id.split('_')[1]


    Modal.style.display = '';
    
    var modalhtml = 
        '<div class="flex_mid">'+
            '<img src="' + e.parentNode.firstChild.src + '" style = >' +
            '<canvas id="modalcanvas" width="1920" height="1080">' + 
        '</div>'

    InnerHtml(Modal, modalhtml)

    var canvas = document.getElementById('modalcanvas')
    var ctx = canvas.getContext('2d')

    var RD = Paging_rect[I][thisindex];

    ctx.beginPath();
    ctx.lineWidth = 10;

    var HUMAN_RESULT = Paging_pic[I][thisindex].human_result;
    for (let j = 0; j < Object.keys(HUMAN_RESULT).length; j++) {
        if (HUMAN_RESULT[j] == "0" && HUMAN_RESULT[j] == 0) {
        } else if (HUMAN_RESULT[j] == "1" && HUMAN_RESULT[j] == 1) {
            if (RD[j] == undefined) {
            } else {
                ctx.strokeStyle = 'green';
                ctx.strokeRect(RD[j]['pothole-x'], RD[j]['pothole-y'], RD[j]['pothole-width'], RD[j]['pothole-height']);
            }
        } else {
            ctx.strokeStyle = 'blue'; 
            var x = (HUMAN_RESULT[j]['pothole-x']);
            var y = (HUMAN_RESULT[j]['pothole-y']);
            var w = (HUMAN_RESULT[j]['pothole-width']);
            var h = (HUMAN_RESULT[j]['pothole-height']);
            ctx.strokeRect(x, y, w, h);
        }
    }

    canvas.style.width = '148.1481vh';
    canvas.style.maxWidth = '1600px';
    canvas.style.height = '83.3333vh';
    canvas.style.maxHeight = '900px';
}

CloseModal = () => {
    Modal.style.display = 'none';
}

//
// 실행
//
SideBar();
clickedChart();


var button_All = document.getElementById('btn_All')
AllData(button_All);

document.onkeydown = (e) => {
    console.log(e)
    if (e.which == 27) {
        CloseModal();
    }
}