var ListBody = document.querySelector('#P_ListBody');
var TxtCurrentListPage = document.querySelector('#TxtCurrentListPage');
var TxtTotalListPage = document.querySelector('#TxtTotalListPage');

var list_pictemp = [];
var list_recttemp = [];
var Paging_list = [];
var Paging_rect = [];
var Rect_Index = [];

var picCount = 1;
var rectCount = 1;
var ListIndex = 0;

var ListHtml = '';

arrayListPaging = (picdata, rectdata) => {
    for (let i = 0; i < picdata.length; i++) {
        for (let j = 0; j < picdata[i].length; j++) {
            list_pictemp.push({
                Adress : JSON.parse(picdata[i][j].META_DATA).address,
                date : JSON.parse(picdata[i][j].META_DATA).yyyyMMdd.toString(),
                Time : JSON.parse(picdata[i][j].META_DATA).HHmmssSSS,
                Device : JSON.parse(picdata[i][j].META_DATA).MAC,
                Src : 'http://165.246.196.154:3001/downloads/' + picdata[i][j].FILE_PATH,
                Name : picdata[i][j].FILE_PATH,
                Count : picCount
            })

            if (picCount % 30 == 0) {
                Paging_list.push(list_pictemp)
                list_pictemp = [];
            }
    
            picCount += 1
        }

        if (i == picdata.length-1 && list_pictemp.length !== 0) {
            Paging_list.push(list_pictemp)
            list_pictemp = [];
        }
    }
    picCount = 0;

    for (let i = 0; i < rectdata.length; i++) {
        recttemp.push(rectdata[i])
        if (rectCount % 300 == 0) {
            Paging_rect.push(recttemp);
            recttemp = [];
        }

        rectCount += 1

        if (i == rectdata.length-1 && list_recttemp.length !== 0) {
            Paging_rect.push(recttemp);
            recttemp = [];
        }
    }

    InnerHtml(TxtTotalPage, Paging_pic.length)
    InnerHtml(TxtCurrentPage, CountPage(1))
}

LoadPictureList = (I) => {
    var O = "1"
    var X = "0"
    var type = 1

    console.log(Paging_list)

    for (let i = 0; i < Paging_list[I].length; i++) {
        ListHtml +=
        '<tr>' +
            '<td style="width: 5%;">' +
                '<p>' + Paging_list[I][i].Count + '</p>' +
            '</td>' +
            '<td style="width: 20%;">' +
                '<p>' + Paging_list[I][i].Adress + '</p>' +
            '</td>' +
            '<td style="width: 15%;">' +
                '<p>'+ Paging_list[I][i].date + '&nbsp' + Paging_list[I][i].Time + '</p>' +
            '</td>' +
            '<td style="width: 20%;">' +
                '<p>' + Paging_list[I][i].Device + '</p>' +
            '</td>' +
            '<td style="width: 30%;">' +
                '<div class="flex_mid" style="width: 100%; position: relative; height: 9.3750vw; max-height: 180px;">' +
                    '<img class="roadimg" name="' + Paging_list[I][i].Name + '" src="'+ Paging_list[I][i].Src +'" id="img_' + Paging_list[I][i].Count + '"/>' +
                    '<canvas id="canvas'+ (Paging_list[I][i].Count-1) +'"></canvas>' +
                '</div>' +
            '</td>' +
            '<td style="width: 10%;">' +
                '<div class="ListBtnWrapper" onclick="Annotation(this,' + type + ')" onmouseover="Mouseover(this)" onmouseout="Mouseout(this)">정밀 검수</div>' +
                '<div style="display: flex; align-items: center; justify-content: center;">' +
                    '<div class="ListBtnWrapper" style="width: 50%" onclick="Inspect(this, ' + O + ')" onmouseover="Mouseover(this)" onmouseout="Mouseout(this)">O</div>' +
                    '<div class="ListBtnWrapper" style="width: 50%" onclick="Inspect(this, ' + X + ')" onmouseover="Mouseover(this)" onmouseout="Mouseout(this)">X</div>' +
                '</div>' +
                '<div style="display: flex; align-items: center; justify-content: center;">' +
                    '<div id="arrowleft_'+ (Paging_list[I][i].Count-1) +'" class="ListBtnWrapper" style="width: 50%" onclick="ctxLeft(this)" onmouseover="Mouseover(this)" onmouseout="Mouseout(this)"><img src="../../img/arrow_left.png" /></div>' +
                    '<div id="arrowright_'+ (Paging_list[I][i].Count-1) +'" class="ListBtnWrapper" style="width: 50%" onclick="ctxRight(this)" onmouseover="Mouseover(this)" onmouseout="Mouseout(this)"><img src="../../img/arrow_right.png" /></div>' +
                '</div>' +
            '</td>' +
        '</tr>'
    }

    //Default
    InnerHtml(ListBody, ListHtml)
    InnerHtml(TxtCurrentListPage, CountListPage(1) )
    InnerHtml(TxtTotalListPage, Paging_list.length);
}

// Mouseover
Mouseover = (e) => {
    e.style.backgroundColor = '#FAFAFA'
    e.style.borderColor = '#DADADA'
}
// Mouseout
Mouseout = (e) => {
    e.style.backgroundColor = '#DADADA'
    e.style.borderColor = '#D0D0D0'
}

