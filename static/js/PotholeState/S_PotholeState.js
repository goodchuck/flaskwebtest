// ChartData
var result = [];
var ChartData = [];
var ChartData2 = [];
var ListData = [];
var RectData = [];

// map
var map;
var marker = [];
var iconPink = "../img/marker.png";
var iconBlue = "../img/marker2.png";

// Chart
var ctx = document.getElementById("Chart").getContext("2d");

//
var index;
var pageIndex;
var gradientFill1 = ctx.createLinearGradient(500, 0, 0, 0);
gradientFill1.addColorStop(0, "rgba(254, 249, 215, 0.6)");
gradientFill1.addColorStop(1, "rgba(210, 153, 194, 0.6)");

var gradientStroke1 = ctx.createLinearGradient(500, 0, 0, 0);
gradientStroke1.addColorStop(0, "rgba(254, 249, 215)");
gradientStroke1.addColorStop(1, "rgba(210, 153, 194)");

var gradientFill2 = ctx.createLinearGradient(500, 0, 0, 0);
gradientFill2.addColorStop(0, "rgba(51, 231, 148, 0.6)");
gradientFill2.addColorStop(1, "rgba(0, 158, 253, 0.6)");

var gradientStroke2 = ctx.createLinearGradient(500, 0, 0, 0);
gradientStroke2.addColorStop(0, "rgba(51, 231, 148)");
gradientStroke2.addColorStop(1, "rgba(0, 158, 253)");

var chart;

var Labels = 0;
var AverageData1 = 0;
var AverageData2 = 0;

var ShowLabels = [];
var ShowData1 = [];
var ShowData2 = [];

var select_index = 0;
var select_array = [];

var date = [];

// List
var ListBody = document.querySelector("#ListBody");
var TxtCurrentListPage = document.querySelector("#TxtCurrentListPage");
var TxtTotalListPage = document.querySelector("#TxtTotalListPage");

var ListPaging = [];
var ListHtml = "";
var ListIndex = 0;
var Count = 1;
var tr_Count = 0;

var settings_contain_image = {
  url: "http://165.246.196.154:3002/app/findPothole/all",
  method: "GET",
  timeout: 0
};




$.ajax(settings_contain_image).done(function (response) {
  if (response.isSuccess) {
    console.log("settings_contain_image success", response);
    var temp = response.findPothole_ALL;
    var temp2 = response.pothole_CNT;
    var pothole_CNT = [];

    for (var i in temp2) {
      pothole_CNT.push({
        yyyyMMdd: temp2[i]["PHOTO_FILE_URL"].split("/")[1],
        HHmmssSSS: temp2[i]["PHOTO_FILE_URL"].split("/")[2].split(".")[0],
        PHOTO_FILE_URL: temp2[i]["PHOTO_FILE_URL"],
        PTH_CNT: temp2[i]["PTH_CNT"]
      });
    }
    console.log("_____");
    console.log(pothole_CNT);

    for (var i in temp) {
      for (var j in temp[i]) {
        result.push(temp[i][j]);
      }
    }

    arrayDateValue(result);
    arrayReverseDateValue(result);
    arrayDeviceValue();
    arrayDateData(result, ChartData);
    arrayChartData(pothole_CNT, ChartData2);
    arrayReverseDateData(result, ListData);
    arrayRectData(ListData, RectData);
    console.log(ChartData);
    console.log(ListData);

    var e = document.getElementById("btn_All");
    AllData(e);
  } else {
    console.log("settings_contain_image failed", response);
  }
});









arrayChartData = (data, type) => {
  var temp = [];
  for (let i = 0; i < DateValues.length; i++) {
    data.filter((element) => {
      if (element.yyyyMMdd === DateValues[i]) {
        temp.push(element);
      }
    });

    temp.sort((a, b) => {
      return a.HHmmssSSS - b.HHmmssSSS;
    });

    if (temp.length !== 0) {
      type.push(temp);
    }

    temp = [];
  }
};

//
// Map
//

initMap = () => {
  const myLatLng = { lat: 36.637623, lng: 127.984471 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: myLatLng,
    zoom: 7
  });
};

AddMarkers = () => {
  for (let i = 0; i < marker.length; i++) {
    var orgimg = document.getElementById("img_" + i);
    if (orgimg !== null) {
      attachSecretMessage(marker[i], orgimg.src);
    }
    marker[i].setMap(map);
  }
};

RemoveDataWrapper = () => {
  for (let i = 0; i < marker.length; i++) {
    marker[i].setMap(null);
  }
  marker = [];

  if (chart) {
    chart.destroy();
  }
};

attachSecretMessage = (marker, Image) => {
  const infowindow = new google.maps.InfoWindow({
    content:
      // '<p style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">' + marker.title + '</p>' +
      '<img src="' + Image + '" style="width: 320px; height: 180px;" />'
  });
  marker.addListener("click", () => {
    infowindow.open(marker.get("map"), marker);
  });
};

//
// Chart
//
MakeChart = () => {
  if (chart) {
    chart.destroy();
  }

  var chartdata = {
    type: "line",

    data: {
      labels: ShowLabels,
      datasets: [
        {
          label: "검출된 포트홀 개수",
          backgroundColor: gradientFill1,
          borderColor: gradientStroke1,
          data: ShowData1
        },
        {
          label: "검수된 포트홀 개수",
          backgroundColor: gradientFill2,
          borderColor: gradientStroke2,
          data: ShowData2
        }
      ]
    },

    // Configuration options go here
    options: {
      tooltips: {
        mode: "index",
        intersect: false
      },
      hover: {
        mode: "nearest",
        intersect: true
      },
      legend: {
        display: false
      },
      maintainAspectRatio: false, // default value. false일 경우 포함된 div의 크기에 맞춰서 그려짐.
      // responsive: false,
      scales: {
        xAxes: [
          {
            ticks: {
              maxRotation: 0,
              minRotation: 0,
              maxTicksLimit: 5
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              stepSize: 10,
              beginAtZero: true
            }
          }
        ]
      }
    }
  };

  chart = new Chart(ctx, chartdata);
};

