InnerHtml = (Tag , txt) => {
    Tag.innerHTML = txt;
}

SetAttribute = (Tag, attr, value) => {
    Tag.setAttribute(attr, value);
}

SideBar = () => {
    var Sidebar = document.getElementById('Sidebar')
    var html = 
    '<ul>' +
        '<li id="M_Server" onclick="ClickedMenu(this)">' +
            '<span class="icon flex_mid"><img src="../img/icon/server.png" /></span>' +
            '<span>서버</span>' +
        '</li>' +
            '<div id="DM_Server" style="display: none;">' +
                '<li onclick="AIMgt()" class="DetailedMenu">' +
                    '인공지능 관리' +
                '</li>' +
                // '<li onclick="DeviceMgt()" class="DetailedMenu">' +
                //     '기기 관리' +
                // '</li>' +
                '<li onclick="PotholeState()" class="DetailedMenu">' +
                    '포트홀 현황' +
                '</li>' +
            '</div>' +
        '<li id="M_Inspection" onclick="ClickedMenu(this)">' +
            '<span class="icon flex_mid"><img src="../img/icon/inspect.png" /></span>' +
            '<span>포트홀 검수</span>' +
        '</li>' +
            '<div id="DM_Inspection" style="display: none;">' +
                '<li onclick="PotholeInspect()" class="DetailedMenu">' +
                    '포트홀 검수' +
                '</li>' +
                '<li onclick="Viewer()" class="DetailedMenu">' +
                    '뷰어' +
                '</li>' +
            '</div>' +
        '<li id="M_Chart" onclick="ClickedMenu(this)">' +
            '<span class="icon flex_mid"><img src="../img/icon/table_chart.png" /></span>' +
            '<span>통계</span>' +
        '</li>' +
            '<div id="DM_Chart" style="display: none;">' +
                '<li onclick="TableChart()" class="DetailedMenu">' +
                    '당일 검수 현황' +
                '</li>' +
                '<li onclick="CSV()" class="DetailedMenu">' +
                    '월별 검수 현황' +
                '</li>' +
                '<li onclick="ImgChart()" class="DetailedMenu">' +
                    '지역별 검수 현황' +
                '</li>' +
                '<li onclick="testInfo()" class="DetailedMenu">' +
                    '포트홀 검수 현황' +
                '</li>' +
                '<li onclick="resultInfo()" class="DetailedMenu">' +
                    '포트홀 검출 현황' +
                '</li>' +
                '<li onclick="safeInfo()" class="DetailedMenu">' +
                    '지킴이 연계율' +
                '</li>' +
                '<li onclick="aiInfo()" class="DetailedMenu">' +
                    '인공지능 학습 정보' +
                '</li>' +
            '</div>' +
    '</ul>';

    InnerHtml(Sidebar, html)
}

clickedBtn = (e, id) => {
    $('#DeviceList').scrollTop(0);
    $('#ListBodyWrapper').scrollTop(0);
    $('#V_Pictures').scrollTop(0);
    $('#C_Pictures').scrollTop(0);

    console.log('clicked')
    console.log(id)
    var btns = document.querySelectorAll('#' + id + ' button')

    for (let i = 0; i < btns.length; i++) {
        btns[i].style.backgroundColor = '#FAFAFA';
        btns[i].style.borderColor = '#DADADA';

        btns[i].addEventListener('mouseover', (event) => {
            event.target.style.backgroundColor = '#DADADA';
            event.target.style.borderColor = '#FAFAFA';
        })
        btns[i].addEventListener('mouseout', (event) => {
            event.target.style.backgroundColor = '#FAFAFA';
            event.target.style.borderColor = '#DADADA';
        })
    }

    var div = document.querySelector('#' + id + ' div')
    div.style.backgroundColor = '#FAFAFA';
    div.style.borderColor = '#DADADA';

    e.style.backgroundColor = '#DADADA';
    e.style.borderColor = '#FAFAFA';

    e.addEventListener('mouseover', (event) => {
        event.target.style.backgroundColor = '#DADADA';
        event.target.style.borderColor = '#FAFAFA';
    })
    e.addEventListener('mouseout', (event) => {
        event.target.style.backgroundColor = '#DADADA';
        event.target.style.borderColor = '#FAFAFA';
    })
}

