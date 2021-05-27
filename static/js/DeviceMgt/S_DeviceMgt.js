// Data
var result = [];
var Data = [];
var RectData = [];

var settings_widthout_img = {
    "url": "http://165.246.196.154:3002/app/findPothole/all",
    "method": "GET",
    "timeout": 0,
};

$.ajax(settings_widthout_img).done(function (response) {
    if (response.isSuccess) {
        console.log("settings__widthout_img success", response);
        var temp = response.findPothole_ALL;

        console.log('temp =>', temp)
        for (var i in temp) {
            for (var j in temp[i]) {
                result.push(temp[i][j])
            }
        }

        DeviceValues = [];

        arrayDateValue(result)
        arrayDeviceValue(result)
        arrayDeviceData(result, Data)

        console.log(Data)

        var e = document.getElementById('btn_All')
        AllData(e);
    } else {
        console.log("settings_widthout_img failed", response);
    }
});

// List
var DeviceList = document.getElementById('DeviceList');

var chart;
var Labels = 0;
var AverageData1 = 0;
var AverageData2 = 0;
var sum = 0;
var date = [];
var time = [];
var temp = []
var ShowLabels = [];
var ShowData1 = [];
var ShowData2 = [];
var chartdata = [];

// 정확도
var tempAccuracy = [];
var temp2Accuracy = [];
var Accuracy = [];
var numerator = 0;
var denominator = 0;
var thispecent = [];

MakeTable = (percent) => {
    var html = '<table style="width: 100%">';
    // console.log(JSON.parse(Data[0][0].META_DATA))
    for (let i = 0; i < DeviceValues.length; i++) {
        html += '<tr>' +
            '<td style="width: 20%;">' + DeviceValues[i] + '</td>' +
            '<td style="width: 65%;"><canvas class="LineChart"></canvas></td>' +
            '<td style="width: 15%;">' +
            '<div class="DoughnutChart" data-percent="' + percent[i] + '">' +
            '<p>' + percent[i] + '%</p>' +
            '</div>' +
            '</td>' +
            '</tr>'
    }

    html += '</table>'
    InnerHtml(DeviceList, html)
    html = '';
}

MakeLineChart = (percent) => {
    MakeTable(percent);
    MakeDoughnutChart();

    var LineChart = document.querySelectorAll('.LineChart');

    for (let i = 0; i < LineChart.length; i++) {
        var ctx = LineChart[i].getContext('2d');

        var gradientFill1 = ctx.createLinearGradient(500, 0, 0, 0);
        gradientFill1.addColorStop(0, "rgba(254, 249, 215, 0.8)");
        gradientFill1.addColorStop(1, "rgba(210, 153, 194, 0.8)");
    
        var gradientStroke1 = ctx.createLinearGradient(500, 0, 0, 0);
            gradientStroke1.addColorStop(0, "rgba(254, 249, 215)");
            gradientStroke1.addColorStop(1, "rgba(210, 153, 194)");
        
        var gradientFill2 = ctx.createLinearGradient(500, 0, 0, 0);
            gradientFill2.addColorStop(0, "rgba(51, 231, 148, 0.7)");
            gradientFill2.addColorStop(1, "rgba(0, 158, 253, 0.7)");
            
        var gradientStroke2 = ctx.createLinearGradient(500, 0, 0, 0);
            gradientStroke2.addColorStop(0, "rgba(51, 231, 148)");
            gradientStroke2.addColorStop(1, "rgba(0, 158, 253)");

        var gradientFill = [gradientFill1, gradientFill2];
        var gradientStroke = [gradientStroke1, gradientStroke2];

        for (let j = 0; j < chartdata[i].data.datasets.length; j++) {
            chartdata[i].data.datasets[j].backgroundColor = gradientFill[j];
            chartdata[i].data.datasets[j].borderColor = gradientStroke[j];
            chartdata[i].data.datasets[j].pointBorderColor = gradientStroke[j];
            chartdata[i].data.datasets[j].pointBackgroundColor = gradientFill[j];
            chartdata[i].data.datasets[j].pointHoverBackgroundColor = "rgba(245, 161, 0, 0.8)";
            chartdata[i].data.datasets[j].pointHoverBorderColor = "rgba(245, 161, 0, 0.8)";
        }   
        chart = new Chart(ctx, chartdata[i])
    }
}