AllData = (e) => {
  var Today = getToday();

  var Year = Today.toString().substring(0, 4);
  var Month = Today.toString().substring(4, 6);
  var Day = Today.toString().substring(6, 8);
  var getStrToday = Year + "-" + Month + "-" + Day;
  var PeriodStart = document.getElementById("PeriodStart");
  var PeriodEnd = document.getElementById("PeriodEnd");

  PeriodStart.value = "2021-03-25";
  PeriodEnd.value = getStrToday;

  console.log("sd => ", ShowData1, ShowData2);
  
  
  // 버튼 이펙트 
  clickedBtn(e, "Mini_DateBtns");
  console.log("전체");

  RemoveDataWrapper();

  // Pothole ChartData
  // for (let i = 0; i < ChartData.length; i++) {
  //   for (let j = 0; j < ChartData[i].length; j++) {
  //     Labels = ChartData2[i][0].yyyyMMdd;
  //     AverageData2 += ChartData2[i][j].PTH_CNT;

      // Labels = JSON.parse(ChartData[i][0].META_DATA).yyyyMMdd
      // AverageData1 += Object.keys(JSON.parse(ChartData[i][j]['UTL_RAW.CAST_TO_VARCHAR2(MODEL_RESULT)'])).length

      // if (ChartData[i][j] == undefined) {
      //     break;
      // }

      // var human_result = JSON.parse(ChartData[i][j]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
      // if (typeof human_result == 'string') {
      //     human_result = JSON.parse(human_result)
      // }

      // for (let k = 0; k < Object.keys(human_result).length; k++) {
      //     if (human_result[k] !== "0" && human_result[k] !== 0) {
      //         AverageData2 += 1
      //     }
      // }
//    }
    // ShowLabels.push(Labels);
    // Labels = 0;

    // ShowData1.push(AverageData1)
    // AverageData1 = 0;
  //   ShowData2.push(AverageData2);
  //   AverageData2 = 0;
  // }



  ImageListPaging(ListData, 0);
  // ImageListLoad(0);
  AddMarkers();
  MakeChart();

  ShowLabels = [];
  ShowData1 = [];
  ShowData2 = [];

};