clickedServer = () => {
    M_Server.style.background = '#FFFFFF';

    DM_Server.style.display = '';
}

clickedInspection = () => {
    M_Inspection.style.background = '#FFFFFF';

    DM_Inspection.style.display = '';
}

clickedChart = () => {
    M_Chart.style.background = '#FFFFFF';

    DM_Chart.style.display = '';
}

DateFilter = (Y, M, D) => {
    if (D == '30' && M == '04' || M == '06' || M == '09' || M == '11') {
        console.log('4dnjf')
        M = Number(M);
        M += 1;
        M = M.toString();

        D = '01'
    } else if (M == '02') {
        if (Number(Y) % 4 == 0 && Number(Y) % 100 !== 0 || Number(Y) % 400 == 0) {
            if (D == '29') {
                M = '03'
                D = '01'
            }
        } else if (D == '28') {
            M = '03'
            D = '01'
        }
    } else if (D == '31') {
        console.log('31')
        if (M == '12') {
            Y = Number(Y);
            Y += 1;
            Y = Y.toString();

            M = '01';
        } else {
            M = Number(M);
            M += 1;
            M = '0' + M.toString();
        }

        D = '01'
    } else {
        D = Number(D);
        D += 1;
        D = D.toString();

        if (D < 10) {
            D = "0" + D;
        }
    }

    console.log(M)

    return {y : Y, m : M, d : D}
}

MonthFilter = (Y, M, D) => {
    if (M == '12') {
        console.log('12월');
        M = '01';
        Y = (Number(Y) + 1).toString();;
    } else {
        console.log('그 외')
        M = Number(M) + 1;
    
        if (M < 10) {
            M = '0' + M
        }
    }

    console.log(M)

    return {y : Y, m : M, d : D}
}

//
// Canvas
//
drawCanvas_GB = (data, I, Pagingdata, cw, cMw, ch, cMh) => {
    console.log('Rect Data => ', data)

    var temp = document.querySelectorAll('.picCanvas');
    var RD = data[I];

    for (let i = 0; i < RD.length; i++) {
        var ctx = temp[i].getContext("2d");
        ctx.beginPath();
        ctx.lineWidth = 10;

        var HUMAN_RESULT = Pagingdata[I][i].human_result;
        for (let j = 0; j < Object.keys(HUMAN_RESULT).length; j++) {
            if (HUMAN_RESULT[j] == "0" && HUMAN_RESULT[j] == 0) {
                // if (RD[i][j] == undefined) {
                // } else {
                //     ctx.strokeStyle = 'red';
                //     ctx.strokeRect(RD[i][j]['pothole-x'], RD[i][j]['pothole-y'], RD[i][j]['pothole-width'], RD[i][j]['pothole-height']);
                // }
            } else if (HUMAN_RESULT[j] == "1" && HUMAN_RESULT[j] == 1) {
                if (RD[i][j] == undefined) {
                } else {
                    ctx.strokeStyle = 'green';
                    ctx.strokeRect(RD[i][j]['pothole-x'], RD[i][j]['pothole-y'], RD[i][j]['pothole-width'], RD[i][j]['pothole-height']);
                }
            } else {
                ctx.strokeStyle = 'blue'; 
                // var x = (HUMAN_RESULT[j]['pothole-x']) * (1920 / temp[i].width);
                // var y = (HUMAN_RESULT[j]['pothole-y']) * (1080 / temp[i].height);
                // var w = (HUMAN_RESULT[j]['pothole-width']) * (1920 / temp[i].width);
                // var h = (HUMAN_RESULT[j]['pothole-height']) * (1080 / temp[i].height);
                var x = (HUMAN_RESULT[j]['pothole-x']);
                var y = (HUMAN_RESULT[j]['pothole-y']);
                var w = (HUMAN_RESULT[j]['pothole-width']);
                var h = (HUMAN_RESULT[j]['pothole-height']);
                ctx.strokeRect(x, y, w, h);
            }
        }

        temp[i].style.width = cw;
        temp[i].style.maxWidth = cMw;
        temp[i].style.height = ch;
        temp[i].style.maxHeight = cMh;
    }
}