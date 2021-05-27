var result = [];
var PicData = [];
var RectData = [];

var Pictures = document.querySelector('#V_Pictures');
var TxtCurrentPage = document.querySelector('#TxtCurrentPage');
var TxtTotalPage = document.querySelector('#TxtTotalPage');

var Paging_pic = [];
var Paging_rect = [];
var pictemp = [];
var recttemp = [];

var picCount = 1;
var rectCount = 1;
var Index = 0;

var settings_contain_image = {
    "url": "http://165.246.196.154:3001/app/dashboard/contain-image?date_from=2020-01-01&date_to=2022-01-01&seq_id=100&count=5000&human_checked=1",
    "method": "GET",
    "timeout": 0,
};

$.ajax(settings_contain_image).done(function (response) {
    if(response.isSuccess){
        console.log("settings_contain_image success", response);
        result = response.result; 

        arrayReverseDateValue(result)
        arrayReverseDateData(result, PicData)
        arrayRectData(PicData, RectData);
        arrayPaging(PicData, RectData);

        var e = document.getElementById('btn_All')
        AllData(e);
    } else {
        console.log("settings_contain_image failed", response);
    }
});

// 사진 로딩
arrayPaging = (picdata, rectdata) => {
    console.log('picdata => ', picdata)
    console.log('rectdata => ', rectdata)
    console.log(JSON.parse(picdata[0][0].META_DATA).HHmmssSSS)
    for (let i = 0; i < picdata.length; i++) {
        for (let j = 0; j < picdata[i].length; j++){

            pictemp.push({ 
                ondblclick : 'DetailViewer(this)', 
                src: 'http://165.246.196.154:3001/downloads/' + picdata[i][j].FILE_PATH, 
                name : picdata[i][j].FILE_PATH, 
                id: 'img_' + (picCount-1),
                mac :JSON.parse(picdata[i][j].META_DATA).MAC, 
                date : JSON.parse(picdata[i][j].META_DATA).yyyyMMdd,
                address : JSON.parse(picdata[i][j].META_DATA).address,
                time : JSON.parse(picdata[i][j].META_DATA).HHmmssSSS
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
            var img = document.createElement("img");
            console.log(Paging_pic[I][j])
            SetAttribute(img, 'id', Paging_pic[I][j].id)
            SetAttribute(img, 'class', 'LoadImg')
            SetAttribute(img, 'src', Paging_pic[I][j].src)
            SetAttribute(img, 'name', Paging_pic[I][j].name)
            SetAttribute(img, 'ondblclick', Paging_pic[I][j].ondblclick)
            SetAttribute(img, 'mac', Paging_pic[I][j].mac)
            SetAttribute(img, 'address', Paging_pic[I][j].address)
            SetAttribute(img, 'date', Paging_pic[I][j].date)
            SetAttribute(img, 'time', Paging_pic[I][j].time)
            Pictures.appendChild(img)
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
    $('#V_Pictures').scrollTop(0);

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
    $('#V_Pictures').scrollTop(0);

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


//
// 날짜
//


AllData = (e) => {
    clickedBtn(e, 'V_DateBtns');
    console.log('전체');
    console.log(Paging_pic)

    while (Pictures.hasChildNodes()) { 
        Pictures.removeChild(Pictures.firstChild); 
    }

    Paging_pic = [];
    Paging_rect = [];
    Index = 0

    arrayRectData(PicData, RectData);
    arrayPaging(PicData, RectData);

    LoadPictures(Index);
}



YesterdayData = (e) => {
    clickedBtn(e, 'V_DateBtns');
    console.log('어제');

    while (Pictures.hasChildNodes()) { 
        Pictures.removeChild(Pictures.firstChild); 
    }

    var Yesterday = getYesterday();
    var Y_PicData = [];
    var Y_RectData = [];

    Paging_pic = [];
    Paging_rect = [];
    Index = 0

    PicData.find(element => {
        if(JSON.parse(element[0]['META_DATA']).yyyyMMdd == Yesterday) {
            Y_PicData.push(element)
        }
    })

    console.log('y=> ', Y_PicData)

    arrayRectData(Y_PicData, Y_RectData)
    arrayPaging(Y_PicData, Y_RectData)
    console.log(Paging_pic)
    console.log(Paging_rect)

    LoadPictures(Index)
}




TodayData = (e) => {
    clickedBtn(e, 'V_DateBtns');
    console.log('오늘');

    while (Pictures.hasChildNodes()) { 
        Pictures.removeChild(Pictures.firstChild); 
    }

    var Today = getToday();
    var T_PicData = [];
    var T_RectData = [];

    Paging_pic = [];
    Paging_rect = [];
    Index = 0

    PicData.find(element => {
        if(JSON.parse(element[0]['META_DATA']).yyyyMMdd == Today) {
            T_PicData.push(element)
        }
    })

    console.log('y=> ', T_PicData)

    arrayRectData(T_PicData, T_RectData)
    arrayPaging(T_PicData, T_RectData)
    console.log(Paging_pic)
    console.log(Paging_rect)

    LoadPictures(Index)
}



ThisWeekData = (e) => {
    clickedBtn(e, 'V_DateBtns');
    console.log('주');

    while (Pictures.hasChildNodes()) { 
        Pictures.removeChild(Pictures.firstChild); 
    }

    var ThisWeek = getThisWeek();
    var Year = ThisWeek.toString().substring(0,4);
    var Month = ThisWeek.toString().substring(4,6);
    var Day = ThisWeek.toString().substring(6,8);
    var Week = Year + Month + Day;

    var W_PicData = [];
    var W_RectData = [];

    Paging_pic = [];
    Paging_rect = [];
    Index = 0

    date_buffer = [] 

    for (let i = 0; i < 7; i ++) {


        Week = Year + Month + Day;

        date_buffer.push(Week)
    
        var tempDate = DateFilter(Year, Month, Day)
        
        Year = tempDate.y
        Month = tempDate.m
        Day = tempDate.d



        console.log("VIEWER - THIS WEEK DATA ", Week)

    
    }


    for(let i = 6 ; i >=0; i--){

        Week = date_buffer[i]

        PicData.find(element => {
            if(JSON.parse(element[0]['META_DATA']).yyyyMMdd == Week) {
                W_PicData.push(element)
            }
        })
        

    }



    console.log('y=> ', W_PicData)

    arrayRectData(W_PicData, W_RectData)
    arrayPaging(W_PicData, W_RectData)
    console.log(Paging_pic)
    console.log(Paging_rect)

    LoadPictures(Index)
}




ThisMonthData = (e) => {
    clickedBtn(e, 'V_DateBtns');
    console.log('월');

    while (Pictures.hasChildNodes()) { 
        Pictures.removeChild(Pictures.firstChild); 
    }

    var ThisMonth = getThisMonth();
    var strMonth = ThisMonth.toString().substring(0,6);

    var M_PicData = [];
    var M_RectData = [];

    Paging_pic = [];
    Paging_rect = [];
    Index = 0

    PicData.find(element => {

        console.log("VIEWER - MONTH DATA ELEMENT -> ",JSON.parse(element[0]['META_DATA']).yyyyMMdd.substring(0,6))
  
        if(JSON.parse(element[0]['META_DATA']).yyyyMMdd.substring(0,6) == strMonth) {
            M_PicData.push(element)
        }
    })



    console.log('y=> ', M_PicData)
    arrayRectData(M_PicData, M_RectData)
    arrayPaging(M_PicData, M_RectData)
    console.log(Paging_pic)
    console.log(Paging_rect)
    LoadPictures(Index)
}

ThisPeriod = (e) => {
    var btn_Period = document.getElementById('btn_Period')
    var PeriodStart = document.getElementById('PeriodStart')
    var PeriodEnd = document.getElementById('PeriodEnd')

    clickedBtn(btn_Period, 'V_DateBtns');
    console.log('기간');

    while (Pictures.hasChildNodes()) { 
        Pictures.removeChild(Pictures.firstChild); 
    }

    if (PeriodStart == null || PeriodEnd  == null) {
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

    var StartYear = Start.slice(0,4);
    var StartMonth = Start.slice(5,7);
    var StartDay = Start.slice(8,10);

    Start = StartYear + StartMonth + StartDay
    End = End.slice(0,4) + End.slice(5,7) + End.slice(8,10);

    var P_PicData = [];
    var P_RectData = [];

    Paging_pic = [];
    Paging_rect = [];
    Index = 0

    if (Number(Start) > Number(End)) {
        alert('기간 시작 날짜가 기간 끝 날짜보다 작아야 합니다.')
        return;
    }
    console.log("12")
    for (let i = 0; i < dateDiff; i++) {
        Start = StartYear + StartMonth + StartDay

        PicData.find(element => {
            if(JSON.parse(element[0]['META_DATA']).yyyyMMdd == Start) {
                P_PicData.push(element)
            }
        })
        
        var tempDate = DateFilter(StartYear, StartMonth, StartDay)
        StartYear = tempDate.y
        StartMonth = tempDate.m
        StartDay = tempDate.d
    }

    console.log('y=> ', P_PicData)

    arrayRectData(P_PicData, P_RectData)
    arrayPaging(P_PicData, P_RectData)
    console.log(Paging_pic)
    console.log(Paging_rect)
    console.log("!")
    LoadPictures(Index)
}

//
// 실행
//
SideBar();
clickedInspection();