YesterdayData = (e) => {
  clickedBtn(e, "Mini_DateBtns");
  console.log("어제");
  RemoveDataWrapper();

  var Yesterday = getYesterday();



  var Year = Yesterday.toString().substring(0, 4);
  var Month = Yesterday.toString().substring(4, 6);
  var Day = Yesterday.toString().substring(6, 8);

  var Today = getToday();

  var tdYear = Today.toString().substring(0, 4);
  var tdMonth = Today.toString().substring(4, 6);
  var tdDay = Today.toString().substring(6, 8);

  getStrToday = tdYear + "-" + tdMonth + "-" + tdDay;
  getStrYesterday = Year + "-" + Month + "-" + Day;

  console.log("어제 날짜 -> ", getStrYesterday);

  var PeriodStart = document.getElementById("PeriodStart");
  var PeriodEnd = document.getElementById("PeriodEnd");

  PeriodStart.value = getStrYesterday;
  PeriodEnd.value = getStrToday;

  for (let i = 0; i < ChartData.length; i++) {
    for (let j = 0; j < ChartData[i].length; j++) {
      // console.log(ChartData2[i][0].yyyyMMdd)
      // console.log(Yesterday)
      
      if (ChartData2[i][0].yyyyMMdd == Yesterday) {
        ShowLabels.push(ChartData2[i][j].HHmmssSSS);
        ShowData2.push(ChartData2[i][j].PTH_CNT);

        select_index = ChartData.length - 1 - i;
        console.log("console.log(select_index) => ", select_index);
      } else {
        select_index = '';
      }




      if (JSON.parse(ChartData[i][0].META_DATA).yyyyMMdd == Yesterday) {
          console.log(Yesterday)
          console.log(ChartData[i][0])
          ShowLabels.push(JSON.parse(ChartData[i][j].META_DATA).HHmmssSSS)
          ShowData1.push(JSON.parse(ChartData[i][j]['UTL_RAW.CAST_TO_VARCHAR2(MODEL_RESULT)'].length))

          var human_result = JSON.parse(ChartData[i][j]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
          for (let k = 0; k < Object.keys(human_result).length; k++) {
              if (human_result[k] !== "0" && human_result[k] !== 0) {
                  AverageData2 += 1
              }
          }
          ShowData2.push(AverageData2)
          select_index = ChartData.length - 1 -i;
      } else {
          select_index = '';
          InnerHtml(ListBody, '')
      }
    }

  }



  console.log(select_index);

  if (ChartData[select_index] !== undefined) {
    select_array.push(ListData[select_index]);
  }

  ImageListPaging(select_array, 0);
  AddMarkers();


  ShowLabels = [];
  ShowData1 = [];
  ShowData2 = [];
  select_index = 0;
  select_array = [];
};



TodayData = (e) => {
  clickedBtn(e, "Mini_DateBtns");
  console.log("오늘");
  RemoveDataWrapper();

  var Today = getToday();

  var Year = Today.toString().substring(0, 4);
  var Month = Today.toString().substring(4, 6);
  var Day = Today.toString().substring(6, 8);
  var getStrToday = Year + "-" + Month + "-" + Day;
  console.log("오늘 날짜 -> ", getStrToday);
 
  
// get yesterday

  const today = new Date();
  const getTomorrow = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);

  var tomorrow = formatDate(getTomorrow);

  var PeriodStart = document.getElementById("PeriodStart");
  var PeriodEnd = document.getElementById("PeriodEnd");

  PeriodStart.value = getStrToday;
  PeriodEnd.value = tomorrow;

  for (let i = 0; i < ChartData.length; i++) {
    for (let j = 0; j < ChartData[i].length; j++) {
      if (ChartData2[i][0].yyyyMMdd == Today) {
        ShowLabels.push(ChartData2[i][j].HHmmssSSS);
        ShowData2.push(ChartData2[i][j].PTH_CNT);

        select_index = ChartData.length - 1 - i;
      } else {
        select_index = "";
      }
      if (JSON.parse(ChartData[i][0].META_DATA).yyyyMMdd == Today) {
          var HHmmssSSS = JSON.parse(ChartData[i][j].META_DATA).HHmmssSSS
          ShowLabels.push(HHmmssSSS.substring(0,2) + ':' + HHmmssSSS.substring(2,4) + ':' + HHmmssSSS.substring(4,6) + ':' + HHmmssSSS.substring(6,9));
          ShowData1.push(JSON.parse(ChartData[i][j]['UTL_RAW.CAST_TO_VARCHAR2(MODEL_RESULT)'].length));

          var human_result = JSON.parse(ChartData[i][j]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
          for (let k = 0; k < Object.keys(human_result).length; k++) {
              if (human_result[k] !== "0" && human_result[k] !== 0) {
                  AverageData2 += 1
              }
          }
          ShowData2.push(AverageData2)

          select_index = ChartData.length - 1 -i;
      } else {
          select_index = '';
          InnerHtml(ListBody, '')
      }
    }
  }
  if (ChartData[select_index] !== undefined) {
    select_array.push(ListData[select_index]);
  }

  ImageListPaging(select_array, 0);
  AddMarkers();
  MakeChart();

  ShowLabels = [];
  ShowData1 = [];
  ShowData2 = [];
  select_index = 0;
  select_array = [];
};


ThisWeekData = (e) => {
  clickedBtn(e, "Mini_DateBtns");
  console.log("이번주");
  RemoveDataWrapper();

  var Today = getToday().toString();

  var tdYear = Today.substring(0, 4);
  var tdMonth = Today.substring(4, 6);
  var tdDay = Today.substring(6, 8);
  getStrToday = tdYear + "-" + tdMonth + "-" + tdDay;

  var ThisWeek = getThisWeek();
  var Year = ThisWeek.toString().substring(0, 4);
  var Month = ThisWeek.toString().substring(4, 6);
  var Day = ThisWeek.toString().substring(6, 8);

  var TWYear = Year;
  var TWMonth = Month;
  var TWDay = Day;

  var Week = Year + Month + Day;

  var getWeek = Year + "-" + Month + "-" + Day;

  var PeriodStart = document.getElementById("PeriodStart");
  var PeriodEnd = document.getElementById("PeriodEnd");

  PeriodStart.value = getWeek;
  PeriodEnd.value = getStrToday;

  Labels = 0;
  AverageData = 0;

  console.log("ChartData => ", ChartData);

  for (let i = 0; i < 7; i++) {
    Week = Year + Month  + Day;
    console.log("주간 날짜 -> ", Week);

    for (let j = 0; j < ChartData.length; j++) {
      if (ChartData2[j][0].yyyyMMdd == Week) {
        console.log("맞음 !!");
        date.push(ChartData[j]);

        for (var k in ChartData[j]) {
          AverageData2 += ChartData2[j][k].PTH_CNT;
        }

        // ShowData1.push(AverageData1)
        // AverageData1 = 0;
        ShowData2.push(AverageData2);
        AverageData2 = 0;
      }
      if (JSON.parse(ChartData[j][0].META_DATA).yyyyMMdd == Week) {
          console.log('맞음 !!')
          date.push(ChartData[j])

          for (var k in ChartData[j]) {
              // y축 값
              var model_result = JSON.parse(ChartData[j][k]['UTL_RAW.CAST_TO_VARCHAR2(MODEL_RESULT)'])
              if (typeof model_result == 'string') {
                  model_result = JSON.parse(model_result)
              }
              AverageData1 += Object.keys(model_result).length

              var human_result = JSON.parse(ChartData[j][k]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
              if (typeof human_result == 'string') {
                  human_result = JSON.parse(human_result)
              }
              for (let l = 0; l < Object.keys(human_result).length; l++) {
                  if (human_result[l] !== "0" && human_result[l] !== 0) {
                      AverageData2 += 1
                  }
              }
          }

          ShowData1.push(AverageData1)
          AverageData1 = 0;
          ShowData2.push(AverageData2)
          AverageData2 = 0;
      }
    }

    var tempDate = DateFilter(Year, Month, Day);
    Year = tempDate.y;
    Month = tempDate.m;
    Day = tempDate.d;
  }
  console.log(date);

  date.filter((element) => {
    ShowLabels.push(JSON.parse(element[0]["META_DATA"]).yyyyMMdd);
  });

  console.log("S =====================================>", ShowLabels);

  for (var i in date) {
    date[i].sort((a, b) => {
      return (
        JSON.parse(b.META_DATA).HHmmssSSS - JSON.parse(a.META_DATA).HHmmssSSS
      );
    });
  }

  date.sort((a, b) => {
    return (
      JSON.parse(b[0].META_DATA).yyyyMMdd - JSON.parse(a[0].META_DATA).yyyyMMdd
    );
  });

  console.log("r => ", date);

  ImageListPaging(date, 0);
  AddMarkers();
  MakeChart();

  ShowLabels = [];
  ShowData1 = [];
  ShowData2 = [];
  date = [];
};

ThisMonthData = (e) => {




  AllData(e);
  clickedBtn(e, "Mini_DateBtns");
  console.log("이번달");
  RemoveDataWrapper();

  console.log("month: " + getThisMonth());

  var Today = getToday();
  var ThisMonth = getThisMonth();
  var strMonth = ThisMonth.toString().substring(0, 6);

  // var Year = ThisMonth.toString().substring(0,4);
  // var Month = ThisMonth.toString().substring(4,6);
  // var Day = ThisMonth.toString().substring(6,8);
  // var getStrThisMonth = Year + '-' + Month + '-' + Day;

  const thisMonth = new Date();
  thisMonth.setDate(1);

  var nextMonth = new Date(thisMonth);

  if (thisMonth.getMonth() == 11) {
    nextMonth = new Date(thisMonth.getFullYear() + 1, 0, 1);
  } else {
    nextMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 1);
  }

  var date_from = formatDate(thisMonth);
  var date_to = formatDate(nextMonth);

  console.log("C_IMG_CHART_TODAY_DATA_RANGE", date_from, date_to);

  var PeriodStart = document.getElementById("PeriodStart");
  var PeriodEnd = document.getElementById("PeriodEnd");

  PeriodStart.value = date_from;
  PeriodEnd.value = date_to;

  for (let i = 0; i < ChartData.length; i++) {
    if (ChartData2[i][0].yyyyMMdd.substring(0, 6) == strMonth) {
      console.log("맞음 !!");
      date.push(ChartData[i]);

      for (var j in ChartData[i]) {
        AverageData2 += ChartData2[i][j].PTH_CNT;
      }

      ShowData2.push(AverageData2);
      AverageData2 = 0;

      if (JSON.parse(ChartData[i][0].META_DATA).yyyyMMdd == Today) {
        console.log("w=t");
        break;
      }
    }
  }




  console.log(date);

  date.filter((element) => {
    ShowLabels.push(JSON.parse(element[0].META_DATA).yyyyMMdd);
  });

  for (var i in date) {
    date[i].sort((a, b) => {
      return (
        JSON.parse(b.META_DATA).HHmmssSSS - JSON.parse(a.META_DATA).HHmmssSSS
      );
    });
  }

  date.sort((a, b) => {
    return (
      JSON.parse(b[0].META_DATA).yyyyMMdd - JSON.parse(a[0].META_DATA).yyyyMMdd
    );
  });

  console.log("r => ", date);

  ImageListPaging(date, 0);
  AddMarkers();
  MakeChart();

  ShowLabels = [];
  ShowData1 = [];
  ShowData2 = [];
  date = [];
};





function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}