MakeDoughnutChart = () => {
    var DoughnutChart = document.querySelectorAll('.DoughnutChart');

    for (let i = 0; i < DoughnutChart.length; i++) {
        new EasyPieChart(DoughnutChart[i], {
            barColor: function () {
                var ctx = this.renderer.getCtx();
                var canvas = this.renderer.getCanvas();
                var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                gradient.addColorStop(0, "rgba(147, 165, 207)");
                gradient.addColorStop(0.5, "rgba(228, 239, 233)");
                return gradient;
            },
            trackColor: '#F0F0F0',  // 차트가 그려지는 트랙의 기본 배경색(chart1 의 회색부분)
            scaleColor: false, // 차트 테두리에 그려지는 기준선 (chart2	의 테두리 선)
            lineCap: 'butt', // 차트 선의 모양 chart1 butt / chart2 round / chart3 square
            lineWidth: 20, // 차트 선의 두께
            animate: 600, // 그려지는 시간 
        });
    }
}

arrayPercent = () => {
    for (let i = 0; i < Accuracy.length; i++) {
        for (let j = 0; j < Accuracy[i].length; j++) {
            for (let k = 0; k < Accuracy[i][j].length; k++) {
                for (let l = 0; l < Object.keys(Accuracy[i][j][k]).length; l++) {
                    if (Accuracy[i][j][k][l] == "1" && Accuracy[i][j][k][l] == 1) {
                        numerator += 1;
                    }
                }
                denominator += Object.keys(Accuracy[i][j][k]).length;
            }
        }

        var temp = (numerator / denominator) * 100 
        if (isNaN(temp)) {
            temp = 0
        }
        temp = temp.toFixed(2)
        thispecent.push(temp);

        numerator = 0;
        denominator = 0;
    }
}

