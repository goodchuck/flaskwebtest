//
// Chart
//

var LineChartWrapper = document.getElementById('LineChartWrapper')
var ctx = document.getElementById('LineChart').getContext('2d');
var DoughnutChartWrapper = document.getElementById('DoughnutChartWrapper')
var DoughnutChartWrapper2 = document.getElementById('DoughnutChartWrapper2')
var percent = 100
var chart;

var accuracy= 92.7
var recall = 95.2 
var precision = 92.9
var F1_Score = 94.0


var MakeTable = (num, DCW) => {
    var html =  '<div class="table_main">' +
                    '<div class="flex_mid" style="width: 25%;">' +
                        '<div class="DoughnutChart' + num + '" data-percent="' + modelac + '">'+
                            '<p>' + modelac + '%</p>'+
                        '</div>'+
                    '</div>' +
                    '<div class="flex_mid" style="width: 25%;">' +
                        '<div class="DoughnutChart' + num + '" data-percent="' + modelrc + '">'+
                            '<p>' + modelrc + '%</p>'+
                        '</div>'+
                    '</div>' +
                    '<div class="flex_mid" style="width: 25%;">' +
                        '<div class="DoughnutChart' + num + '" data-percent="' + modelpc + '">'+
                            '<p>' + modelpc + '%</p>'+
                        '</div>'+
                    '</div>' +
                    '<div class="flex_mid" style="width: 25%;">' +
                        '<div class="DoughnutChart' + num + '" data-percent="' + modelf1 + '">'+
                            '<p>' + modelf1 + '%</p>'+
                        '</div>'+
                    '</div>' +
                '</div>'
    InnerHtml(DCW, html)
    html = '';
}

MakeLineChart = () => {
    var gradientFill = ctx.createLinearGradient(0, 250, 0, 0);
    gradientFill.addColorStop(0, "rgba(147, 165, 207, 0.8)");
    gradientFill.addColorStop(1, "rgba(228, 239, 233, 0.8)");

    var gradientStroke = ctx.createLinearGradient(0, 125, 0, 0);
    gradientStroke.addColorStop(0, "#93a5cf");
    gradientStroke.addColorStop(1, "#e4efe9");

    var chartdata = {
        type: 'line',
        data: {
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'], 
            datasets: [
                {
                    backgroundColor: gradientFill,
                    borderColor: gradientStroke,
                    pointBorderColor: gradientStroke,
                    pointBackgroundColor: gradientFill,
                    pointHoverBackgroundColor: "rgba(245, 161, 0, 0.8)",
                    pointHoverBorderColor: "rgba(245, 161, 0, 0.8)",
                    data: ['1', '3', '4', '2', '4', '3', '2', '1', '5'],
                },
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
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
        },
    }

    chart = new Chart(ctx, chartdata);
}

var MakeDoughnutChart = (num, color1, color2) => {
    var DoughnutChart = document.querySelectorAll('.DoughnutChart' + num);

    for (let i = 0; i < DoughnutChart.length; i++) {
        new EasyPieChart(DoughnutChart[i], {
            barColor: function() {
                var ctx = this.renderer.getCtx();
                var canvas = this.renderer.getCanvas();
                canvas.style.width = '13.8889vh';
                canvas.style.maxWidth = '150px';
                canvas.style.height = '13.8889vh';
                canvas.style.maxHeight = '150px';
                var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                    gradient.addColorStop(0, color1);
                    gradient.addColorStop(0.5, color2);
                return gradient;
            },
            trackColor: false,  // 차트가 그려지는 트랙의 기본 배경색(chart1 의 회색부분)
            scaleColor: false, // 차트 테두리에 그려지는 기준선 (chart2	의 테두리 선)
            lineCap: 'butt', // 차트 선의 모양 chart1 butt / chart2 round / chart3 square
            lineWidth: 20, // 차트 선의 두께
            animate: 600, // 그려지는 시간 
        });
    }
}

//
// datetime
//
var datetimeBox = document.getElementById('datetimeBox');

Loaddatetime = (YYYY, MM, DD, hh, mm, ss) => {
    var html =                                         
        '<p>' + YYYY + '</p>' +
        '<p style="margin-right: 0.2604vw;">년</p>' +
        '<p>' + MM + '</p>' +
        '<p style="margin-right: 0.2604vw;">월</p>' +
        '<p>' + DD + '</p>' +
        '<p style="margin-right: 0.5208vw;">일</p>' +

        '<p>' + hh + '</p>' +
        '<p style="margin-right: 0.2604vw;">시</p>' +
        '<p>' + mm + '</p>' +
        '<p style="margin-right: 0.2604vw;">분</p>' +
        '<p>' + ss + '</p>' +
        '<p>초</p>'

    InnerHtml(datetimeBox, html)
}

Inputdatetime = (e) => {
    var input = '<input id="datetime" step="1" type="datetime-local" onKeypress="Changedatetime()"/>' 
    // + '<button onclick="Changedatetime()">확인</button>'
    console.log(e)
    InnerHtml(e, input)
    SetAttribute(e, 'onclick', '')
}

Changedatetime = (e) => {
    var datetime = document.getElementById('datetime').value
    
    if (datetime == '') {
        alert('날짜와 시간을 입력해주세요.')
    } else {
        var date = datetime.split('T')[0]
        var time = datetime.split('T')[1]
        
        var year = date.split('-')[0]
        var month = date.split('-')[1]
        var day = date.split('-')[2]

        var hour = time.split(':')[0]
        var minutes = time.split(':')[1]
        var seconds = time.split(':')[2]

        Loaddatetime(year, month, day, hour, minutes, seconds)
        SetAttribute(datetimeBox, 'onclick', 'Inputdatetime(this)')
    }
}

//
// 실행
//

MakeLineChart();

var color1 = "rgba(147, 165, 207)"
var color2 = "rgba(228, 239, 233)"
var DCW = DoughnutChartWrapper
MakeTable(1, DCW);
MakeDoughnutChart(1, color1, color2);

color1 = "#fa709a"
color2 = "#fee140"
DCW = DoughnutChartWrapper2
MakeTable(2, DCW);
MakeDoughnutChart(2, color1, color2);

var Today = getToday().toString();
var CurrentTime = getCurrentTime();
Loaddatetime(Today.substring(0,4), Today.substring(4,6), Today.substring(6,8), CurrentTime.HH, CurrentTime.mm, CurrentTime.SS);

// 
// 실행
//
SideBar();
clickedServer();