ThisPeriod = (e) => {
  var btn_Period = document.getElementById("btn_Period");
  var PeriodStart = document.getElementById("PeriodStart");
  var PeriodEnd = document.getElementById("PeriodEnd");

  clickedBtn(btn_Period, "Mini_DateBtns");
  console.log("기간 지정");
  RemoveDataWrapper();

  if (PeriodStart == null || PeriodStart == null) {
    alert("기간을 지정해주세요.");

    var e = document.getElementById("btn_All");
    AllData(e);
    return;
  } else {
    var Start = PeriodStart.value;
    var End = PeriodEnd.value;
  }

  var sdt = new Date(Start);
  var edt = new Date(End);
  var dateDiff =
    Math.ceil((edt.getTime() - sdt.getTime()) / (1000 * 3600 * 24)) + 1;

  var StartYear = Start.slice(0, 4);
  var StartMonth = Start.slice(5, 7);
  var StartDay = Start.slice(8, 10);

  Start = StartYear + StartMonth + StartDay;
  End = End.slice(0, 4) + End.slice(5, 7) + End.slice(8, 10);

  if (Number(Start) > Number(End)) {
    alert("기간 시작 날짜가 기간 끝 날짜보다 작아야 합니다.");
    return;
  }

  for (let i = 0; i < dateDiff; i++) {
    
    Start = StartYear  + StartMonth  + StartDay;
    console.log("Start =>", Start);

    for (let j = 0; j < ChartData.length; j++) {

      console.log( "ChartData2 " , ChartData2[j][0])

      if (ChartData2[j][0].yyyyMMdd == Start) {
        console.log("맞음 !!");
        date.push(ChartData[j]);

        for (var k in ChartData[j]) {
          AverageData2 += ChartData2[j][k].PTH_CNT;
        }

        ShowData2.push(AverageData2);
        AverageData2 = 0;
      }
    }
    var temp = DateFilter(StartYear, StartMonth, StartDay);
    StartYear = temp.y;
    StartMonth = temp.m;
    StartDay = temp.d;
  }
  
  console.log(date);

  date.filter((element) => {
    ShowLabels.push(JSON.parse(element[0]["META_DATA"]).yyyyMMdd);
  });

  for (var i in date) {
    date[i].sort((a, b) => {
      return (
        JSON.parse(b.META_DATA).HHmmssSSS - JSON.parse(a.META_DATA).HHmmssSSS
      );
    });
  }

  date.sort((a, b) => {
    return (
      JSON.parse(b[0].META_DATA).yyyyMMdd - JSON.parse(a[0].META_DATA).yyyyMMdd
    );
  });

  console.log("r => ", date);

  ImageListPaging(date, 0);
  AddMarkers();
  MakeChart();

  ShowLabels = [];
  ShowData1 = [];
  ShowData2 = [];
  date = [];
};