// onclick
Inspect = (e, boolean) => {
    var thisname = e.parentNode.parentNode.parentNode.childNodes[4].firstChild.name
    var data = Data.find(element => element.Filename == thisname);
    
    if (data.human_checked !== true) {
        data.human_result = boolean
        data.human_checked = true
        console.log(data)
    }
}

//Counting Page
CountListPage = (num) => {
    var ListCurrentNum = '<span onclick="ChangeListPage()">' + num + '</span>'
    return ListCurrentNum;
}

//Paging
ListPagingLeft = () => {
    if (Paging_pic.length == 1) {
        return;
    }
    if (ListIndex !== 0) {
        ListIndex -= 1;
        while (ListBody.hasChildNodes()) { 
            ListBody.removeChild(ListBody.firstChild); 
        }
    }

    LoadPictureList(ListIndex)
    drawListCanvas(Paging_rect)
    InnerHtml(TxtCurrentListPage, CountListPage(ListIndex+1))
}

ListPagingRight = () => {
    if (Paging_pic.length == 1) {
        return;
    }

    if (ListIndex < Paging_list.length - 1) {
        console.log(ListIndex)
        ListIndex += 1;
        while (ListBody.hasChildNodes()) { 
            ListBody.removeChild(ListBody.firstChild); 
        }
        console.log(ListBody)
    }

    LoadPictureList(ListIndex)
    drawListCanvas(Paging_rect)
    InnerHtml(TxtCurrentListPage, CountListPage(ListIndex+1))
}

ListPagingMove = () => {
    var InputCurrentListPage = document.querySelector('#InputCurrentListPage');

    ListIndex = InputCurrentListPage.value - 1

    while (ListBody.hasChildNodes()) { 
        ListBody.removeChild(ListBody.firstChild); 
    }
    console.log(ListBody)

    LoadPictureList(ListIndex)
    drawListCanvas(Paging_rect)
    InnerHtml(TxtCurrentListPage, CountListPage(ListIndex+1))
}

ChangeListPage = () => {
    var input = '<input type="text" id="InputCurrentListPage" onchange="ListPagingMove()"></input>'
    InnerHtml(TxtCurrentListPage, input)
}

//
// canvas
//
drawListCanvas = (data) => {
    console.log(data)
    var temp = document.querySelectorAll('canvas');

    for (let i = 0; i < temp.length; i++) {
        var ctx = temp[i].getContext("2d");

        var x = 320 / 1920
        var y = 180 / 1080
        ctx.scale(x,y);
        ctx.lineWidth = 5;

        for (let j = 0; j < data[Index][i].length; j++) {
            if (j == 0) {
                ctx.strokeStyle = 'blue';
            } else {
                ctx.strokeStyle = 'yellow';
            }            
            ctx.strokeRect(data[Index][i][j]['pothole-x'], data[Index][i][j]['pothole-y'], data[Index][i][j]['pothole-width'], data[Index][i][j]['pothole-height']);
        }

        temp[i].style.width = '16.6667vw';
        temp[i].style.maxWidth = '320px';
        temp[i].style.height = '9.3750vw';
        temp[i].style.maxHeight = '180px';

        Rect_Index.push({n: 0})
    }
}

ctxLeft = (e) => {
    var temp = e.id.split('_')[1]
    var canvas = document.getElementById('canvas' + temp)
    var ctx = document.getElementById('canvas' + temp).getContext('2d');

    if (temp >= 30) {
        temp -= (30 * ListIndex)
    }

    if (Rect_Index[temp].n == 0) {
        return 0;
    } else {
        Rect_Index[temp].n -= 1        
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
    }

    var rect = Paging_rect[Index][temp]

    for (var i in rect) {
        if (Rect_Index[temp].n == i) {
            ctx.strokeStyle = 'blue';
        } else {
            ctx.strokeStyle = 'yellow';
        }
        ctx.strokeRect(rect[i]['pothole-x'], rect[i]['pothole-y'], rect[i]['pothole-width'], rect[i]['pothole-height']);
    }
}

ctxRight = (e) => {
    var temp = e.id.split('_')[1]
    var canvas = document.getElementById('canvas' + temp)
    var ctx = document.getElementById('canvas' + temp).getContext('2d');

    if (temp >= 30) {
        temp -= (30 * ListIndex)
    }
    
    if (Rect_Index[temp].n < Paging_rect[Index][temp].length-1) {
        Rect_Index[temp].n += 1
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
    } else {
        return 0;
    }


    var rect = Paging_rect[Index][temp]

    for (var i in rect) {
        if (Rect_Index[temp].n == i) {
            ctx.strokeStyle = 'blue';
        } else {
            ctx.strokeStyle = 'yellow';
        }
        ctx.lineWidth = 2;
        ctx.strokeRect(rect[i]['pothole-x'], rect[i]['pothole-y'], rect[i]['pothole-width'], rect[i]['pothole-height']);
    }
}

//
// 실행
//
SideBar();
clickedInspection();

if (W_Data.length !== 0) {
    console.log('Data full')
    arrayListPaging(W_Data, W_RectData)
    LoadPictureList(0);
    drawListCanvas(Paging_rect);
}