var Pictures = document.querySelector('#Pictures');
var TxtCurrentPage = document.querySelector('#TxtCurrentPage');
var TxtTotalPage = document.querySelector('#TxtTotalPage');

var Paging_pic = [];
var pictemp = [];
var Paging_rect = [];
var recttemp = [];
// var Rect_Index = []

var picCount = 1;
var rectCount = 1;
var canvasCount = 0;
var Index = 0;

//
// 사진 로딩
//
arrayPaging = (picdata, rectdata) => {
    console.log
    for (let i = 0; i < picdata.length; i++) {
        for (let j = 0; j < picdata[i].length; j++){
            pictemp.push({ 
                ondblclick : 'Annotation(this,2)', 
                src: 'http://165.246.196.154:3001/downloads/' + picdata[i][j].FILE_PATH, 
                id: 'img_' + (picCount-1), 
                name: picdata[i][j].FILE_PATH,
                human_result: JSON.parse(picdata[i][j]['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
            })        
            
            if (picCount % 300 == 0) {
                Paging_pic.push(pictemp);
                pictemp=[]; 
            }
    
            picCount += 1
        }
    
        if (i == picdata.length - 1 && pictemp.length !== 0) {
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
}

LoadPictures = (I) => {
    var division = [0]
    
    var a = Math.floor(Paging_pic[I].length / 20)

    if (Paging_pic[I].length <= 20) {
        division.push(Paging_pic[I].length)
    } else {
        for (let i = 1; i < a+1; i++) {
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

            // img
            var img = document.createElement("img");
            SetAttribute(img, 'id', Paging_pic[I][j].id)
            SetAttribute(img, 'class', 'LoadImg')
            SetAttribute(img, 'src', Paging_pic[I][j].src)
            SetAttribute(img, 'name', Paging_pic[I][j].name)

            // canvas
            var canvas = document.createElement("canvas");
            SetAttribute(canvas, 'id', 'canvas'+ canvasCount);
            SetAttribute(canvas, 'ondblclick', Paging_pic[I][j].ondblclick)
            SetAttribute(canvas, 'width', 1920)
            SetAttribute(canvas, 'height', 1080)
            SetAttribute(canvas, 'style', 'position: absolute; top: 0; left: 0;');
            
            // button
            var btnWrapper = document.createElement("div");
            SetAttribute(btnWrapper, 'style', 'display: flex; align-items: center; justify-content: center;')

            var OBtn = document.createElement("div");
            SetAttribute(OBtn, 'id', 'O_'+ canvasCount);
            SetAttribute(OBtn, 'class', 'BtnWrapper');
            SetAttribute(OBtn, 'onmouseover', 'Mouseover(this)')
            SetAttribute(OBtn, 'onmouseout', 'Mouseout(this)')
            SetAttribute(OBtn, 'onclick', "Inspect(this, 1)")

            var O = document.createElement("p")
            InnerHtml(O, 'O')

            var XBtn = document.createElement("div");
            SetAttribute(XBtn, 'id', 'X_'+ canvasCount);
            SetAttribute(XBtn, 'class', 'BtnWrapper');
            SetAttribute(XBtn, 'onmouseover', 'Mouseover(this)')
            SetAttribute(XBtn, 'onmouseout', 'Mouseout(this)')
            SetAttribute(XBtn, 'onclick', "Inspect(this, 0)")

            var X = document.createElement("p")
            InnerHtml(X, 'X')

            var human_checked = '';
            W_Data.find(element => {
                for (let i = 0; i < element.length; i++) {
                    if (element[i].FILE_PATH == Paging_pic[I][j].name){
                        human_checked = element[i]
                    }
                }
            });
            if (human_checked['HUMAN_CHECKED'] == "1" && human_checked['HUMAN_CHECKED'] == 1) {
                var human_result = JSON.parse(human_checked['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
                for (let i = 0; i < Object.keys(human_result).length; i++) {
                    if (human_result[i] == "0" && human_result[i] == 0) {
                        SetAttribute(OBtn, 'style', 'background-color: #FFFFFF');
                        SetAttribute(XBtn, 'style', 'background-color: #DADADA');
                    } else if (human_result[i] == "1" && human_result[i] == 1) {
                        SetAttribute(OBtn, 'style', 'background-color: #DADADA');
                        SetAttribute(XBtn, 'style', 'background-color: #FFFFFF');
                    } else {
                        SetAttribute(OBtn, 'style', 'background-color: #DADADA');
                        SetAttribute(XBtn, 'style', 'background-color: #DADADA');
                    }
                }
            }
            
            OBtn.appendChild(O)
            XBtn.appendChild(X)
            btnWrapper.appendChild(OBtn)
            btnWrapper.appendChild(XBtn)
            wrapper.appendChild(img)
            wrapper.appendChild(canvas)
            wrapper.appendChild(btnWrapper)
            Pictures.appendChild(wrapper)

            canvasCount += 1
        }
    }

    var addblank = Paging_pic[I].length % 4

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
        SetAttribute(div, 'style', 'width: 20.5729vw; max-width: 395px; height: 11.0221vw; max-height: 211.625px;');

        Pictures.appendChild(div);
    }
}

// Mouseover
Mouseover = (e) => {
    var thisdata = '';
    var thisname = e.parentNode.parentNode.firstChild.name
        
    W_Data.find(element => {
        for (let i = 0; i < element.length; i++) {
            if (element[i].FILE_PATH == thisname){
                thisdata = element[i]
            }
        }
    });

    if (thisdata['HUMAN_CHECKED'] !== "1" && thisdata['HUMAN_CHECKED'] !== 1) {
        e.style.backgroundColor = '#DADADA'
        e.style.borderColor = '#FFFFFF'
    }
}
// Mouseout
Mouseout = (e) => {
    var temp = Number(e.id.split('_')[1]);

    var thisdata = '';
    var thisname = e.parentNode.parentNode.firstChild.name
        
    W_Data.find(element => {
        for (let i = 0; i < element.length; i++) {
            if (element[i].FILE_PATH == thisname){
                thisdata = element[i]
            }
        }
    });

    if (thisdata['HUMAN_CHECKED'] !== "1" && thisdata['HUMAN_CHECKED'] !== 1) {
        e.style.backgroundColor = '#FFFFFF'
        e.style.borderColor = '#D0D0D0'
    }
}

// onclick
Inspect = (e, boolean) => {
    var temp = Number(e.id.split('_')[1]);
    var OBtn = document.getElementById('O_'+temp);
    var XBtn = document.getElementById('X_'+temp);

    var thisdata = '';
    var thisname = e.parentNode.parentNode.firstChild.name
        
    W_Data.find(element => {
        for (let i = 0; i < element.length; i++) {
            if (element[i].FILE_PATH == thisname){
                thisdata = element[i]
            }
        }
    });

    var human_result = thisdata['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)']
    human_result = JSON.parse(human_result)
    if (typeof human_result == 'string') {
        human_result = JSON.parse(human_result)
    }
    
    for (let i = 0; i < Object.keys(human_result).length; i++) {
        if (human_result[i] == "0" || human_result[i] == "1") {
            human_result[i] = boolean.toString()
        }
    }
    thisdata['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'] = JSON.stringify(human_result)

    thisdata['HUMAN_CHECKED'] = "1"

    if (boolean == 0) {
        OBtn.style.backgroundColor = '#FFFFFF';
        XBtn.style.backgroundColor = '#DADADA';
    } else {
        OBtn.style.backgroundColor = '#DADADA';
        XBtn.style.backgroundColor = '#FFFFFF';
    }

    console.log('W_Data => ', W_Data)
    
    // 캔버스 다시 그리기
    var canvas = document.getElementById('canvas' + temp)
    var ctx = document.getElementById('canvas' + temp).getContext('2d');

    if (temp >= 300) {
        temp -= (300 * Index)
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    var rect = Paging_rect[Index][temp]

    for (let i = 0; i < rect.length; i++) {
        if (boolean == 1) {
            ctx.strokeStyle = 'green';
        } else if (boolean == 0) {
            ctx.strokeStyle = 'red';
        } 
        
        ctx.strokeRect(rect[i]['pothole-x'], rect[i]['pothole-y'], rect[i]['pothole-width'], rect[i]['pothole-height']);
    }
}

//
// canvas 
//

drawCanvas = (data) => {
    var temp = document.querySelectorAll('canvas');

    for (let i = 0; i < temp.length; i++) {
        var ctx = temp[i].getContext("2d");
        ctx.beginPath();

        ctx.lineWidth = 10;

        for (let j = 0; j < data[Index][i].length; j++) {
            if (Paging_pic[Index][i]['human_result'][j] == "1") {
                console.log('green')
                ctx.strokeStyle = 'green';
            } else if (Paging_pic[Index][i]['human_result'][j] == "0") {
                console.log('red')
                ctx.strokeStyle = 'red';
            }

            ctx.strokeRect(data[Index][i][j]['pothole-x'], data[Index][i][j]['pothole-y'], data[Index][i][j]['pothole-width'], data[Index][i][j]['pothole-height']);
        }

        temp[i].style.width = '20.5729vw';
        temp[i].style.maxWidth = '395px';
        temp[i].style.height = '11.5723vw';
        temp[i].style.maxHeight = '222.188px';

        // Rect_Index.push({n: 0})
    }
}

// ctxLeft = (e) => {
//     var temp = Number(e.id.split('_')[1])
//     var canvas = document.getElementById('canvas' + temp)
//     var ctx = document.getElementById('canvas' + temp).getContext('2d');

//     if (temp >= 300) {
//         temp -= (300 * Index)
//     }

//     if (Rect_Index[temp].n == 0) {
//         return 0;
//     } else {
//         Rect_Index[temp].n -= 1        
//         ctx.clearRect(0, 0, canvas.width, canvas.height); 
//     }

//     var rect = Paging_rect[Index][temp]
//     console.log(rect)

//     for (let i = 0; i < rect.length; i++) {
//         if (i == Rect_Index[temp].n) {
//             ctx.strokeStyle = 'blue';
//         } else if (Paging_pic[Index][temp]['human_result'][i] == "0" && Paging_pic[Index][temp]['human_result'][i] == 0) {
//             ctx.strokeStyle = 'green';
//         } else if (Paging_pic[Index][temp]['human_result'][i] == "1" && Paging_pic[Index][temp]['human_result'][i] == 1) {
//             ctx.strokeStyle = 'red';
//         }
//         ctx.strokeRect(rect[i]['pothole-x'], rect[i]['pothole-y'], rect[i]['pothole-width'], rect[i]['pothole-height']);
//     }
// }

// ctxRight = (e) => {
//     var temp = Number(e.id.split('_')[1])
//     var canvas = document.getElementById('canvas' + temp)
//     var ctx = document.getElementById('canvas' + temp).getContext('2d');

//     if (temp >= 300) {
//         temp -= (300 * Index)
//     }

//     if (Rect_Index[temp].n < Paging_rect[Index][temp].length-1) {
//         Rect_Index[temp].n += 1
//         ctx.clearRect(0, 0, canvas.width, canvas.height); 
//     } else {
//         return 0;
//     }

//     var rect = Paging_rect[Index][temp]
//     console.log(rect)
    
//     for (let i = 0; i < rect.length; i++) {
//         if (i == Rect_Index[temp].n) {
//             ctx.strokeStyle = 'blue';
//         } else if (Paging_pic[Index][temp]['human_result'][i] == "0" && Paging_pic[Index][temp]['human_result'][i] == 0) {
//             ctx.strokeStyle = 'green';
//         } else if (Paging_pic[Index][temp]['human_result'][i] == "1" && Paging_pic[Index][temp]['human_result'][i] == 1) {
//             ctx.strokeStyle = 'red';
//         }
//         ctx.strokeRect(rect[i]['pothole-x'], rect[i]['pothole-y'], rect[i]['pothole-width'], rect[i]['pothole-height']);
//     }
// }

//
// Paging
//
CountPage = (num) => {
    var CurrentNum = '<span onclick="ChangePage()">' + num + '</span>'
    return CurrentNum;
}

PagingLeft = () => {
    if (Paging_pic.length == 1) {
        return;
    }
    if (Index !== 0) {
        Index -= 1;
        while (Pictures.hasChildNodes()) { 
            Pictures.removeChild(Pictures.firstChild); 
        }
    }
    LoadPictures(Index);
    drawCanvas(Paging_rect);
    InnerHtml(TxtCurrentPage, CountPage(Index+1))
}

PagingRight = () => {
    if (Paging_pic.length == 1) {
        return;
    }
    if (Index < Paging_pic.length - 1) {
        Index += 1;
        while (Pictures.hasChildNodes()) { 
            Pictures.removeChild(Pictures.firstChild); 
        }
    }
    LoadPictures(Index);
    drawCanvas(Paging_rect);
    InnerHtml(TxtCurrentPage, CountPage(Index+1))
}

InputPage = () => {
    var InputCurrentPage = document.querySelector('#InputCurrentPage');
    Index = InputCurrentPage.value - 1

    while (Pictures.hasChildNodes()) { 
        Pictures.removeChild(Pictures.firstChild); 
    }
    LoadPictures(Index);
    drawCanvas(Paging_rect);
    InnerHtml(TxtCurrentPage, CountPage(Index+1))
}

ChangePage = () => {
    var input = '<input type="text" id="InputCurrentPage" onchange="InputPage()"></input>';
    InnerHtml(TxtCurrentPage, input)
}

//
// 실행
//
SideBar();
clickedInspection();

var LPC = document.getElementById('lastPotholeCount')
InnerHtml(LPC, lastPotholeCount)

if (W_Data.length !== 0) {
    arrayPaging(W_Data, W_RectData)
    
    LoadPictures(0);
    drawCanvas(Paging_rect);
}