//
// List
//
var list_pictemp = [];
var list_recttemp = [];
var Paging_list = [];
var Paging_rect = [];
var LastCount = 0;





ImageListPaging = (data, I) => {
  console.log("imgdata => ", data);

  var Count = 1;
  var tr_Count = 0;
  var temp = [];
  var temp2 = [];

  if (data.length == 0) {
    console.log("data가 비었습니다.");
    ListBody.style.width = "83.85042vw";
    ListBody.style.maxWidth = "1610px";
    ListBody.style.height = "51.8519vh";
    ListBody.style.maxHeight = "560px";
    ListHtml +=
      "<tr>" +
      '<td style="font-size: 1.0417vw;">해당하는 날짜의 데이터가 존재하지 않습니다.</td>' +
      "</tr>";

    InnerHtml(ListBody, ListHtml);
    ListHtml = "";
  } else {
    Paging_list = [];
    Paging_rect = [];

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        if (data[i][j] == undefined) {
          break;
        }

        var Device = JSON.parse(data[i][j].META_DATA).MAC;
        DeviceValues.find((element) => {
          if (Device == element.split("(")[1].split(")")[0]) {
            Device = element;
          }
        });

        var date = JSON.parse(data[i][j].META_DATA).yyyyMMdd.toString();
        var Time = JSON.parse(data[i][j].META_DATA).HHmmssSSS;
        var human_result = JSON.parse(
          data[i][j]["UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)"]
        );
        if (typeof human_result == "string") {
          human_result = JSON.parse(human_result);
        }

        list_pictemp.push({
          Count: Count,
          tr_Count: tr_Count,
          marker: marker.push(
            new google.maps.Marker({
              position: {
                lat: Number(JSON.parse(data[i][j].META_DATA).latitude),
                lng: Number(JSON.parse(data[i][j].META_DATA).longitude)
              },
              map,
              title:
                JSON.parse(data[i][0].META_DATA).yyyyMMdd +
                " / " +
                JSON.parse(data[i][j].META_DATA).HHmmssSSS,
              icon: iconPink
            })
          ),
          Adress: JSON.parse(data[i][j].META_DATA).address,
          date:
            date.substring(0, 4) +
            "-" +
            date.substring(4, 6) +
            "-" +
            date.substring(6, 8),
          Time:
            Time.substring(0, 2) +
            ":" +
            Time.substring(2, 4) +
            ":" +
            Time.substring(4, 6) +
            ":" +
            Time.substring(6, 9),
          Device: Device,
          Src: "http://165.246.196.154:3001/downloads/" + data[i][j].FILE_PATH,
          human_result: human_result,
          id: data[i][j].ID
        });

        temp = data[i][j].META_RECT_LIST.split("#");

        for (var k in temp) {
          temp2.push(JSON.parse(temp[k]));
        }

        temp2.sort((a, b) => {
          var x1 = a["pothole-x"];
          var y1 = a["pothole-y"];
          var x2 = b["pothole-x"];
          var y2 = b["pothole-y"];

          if (y1 == y2) {
            return x1 - x2;
          } else {
            return y1 - y2;
          }
        });

        list_recttemp.push(temp2);
        temp2 = [];

        if (Count % 30 == 0) {
          Paging_list.push(list_pictemp);
          Paging_rect.push(list_recttemp);
          list_pictemp = [];
          list_recttemp = [];
        }

        Count += 1;
        tr_Count += 1;
      }

      if (i == data.length - 1 && list_pictemp.length !== 0) {
        Paging_list.push(list_pictemp);
        Paging_rect.push(list_recttemp);
        list_pictemp = [];
        list_recttemp = [];
        LastCount = Count;
      }
    }

    console.log("Count: " + Count);
    console.log("LastCount: " + LastCount);

    ImageListLoad(I);
  }
};

ImageListLoad = (I) => {
  for (let i = 0; i < Paging_list[I].length; i++) {
    maker = Paging_list[I][i].Marker;

    var Adress = Paging_list[I][i].Adress;
    var date = Paging_list[I][i].date;
    var strTime = Paging_list[I][i].Time;
    var Device = Paging_list[I][i].Device;
    var Src = Paging_list[I][i].Src;
    var id = Paging_list[I][i].id;
    // console.log(Paging_list[I][i])

    ListHtml +=
      '<tr id="tr_' +
      Paging_list[I][i].tr_Count +
      '" onclick="LookUp(this)" onmouseover="Mouseover(this)" onmouseout="Mouseout()">' +
      '<td style="width: 5%;">' +
      "<p>" +
      (LastCount - Paging_list[I][i].Count) +
      "</p>" +
      "</td>" +
      '<td style="width: 25%;">' +
      "<p>" +
      Adress +
      "</p>" +
      "</td>" +
      '<td style="width: 20%;">' +
      "<p>" +
      date +
      "<br/>" +
      strTime +
      "</p>" +
      "</td>" +
      '<td style="width: 20%;">' +
      "<p>" +
      Device +
      "</p>" +
      "</td>" +
      '<td style="width: 15%;">' +
      '<div class="imgWrapper">' +
      '<img src="' +
      Src +
      '" id="img_' +
      tr_Count +
      '"/>' +
      '<canvas id="canvas_' +
      i +
      '" class="picCanvas" width="1920" height="1080" ondblclick="puImg(this, ' +
      I +
      "," +
      i +
      ')"></canvas>' +
      "</div>" +
      "</td>" +
      '<td style=" width: 25%; height:100%;justify-content:center; align-items:center;"><button style="background-color:transparent;border: 0px solid black;justify-content:center;align-items:center" onclick="deleteHandler(' +
      id +
      ')">' +
      "<img width='50px' height='50px' style='width:30px;height:30px;margin-left:10px;' src='../img/icon/trashcan.png'/>";
    "</button></td>" + "</tr>";
  }

  // Default
  InnerHtml(ListBody, ListHtml);
  InnerHtml(TxtCurrentListPage, CountListPage(I + 1));
  InnerHtml(TxtTotalListPage, Paging_list.length);
  drawCanvas_GB(
    Paging_rect,
    I,
    Paging_list,
    "29.6296vh",
    "320px",
    "18.5185vh",
    "180px"
  );

  ListHtml = "";
};

