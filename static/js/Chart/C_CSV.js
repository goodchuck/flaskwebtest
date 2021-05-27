// Data
var tempAllImg = [];
var Data = [];
var done = false
// Chart
var chart;
var ctx = document.getElementById('chart').getContext('2d')
var ShowLabels = [];
var ShowData = [];

var office = 0;

// CSV
var Index = 1
var array = [
    { title : '행정구역' },
    { title : '수원' },
    { title : '의정부' },
    { title : '홍천' },
    { title : '강릉' },
    { title : '정선' },
    { title : '논산' },
    { title : '충주' },
    { title : '보은' },
    { title : '예산' },
    { title : '광주' },
    { title : '남원' },
    { title : '순천' },
    { title : '전주' },
    { title : '진주' },
    { title : '포항' },
    { title : '영주' },
    { title : '진영' },
    { title : '대구' }
], 

loadData = (date_from, date_to, MM) => {
    var Data_devicePothole_ALL = []
    var settings_statis_showImagesByDate = {
        "url": "http://165.246.196.154:3002/app/statis/showImagesByDate?date_from=" + date_from + "&date_to=" + date_to,
        "method": "GET",
    };
    
    $.ajax(settings_statis_showImagesByDate).done(function (response) {
        if (response.isSuccess) {
            console.log("settings_statis_showImagesByDate success", response);
            
            var result = response.ImagesByDate;
            console.log(MM)
            if (MM == '04월' && result.length == 0) {
                return 0;
            } else {
                result.find(element => {
                    for (var i in element) {
                        Data.push(element[i])
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
                ShowLabels.push(MM);
                array[0]['value'+Index] = MM; 
                for (let i = 0; i < Data_devicePothole_ALL.length; i++) {
                    office += Data_devicePothole_ALL[i];
                }
                ShowData.push(office);
                office = 0;
                
                makeTableChart(MM, Data_devicePothole_ALL);
                MakeChart();

                if (done == true) {    
                    DesignateMonth();
    
                    done = false
                    Index += 1
                }
            }
        } else {
            console.log("settings_statis_showImagesByDate failed", response);
        }
    });
}


MakeChart = () => {
    if (chart) {
        chart.destroy();
    }

    var chartdata = {
        type: 'line',

        data: {
            labels: ShowLabels, 
            datasets: [
                {
                    label: '검출 포트홀 개수',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
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
                        stepSize: 10,
                        beginAtZero: true
                    }
                }]
            },
        },
    }

    chart = new Chart(ctx, chartdata);
}

var yyyy = '2021'
var MM = '03'
var dd = '01'

DesignateMonth = () => {
    var ymd = yyyy + '-' + MM + '-' + dd
    var mm = MM + '월'

    var temp = MonthFilter(yyyy, MM, dd)
    yyyy = temp.y
    MM = temp.m
    dd = temp.d
    
    var ymd2 = yyyy + '-' + MM + '-' + dd

    loadData(ymd, ymd2 , mm)
}

makeTableChart = (MM, Data_devicePothole_ALL) => {
    $('#tr_0').append('<th>' + MM + '</th>')

    var count = 1;
    var office = 0;
    var index = 1;

    for (let i = 0; i < Data_devicePothole_ALL.length; i++) {
        if (count == 2) {
            count = 0;
            $('#tr_' + index).append('<td>'+ office +'</td>')
            array[index]['value'+Index] = office
            office = 0;
            index += 1;
        }

        office += Data_devicePothole_ALL[i];
        count += 1;
    }

    done = true
}

exportCSV = () => {
    console.log(array)

    var csv = "";
    $.each(array, function(i, item){
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
DesignateMonth();