AllData = (e) => {
    clickedBtn(e, 'DateBtns');
    console.log('전체');
    console.log('Data => ', Data)
    console.log('Date => ', DateValues)

    for (let i = 0; i < Data.length; i++) {
        if (Data[i].length == 0) {
            // 정확도
            temp2Accuracy.push('')
            Accuracy.push(temp2Accuracy)
            temp2Accuracy = [];

            ShowLabels.push('');
            ShowData1.push(0)
            ShowData2.push(0)
        }
        for (let j = 0; j < Data[i].length; j++) {
            for (let k = 0; k < Data[i][j].length; k++) {
                // x축 라벨
                Labels = JSON.parse(Data[i][j][k].META_DATA).yyyyMMdd;

                // y축 값 => 검출된 포트홀 개수
                var model_result = JSON.parse(Data[i][j][k]['UTL_RAW.CAST_TO_VARCHAR2(MODEL_RESULT)'])
                if (typeof model_result == 'string') {
                    model_result = JSON.parse(model_result)
                }
                AverageData1 += Object.keys(model_result).length

                // y축 값 => 검수된 포트홀 개수
                var human_result = JSON.parse(Data[i][j][k]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
                if (typeof human_result == 'string') {
                    human_result = JSON.parse(human_result)
                }
                for (let l = 0; l < Object.keys(human_result).length; l++) {
                    if (human_result[l] !== "0" && human_result[l] !== 0) {
                        AverageData2 += 1
                    }
                }

                // 정확도
                tempAccuracy.push(human_result)

            }
            // x축 라벨
            ShowLabels.push(Labels)
            Labels = 0
            // y축 값
            ShowData1.push(AverageData1)
            AverageData1 = 0;
            ShowData2.push(AverageData2)
            AverageData2 = 0;
            // 정확도
            temp2Accuracy.push(tempAccuracy)
            tempAccuracy = [];
        }
        // 정확도
        if (Data[i].length !== 0) {
            Accuracy.push(temp2Accuracy)
            temp2Accuracy = [];
        }

        console.log('Datas => ',ShowLabels, ShowData1, ShowData2)
        // 차트 데이터
        ChartDataPush(ShowLabels, ShowData1, ShowData2)
        ShowLabels = [];
        ShowData1 = [];
        ShowData2 = [];
    }

    // 정확도
    arrayPercent();
    MakeLineChart(thispecent);

    chartdata = [];
    Accuracy = [];
    thispecent = [];
}

YesterdayData = (e) => {
    clickedBtn(e, 'DateBtns');
    console.log('어제')

    var Yesterday = getYesterday();

    for (let i = 0; i < Data.length; i++) {
        // 정확도
        if (Data[i].length == 0) {
            tempAccuracy.push('')
            Accuracy.push(tempAccuracy)
            tempAccuracy = [];
        }
        for (let j = 0; j < Data[i].length; j++) {
            for (let k = 0; k < Data[i][j].length; k++) {
                if (JSON.parse(Data[i][j][k].META_DATA).yyyyMMdd == Yesterday) {
                    // x축 라벨
                    ShowLabels.push(JSON.parse(Data[i][j][k].META_DATA).HHmmssSSS)

                    // y축 값 => 검출된 포트홀 개수
                    var model_result = JSON.parse(Data[i][j][k]['UTL_RAW.CAST_TO_VARCHAR2(MODEL_RESULT)'])
                    if (typeof model_result == 'string') {
                        model_result = JSON.parse(model_result)
                    }
                    AverageData1 += Object.keys(model_result).length

                    // y축 값 => 검수된 포트홀 개수
                    var human_result = JSON.parse(Data[i][j][k]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
                    if (typeof human_result == 'string') {
                        human_result = JSON.parse(human_result)
                    }
                    for (let l = 0; l < Object.keys(human_result).length; l++) {
                        if (human_result[l] !== "0" && human_result[l] !== 0) {
                            AverageData2 += 1
                        }
                    }

                    // 정확도
                    tempAccuracy.push(human_result)
                }
            }
            // 정화도
            temp2Accuracy.push(tempAccuracy)
            tempAccuracy = [];
        }
        if (Data[i].length !== 0) {
            Accuracy.push(temp2Accuracy)
            temp2Accuracy = [];
        }

        // 차트 데이터
        ChartDataPush(ShowLabels, ShowData1, ShowData2)
        ShowLabels = [];
        ShowData1 = [];
        ShowData2 = [];
    }

    // 정확도
    arrayPercent();
    MakeLineChart(thispecent);

    chartdata = [];
    Accuracy = [];
    thispecent = [];
}

TodayData = (e) => {
    clickedBtn(e, 'DateBtns');
    console.log('오늘')

    var Today = getToday();

    for (let i = 0; i < Data.length; i++) {
        // 정확도
        if (Data[i].length == 0) {
            tempAccuracy.push('')
            Accuracy.push(tempAccuracy)
            tempAccuracy = [];
        }
        for (let j = 0; j < Data[i].length; j++) {
            for (let k = 0; k < Data[i][j].length; k++) {
                if (JSON.parse(Data[i][j][k].META_DATA).yyyyMMdd == Today) {
                    // x축 라벨
                    ShowLabels.push(JSON.parse(Data[i][j][k].META_DATA).HHmmssSSS)

                    // y축 값 => 검출된 포트홀 개수
                    var model_result = JSON.parse(Data[i][j][k]['UTL_RAW.CAST_TO_VARCHAR2(MODEL_RESULT)'])
                    if (typeof model_result == 'string') {
                        model_result = JSON.parse(model_result)
                    }
                    AverageData1 += Object.keys(model_result).length

                    // y축 값 => 검수된 포트홀 개수
                    var human_result = JSON.parse(Data[i][j][k]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
                    if (typeof human_result == 'string') {
                        human_result = JSON.parse(human_result)
                    }
                    for (let l = 0; l < Object.keys(human_result).length; l++) {
                        if (human_result[l] !== "0" && human_result[l] !== 0) {
                            AverageData2 += 1
                        }
                    }

                    // 정확도
                    tempAccuracy.push(human_result)
                }

            }
            // 정확도
            temp2Accuracy.push(tempAccuracy)
            tempAccuracy = [];
        }
        // 정확도
        if (Data[i].length !== 0) {
            Accuracy.push(temp2Accuracy)
            temp2Accuracy = [];
        }

        // 차트 데이터
        ChartDataPush(ShowLabels, ShowData1, ShowData2)
        ShowLabels = [];
        ShowData1 = [];
        ShowData2 = [];
    }

    // 정확도
    arrayPercent();
    MakeLineChart(thispecent);

    chartdata = [];
    Accuracy = [];
    thispecent = [];
}

ThisWeekData = (e) => {
    clickedBtn(e, 'DateBtns');
    console.log('이번주')

    var Today = getToday();
    var ThisWeek = getThisWeek();
    var Year = ThisWeek.toString().substring(0, 4);
    var Month = ThisWeek.toString().substring(4, 6);
    var Day = ThisWeek.toString().substring(6, 8);

    var TWYear = Year;
    var TWMonth = Month;
    var TWDay = Day;

    var Week = Year + Month + Day;

    for (let i = 0; i < Data.length; i++) {
        // 정확도
        if (Data[i].length == 0) {
            tempAccuracy.push('')
            Accuracy.push(tempAccuracy)
            tempAccuracy = [];
        }
        for (let j = 0; j < Data[i].length; j++) {
            for (let k = 0; k < 7; k++) {
                Week = Year + Month + Day;
                if (Data[i][j][k] !== undefined && JSON.parse(Data[i][j][k].META_DATA).yyyyMMdd == Week) {
                    date.push(Data[i][j][k]);
                    for (var l in Data[i][j]) {
                        // y축 값 => 검출된 포트홀 개수
                        var model_result = JSON.parse(Data[i][j][l]['UTL_RAW.CAST_TO_VARCHAR2(MODEL_RESULT)'])
                        if (typeof model_result == 'string') {
                            model_result = JSON.parse(model_result)
                        }
                        AverageData1 += Object.keys(model_result).length

                        // y축 값 => 검수된 포트홀 개수
                        var human_result = JSON.parse(Data[i][j][l]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
                        if (typeof human_result == 'string') {
                            human_result = JSON.parse(human_result)
                        }
                        for (let m = 0; m < Object.keys(human_result).length; m++) {
                            if (human_result[m] !== "0" && human_result[m] !== 0) {
                                AverageData2 += 1
                            }
                        }

                        // 정확도
                        tempAccuracy.push(human_result)
                    }
                }
                // 날짜 필터
                if (Week == Today) {
                    Week = ThisWeek;
            
                    Year = TWYear;
                    Month = TWMonth;
                    Day = TWDay;
            
                    break;
                } else {
                    Year, Month, Day = DateFilter(Year, Month, Day);
                    console.log(Year, Month, Day)
                }
            }
            // y축 값
            ShowData1.push(AverageData1)
            AverageData1 = 0;
            ShowData2.push(AverageData2)
            AverageData2 = 0;

            //정확도
            temp2Accuracy.push(tempAccuracy)
            tempAccuracy = [];
        }
        // x축 라벨
        date.filter((element) => {
            ShowLabels.push(JSON.parse(element.META_DATA).yyyyMMdd)
        })

        // 정확도
        if (Data[i].length !== 0) {
            Accuracy.push(temp2Accuracy)
            temp2Accuracy = [];
        }

        // 차트 데이터
        ChartDataPush(ShowLabels, ShowData1, ShowData2)

        date = []
        Labels = 0
        ShowLabels = [];
        ShowData1 = [];
        ShowData2 = [];
    }

    // 정확도
    arrayPercent();
    MakeLineChart(thispecent);

    chartdata = [];
    Accuracy = [];
    thispecent = [];
}

ThisMonthData = (e) => {
    clickedBtn(e, 'DateBtns');
    console.log('이번달')

    var Today = getToday();
    var Month = getThisMonth();
    var thisMonth = Month.toString().substring(0, 6);

    for (let i = 0; i < Data.length; i++) {
        // 정확도
        if (Data[i].length == 0) {
            tempAccuracy.push('')
            Accuracy.push(tempAccuracy)
            tempAccuracy = [];
        }
        for (let j = 0; j < Data[i].length; j++) {
            var strMonth = JSON.parse(Data[i][j][0].META_DATA).yyyyMMdd.toString().substring(0, 6)

            if (thisMonth == strMonth) {
                date.push(Data[i][j]);
                for (var k in Data[i][j]) {
                    var model_result = JSON.parse(Data[i][j][k]['UTL_RAW.CAST_TO_VARCHAR2(MODEL_RESULT)'])
                    if (typeof model_result == 'string') {
                        model_result = JSON.parse(model_result)
                    }
                    AverageData1 += Object.keys(model_result).length

                    var human_result = JSON.parse(Data[i][j][k]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
                    if (typeof human_result == 'string') {
                        human_result = JSON.parse(human_result)
                    }
                    for (let l = 0; l < Object.keys(human_result).length; l++) {
                        if (human_result[l] !== "0" && human_result[l] !== 0) {
                            AverageData2 += 1
                        }
                    }

                    tempAccuracy.push(human_result)
                }
            }

            if (JSON.parse(Data[i][j][0].META_DATA).yyyyMMdd == Today) {
                break;
            }

            // y축 값
            ShowData1.push(AverageData1)
            AverageData1 = 0;
            ShowData2.push(AverageData2)
            AverageData2 = 0;

            //정확도
            temp2Accuracy.push(tempAccuracy)
            tempAccuracy = [];
        }
        date.filter((element) => {
            ShowLabels.push(JSON.parse(element[0].META_DATA).yyyyMMdd)
        })

        // 정확도
        if (Data[i].length !== 0) {
            Accuracy.push(temp2Accuracy)
            temp2Accuracy = [];
        }
        
        // 차트 데이터
        ChartDataPush(ShowLabels, ShowData1, ShowData2)
        date = []
        Labels = 0
        AverageData1 = 0;
        AverageData2 = 0;
        ShowLabels = [];
        ShowData1 = [];
        ShowData2 = [];
    }

    // 정확도
    arrayPercent();
    MakeLineChart(thispecent);

    chartdata = [];
    Accuracy = [];
    thispecent = [];
}

ThisPeriod = () => {
    var btn_Period = document.getElementById('btn_Period')
    var PeriodStart = document.getElementById('PeriodStart')
    var PeriodEnd = document.getElementById('PeriodEnd')

    clickedBtn(btn_Period, 'DateBtns');

    if (PeriodStart == null || PeriodStart  == null) {
        alert('기간을 지정해주세요.')

        var e = document.getElementById('btn_All')
        AllData(e);
        return;
    } else {
        var Start = PeriodStart.value;
        var End = PeriodEnd.value;
    }

    var sdt = new Date(Start);
    var edt = new Date(End);
    var dateDiff = Math.ceil((edt.getTime() - sdt.getTime()) / (1000 * 3600 * 24)) + 1;

    var StartYear = Start.slice(0, 4);
    var StartMonth = Start.slice(5, 7);
    var StartDay = Start.slice(8, 10);

    Start = StartYear + StartMonth + StartDay
    End = End.slice(0, 4) + End.slice(5, 7) + End.slice(8, 10);

    console.log(Start)

    if (Number(Start) > Number(End)) {
        alert('기간 시작 날짜가 기간 끝 날짜보다 작아야 합니다.')
        return;
    }

    for (let i = 0; i < Data.length; i++) {
        // 정확도
        if (Data[i].length == 0) {
            tempAccuracy.push('')
            Accuracy.push(tempAccuracy)
            tempAccuracy = [];
        }
        for (let j = 0; j < Data[i].length; j++) {
            for (let k = 0; k < dateDiff; k++) {
                Start = StartYear + StartMonth + StartDay

                if (JSON.parse(Data[i][j][0].META_DATA).yyyyMMdd == Start) {
                    date.push(Data[i][j]);
                    for (var l in Data[i][j]) {
                        var model_result = JSON.parse(Data[i][j][l]['UTL_RAW.CAST_TO_VARCHAR2(MODEL_RESULT)'])
                        if (typeof model_result == 'string') {
                            model_result = JSON.parse(model_result)
                        }
                        AverageData1 += Object.keys(model_result).length
    
                        var human_result = JSON.parse(Data[i][j][l]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
                        if (typeof human_result == 'string') {
                            human_result = JSON.parse(human_result)
                        }
                        for (let m = 0; m < Object.keys(human_result).length; m++) {
                            if (human_result[m] !== "0" && human_result[m] !== 0) {
                                AverageData2 += 1
                            }
                        }
    
                        tempAccuracy.push(human_result)
                    }
                }

                if (Start == End) {
                    Start = PeriodStart.value;

                    StartYear = Start.slice(0, 4);
                    StartMonth = Start.slice(5, 7);
                    StartDay = Start.slice(8, 10);

                    break;
                } else if (StartMonth == '4' || StartMonth == '6' || StartMonth == '9' || StartMonth == '11' && StartDay == '30') {
                    StartDay = Number(StartDay);
                    StartMonth = Number(StartMonth);

                    StartDay = 1;
                    StartMonth += 1;

                    StartDay = "0" + StartDay.toString();
                    StartMonth = StartMonth.toString();
                } else if (StartMonth == '02') {
                    if (Number(StartYear) % 4 == 0 && Number(StartYear) % 100 !== 0 || Number(StartYear) % 400 == 0) {
                        if (StartDay == '29') {
                            StartMonth = '03'
                            StartDay = '01'
                        }
                    } else if (Day == '28') {
                        StartMonth = '03'
                        StartDay = '01'
                    }
                } else if (StartDay == '31') {
                    StartDay = Number(StartDay);
                    StartMonth = Number(StartMonth);
                    StartYear = Number(StartYear);

                    StartDay = 1;

                    if (StartMonth == '12') {
                        StartMonth = '01';
                        StartYear += 1;
                    } else {
                        StartMonth += 1;
                    }

                    StartDay = "0" + StartDay.toString();
                    StartMonth = StartMonth.toString();
                    StartYear = StartYear.toString();
                } else {
                    StartDay = Number(StartDay);

                    StartDay += 1;

                    StartDay = StartDay.toString();

                    if (StartDay < 10) {
                        StartDay = "0" + StartDay;
                    }
                }
            }
            // y축 값
            ShowData1.push(AverageData1)
            AverageData1 = 0;
            ShowData2.push(AverageData2)
            AverageData2 = 0;

            //정확도
            temp2Accuracy.push(tempAccuracy)
            tempAccuracy = [];
        }
        date.filter((element) => {
            ShowLabels.push(JSON.parse(element[0].META_DATA).yyyyMMdd)
        })

        // 정확도
        if (Data[i].length !== 0) {
            Accuracy.push(temp2Accuracy)
            temp2Accuracy = [];
        }

        // 차트 데이터
        ChartDataPush(ShowLabels, ShowData1, ShowData2)
        date = []
        Labels = 0
        ShowLabels = [];
        ShowData1 = [];
        ShowData2 = [];
    }

    // 정확도
    arrayPercent();
    MakeLineChart(thispecent);

    chartdata = [];
    Accuracy = [];
    thispecent = [];
}

ChartDataPush = (ShowLabels, ShowData1, ShowData2) => {
    // console.log('sl =>', ShowLabels)
    // console.log('sd1 =>', ShowData1)
    // console.log('sd2 =>', ShowData2)
    chartdata.push(
        {
            type: 'line',
            data: {
                labels: ShowLabels,
                datasets: [
                    {
                        label: '검출된 포트홀 개수',
                        data: ShowData1
                    },
                    {
                        label: '검수된 포트홀 개수',
                        data: ShowData2
                    }
                ]
            },
            options: {
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                legend: {
                    display: false
                },
                maintainAspectRatio: false, // default value. false일 경우 포함된 div의 크기에 맞춰서 그려짐.
                scales: {
                    xAxes: [{
                        ticks: {
                            maxRotation: 0,
                            minRotation: 0,
                            maxTicksLimit: 12
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
    )
}

//
// 실행
//
SideBar();
clickedServer();