//deleteHandler

deleteHandler = (id) => {
  if (confirm("삭제하시겠습니까?")) {
    var deletePothole_url = {
      url: "http://165.246.196.154:3002/app/deletePothole?pothole_id=" + id,
      method: "GET"
    };
    $.ajax(deletePothole_url).done(function (response) {
      if (response.isSuccess) {
        console.log(response);
        console.log(id);
        alert("삭제가 완료되었습니다.");
      } else {
        alert("삭제과정에서 오류가 발생했습니다.");
      }
    });
  } else {
    return 2;
  }
};
// Counting Page
CountListPage = (num) => {
  var ListCurrentNum = '<span onclick="ChangeListPage()">' + num + "</span>";
  return ListCurrentNum;
};

// Paging
ListPagingLeft = () => {
  $("#ListBodyWrapper").scrollTop(0);

  if (ListIndex !== 0) {
    ListIndex -= 1;
    while (ListBody.hasChildNodes()) {
      ListBody.removeChild(ListBody.firstChild);
    }
  }
  ImageListLoad(ListIndex);
};

ListPagingRight = () => {
  $("#ListBodyWrapper").scrollTop(0);

  if (ListIndex < Paging_list.length - 1) {
    ListIndex += 1;
  }

  ImageListLoad(ListIndex);
};

ListPagingMove = () => {
  var InputCurrentListPage = document.querySelector("#InputCurrentListPage");

  ListIndex = InputCurrentListPage.value - 1;
  ImageListLoad(ListIndex);
};

ChangeListPage = () => {
  var input =
    '<input type="text" id="InputCurrentListPage" onchange="ListPagingMove()"></input>';
  InnerHtml(TxtCurrentListPage, input);
};

ListPageInnerHtml = (LI) => {
  InnerHtml(ListBody, ListPaging[LI]);
  InnerHtml(TxtCurrentListPage, CountListPage(LI + 1));
};

var PastClick = "";
var PastOver = "";
var Num = "";
var PastNum = "";

// LookUp
LookUp = (e) => {
  e.style.backgroundColor = "#93A5CF";

  if (PastClick.style !== undefined && PastClick !== e) {
    PastClick.style.backgroundColor = "#F8F9FA";
  }

  PastClick = e;

  Num = e.id.split("_")[1];

  if (PastNum !== "") {
    marker[PastNum].icon = iconPink;
    marker[PastNum].setMap(null);
    marker[PastNum].setMap(map);
  }

  marker[Num].icon = iconBlue;
  marker[Num].setMap(null);
  marker[Num].setMap(map);

  PastNum = Num;
};

// Mouseover
Mouseover = (e) => {
  if (e !== PastClick) {
    e.style.backgroundColor = "#ECECEC";
  }

  PastOver = e;
};

// Mouseout
Mouseout = () => {
  if (PastOver !== PastClick) {
    PastOver.style.backgroundColor = "#FFFFFF";
  }
};

// 이미지 팝업
var modal = document.getElementById("modal");
var modalInside = document.getElementById("modalInside");

puImg = (e, I, i) => {
  index = i;
  pageIndex = I;
  var list_index = e.id.split("_")[1]; // 사실상 i 와 동일하여 왜 존재하는지 모르겠음
  // var modalHtml =
  //   '<div class="flex_mid" style="width:148.1481vh;background-color:white">' +
  //   '<img id="modalimg" src="' +
  //   Paging_list[I][i].Src +
  //   '">' +
  //   '<canvas id="modalcanvas" width="1920px" height="1080px" style="position:absolute;"></canvas>' +
  //   '<div style="position:absolute;width:50px;height:50px;border-radius:25px;background-color:white;top:20px;right:20px;line-height:50px;text-align:center;" onclick="CloseModal()">닫기</div>' +
  //   "</div>" +
  //   console.log(modalHtml);
  // InnerHtml(modalInside, modalHtml);
  document.getElementById("modalimg").src = Paging_list[I][i].Src;
  modal.style.display = "";

  var canvas = document.getElementById("modalcanvas");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.lineWidth = 10;

  var RD = Paging_rect[I][list_index];
  var HUMAN_RESULT = Paging_list[I][list_index].human_result;
  console.log(HUMAN_RESULT);

  for (let j = 0; j < Object.keys(HUMAN_RESULT).length; j++) {
    if (HUMAN_RESULT[j] == "0" && HUMAN_RESULT[j] == 0) {
      // if (RD[i][j] == undefined) {
      // } else {
      //     ctx.strokeStyle = 'red';
      //     ctx.strokeRect(RD[i][j]['pothole-x'], RD[i][j]['pothole-y'], RD[i][j]['pothole-width'], RD[i][j]['pothole-height']);
      // }
    } else if (HUMAN_RESULT[j] == "1" && HUMAN_RESULT[j] == 1) {
      if (RD[j] == undefined) {
      } else {
        ctx.strokeStyle = "green";
        ctx.strokeRect(
          RD[j]["pothole-x"],
          RD[j]["pothole-y"],
          RD[j]["pothole-width"],
          RD[j]["pothole-height"]
        );
      }
    } else {
      ctx.strokeStyle = "blue";
      // var x = (HUMAN_RESULT[j]['pothole-x']) * (1920 / temp[i].width);
      // var y = (HUMAN_RESULT[j]['pothole-y']) * (1080 / temp[i].height);
      // var w = (HUMAN_RESULT[j]['pothole-width']) * (1920 / temp[i].width);
      // var h = (HUMAN_RESULT[j]['pothole-height']) * (1080 / temp[i].height);
      var x = HUMAN_RESULT[j]["pothole-x"];
      var y = HUMAN_RESULT[j]["pothole-y"];
      var w = HUMAN_RESULT[j]["pothole-width"];
      var h = HUMAN_RESULT[j]["pothole-height"];
      ctx.strokeRect(x, y, w, h);
    }
  }

  canvas.style.width = "148.1481vh";
  canvas.style.maxWidth = "1600px";
  canvas.style.height = "83.3333vh";
  canvas.style.maxHeight = "900px";
};
document.addEventListener("keydown", (event) => {
  console.log(event);
  if (event.key === "ArrowLeft") {
    if (index === 0) {
      alert("첫번째 사진입니다.");
    } else {
      index = index - 1;
    }
    document.getElementById("modalimg").src = Paging_list[pageIndex][index].Src;

    var canvas = document.getElementById("modalcanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.lineWidth = 10;

    var RD = Paging_rect[pageIndex][index];
    var HUMAN_RESULT = Paging_list[pageIndex][index].human_result;
    console.log(HUMAN_RESULT);

    for (let j = 0; j < Object.keys(HUMAN_RESULT).length; j++) {
      if (HUMAN_RESULT[j] == "0" && HUMAN_RESULT[j] == 0) {
        // if (RD[i][j] == undefined) {
        // } else {
        //     ctx.strokeStyle = 'red';
        //     ctx.strokeRect(RD[i][j]['pothole-x'], RD[i][j]['pothole-y'], RD[i][j]['pothole-width'], RD[i][j]['pothole-height']);
        // }
      } else if (HUMAN_RESULT[j] == "1" && HUMAN_RESULT[j] == 1) {
        if (RD[j] == undefined) {
        } else {
          ctx.strokeStyle = "green";
          ctx.strokeRect(
            RD[j]["pothole-x"],
            RD[j]["pothole-y"],
            RD[j]["pothole-width"],
            RD[j]["pothole-height"]
          );
        }
      } else {
        ctx.strokeStyle = "blue";
        // var x = (HUMAN_RESULT[j]['pothole-x']) * (1920 / temp[i].width);
        // var y = (HUMAN_RESULT[j]['pothole-y']) * (1080 / temp[i].height);
        // var w = (HUMAN_RESULT[j]['pothole-width']) * (1920 / temp[i].width);
        // var h = (HUMAN_RESULT[j]['pothole-height']) * (1080 / temp[i].height);
        var x = HUMAN_RESULT[j]["pothole-x"];
        var y = HUMAN_RESULT[j]["pothole-y"];
        var w = HUMAN_RESULT[j]["pothole-width"];
        var h = HUMAN_RESULT[j]["pothole-height"];
        ctx.strokeRect(x, y, w, h);
      }
    }

    canvas.style.width = "148.1481vh";
    canvas.style.maxWidth = "1600px";
    canvas.style.height = "83.3333vh";
    canvas.style.maxHeight = "900px";
  }
});
document.getElementById("backBtn").addEventListener("click", () => {
  if (index === 0) {
    alert("첫번째 사진입니다.");
  } else {
    index = index - 1;
  }
  document.getElementById("modalimg").src = Paging_list[pageIndex][index].Src;

  var canvas = document.getElementById("modalcanvas");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.lineWidth = 10;

  var RD = Paging_rect[pageIndex][index];
  var HUMAN_RESULT = Paging_list[pageIndex][index].human_result;
  console.log(HUMAN_RESULT);

  for (let j = 0; j < Object.keys(HUMAN_RESULT).length; j++) {
    if (HUMAN_RESULT[j] == "0" && HUMAN_RESULT[j] == 0) {
      // if (RD[i][j] == undefined) {
      // } else {
      //     ctx.strokeStyle = 'red';
      //     ctx.strokeRect(RD[i][j]['pothole-x'], RD[i][j]['pothole-y'], RD[i][j]['pothole-width'], RD[i][j]['pothole-height']);
      // }
    } else if (HUMAN_RESULT[j] == "1" && HUMAN_RESULT[j] == 1) {
      if (RD[j] == undefined) {
      } else {
        ctx.strokeStyle = "green";
        ctx.strokeRect(
          RD[j]["pothole-x"],
          RD[j]["pothole-y"],
          RD[j]["pothole-width"],
          RD[j]["pothole-height"]
        );
      }
    } else {
      ctx.strokeStyle = "blue";
      // var x = (HUMAN_RESULT[j]['pothole-x']) * (1920 / temp[i].width);
      // var y = (HUMAN_RESULT[j]['pothole-y']) * (1080 / temp[i].height);
      // var w = (HUMAN_RESULT[j]['pothole-width']) * (1920 / temp[i].width);
      // var h = (HUMAN_RESULT[j]['pothole-height']) * (1080 / temp[i].height);
      var x = HUMAN_RESULT[j]["pothole-x"];
      var y = HUMAN_RESULT[j]["pothole-y"];
      var w = HUMAN_RESULT[j]["pothole-width"];
      var h = HUMAN_RESULT[j]["pothole-height"];
      ctx.strokeRect(x, y, w, h);
    }
  }

  canvas.style.width = "148.1481vh";
  canvas.style.maxWidth = "1600px";
  canvas.style.height = "83.3333vh";
  canvas.style.maxHeight = "900px";
});
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    if (Paging_list[pageIndex].length - 1 == index) {
      alert("마지막 사진입니다.")
    } else {
      index = index + 1;
      document.getElementById("modalimg").src =
        Paging_list[pageIndex][index].Src;

      var canvas = document.getElementById("modalcanvas");
      var ctx = canvas.getContext("2d");

      ctx.beginPath();
      ctx.lineWidth = 10;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var RD = Paging_rect[pageIndex][index];
      var HUMAN_RESULT = Paging_list[pageIndex][index].human_result;
      console.log(HUMAN_RESULT);

      for (let j = 0; j < Object.keys(HUMAN_RESULT).length; j++) {
        if (HUMAN_RESULT[j] == "0" && HUMAN_RESULT[j] == 0) {
          // if (RD[i][j] == undefined) {
          // } else {
          //     ctx.strokeStyle = 'red';
          //     ctx.strokeRect(RD[i][j]['pothole-x'], RD[i][j]['pothole-y'], RD[i][j]['pothole-width'], RD[i][j]['pothole-height']);
          // }
        } else if (HUMAN_RESULT[j] == "1" && HUMAN_RESULT[j] == 1) {
          if (RD[j] == undefined) {
          } else {
            ctx.strokeStyle = "green";
            ctx.strokeRect(
              RD[j]["pothole-x"],
              RD[j]["pothole-y"],
              RD[j]["pothole-width"],
              RD[j]["pothole-height"]
            );
          }
        } else {
          ctx.strokeStyle = "blue";
          // var x = (HUMAN_RESULT[j]['pothole-x']) * (1920 / temp[i].width);
          // var y = (HUMAN_RESULT[j]['pothole-y']) * (1080 / temp[i].height);
          // var w = (HUMAN_RESULT[j]['pothole-width']) * (1920 / temp[i].width);
          // var h = (HUMAN_RESULT[j]['pothole-height']) * (1080 / temp[i].height);
          var x = HUMAN_RESULT[j]["pothole-x"];
          var y = HUMAN_RESULT[j]["pothole-y"];
          var w = HUMAN_RESULT[j]["pothole-width"];
          var h = HUMAN_RESULT[j]["pothole-height"];
          ctx.strokeRect(x, y, w, h);
        }
      }

      canvas.style.width = "148.1481vh";
      canvas.style.maxWidth = "1600px";
      canvas.style.height = "83.3333vh";
      canvas.style.maxHeight = "900px";
    }
  }
});
document.getElementById("nextBtn").addEventListener("click", () => {
  if (Paging_list[pageIndex].length - 1 == index) {
    alert("마지막 사진입니다.")
  } else {
    index = index + 1;
    document.getElementById("modalimg").src =
      Paging_list[pageIndex][index].Src;

    var canvas = document.getElementById("modalcanvas");
    var ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var RD = Paging_rect[pageIndex][index];
    var HUMAN_RESULT = Paging_list[pageIndex][index].human_result;
    console.log(HUMAN_RESULT);

    for (let j = 0; j < Object.keys(HUMAN_RESULT).length; j++) {
      if (HUMAN_RESULT[j] == "0" && HUMAN_RESULT[j] == 0) {
        // if (RD[i][j] == undefined) {
        // } else {
        //     ctx.strokeStyle = 'red';
        //     ctx.strokeRect(RD[i][j]['pothole-x'], RD[i][j]['pothole-y'], RD[i][j]['pothole-width'], RD[i][j]['pothole-height']);
        // }
      } else if (HUMAN_RESULT[j] == "1" && HUMAN_RESULT[j] == 1) {
        if (RD[j] == undefined) {
        } else {
          ctx.strokeStyle = "green";
          ctx.strokeRect(
            RD[j]["pothole-x"],
            RD[j]["pothole-y"],
            RD[j]["pothole-width"],
            RD[j]["pothole-height"]
          );
        }
      } else {
        ctx.strokeStyle = "blue";
        // var x = (HUMAN_RESULT[j]['pothole-x']) * (1920 / temp[i].width);
        // var y = (HUMAN_RESULT[j]['pothole-y']) * (1080 / temp[i].height);
        // var w = (HUMAN_RESULT[j]['pothole-width']) * (1920 / temp[i].width);
        // var h = (HUMAN_RESULT[j]['pothole-height']) * (1080 / temp[i].height);
        var x = HUMAN_RESULT[j]["pothole-x"];
        var y = HUMAN_RESULT[j]["pothole-y"];
        var w = HUMAN_RESULT[j]["pothole-width"];
        var h = HUMAN_RESULT[j]["pothole-height"];
        ctx.strokeRect(x, y, w, h);
      }
    }

    canvas.style.width = "148.1481vh";
    canvas.style.maxWidth = "1600px";
    canvas.style.height = "83.3333vh";
    canvas.style.maxHeight = "900px";
  }
});
CloseModal = () => {
  modal.style.display = "none";
};

document.onkeydown = (e) => {
  console.log(e);
  if (e.which == 27) {
    CloseModal();
  }
};

//
// 실행
//



SideBar();
clickedServer();
