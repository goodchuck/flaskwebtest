var Modal = document.getElementById('Modal');
var ModalImageSrc = ModalImage.src;
var ModalImageId = ModalImage.id;
var ModalImageName = ModalImage.name;
var ModalMac = ModalImage.getAttribute('mac');
var ModalAddress = ModalImage.getAttribute('address');
var ModalData = ModalImage.getAttribute('date');
var ModalTime = ModalImage.getAttribute('time');
var Left = 'Left'
var Right = 'Right'
convertId2name = {
    "DEVICE00000000157" : "수원-1",
    "DEVICE00000000158" : "수원-2",
    "DEVICE00000000159" : "의정부-1",
    "DEVICE00000000160" : "의정부-2",
    "DEVICE00000000161" : "홍천-1",
    "DEVICE00000000162" : "홍천-2",
    "DEVICE00000000163" : "강릉-1",
    "DEVICE00000000164" : "강릉-2",
    "DEVICE00000000165" : "정선-1",
    "DEVICE00000000166" : "정선-2",
    "DEVICE00000000167" : "논산-1",
    "DEVICE00000000168" : "논산-2",
    "DEVICE00000000169" : "충주-1",
    "DEVICE00000000170" : "충주-2",
    "DEVICE00000000171" : "보은-1",
    "DEVICE00000000172" : "보은-2",
    "DEVICE00000000173" : "예산-1",
    "DEVICE00000000174" : "예산-2",
    "DEVICE00000000175" : "광주-1",
    "DEVICE00000000176" : "광주-2",
    "DEVICE00000000177" : "남원-1",
    "DEVICE00000000178" : "남원-2",
    "DEVICE00000000179" : "순천-1",
    "DEVICE00000000180" : "순천-2",
    "DEVICE00000000181" : "전주-1",
    "DEVICE00000000182" : "전주-2",
    "DEVICE00000000183" : "진주-1",
    "DEVICE00000000184" : "진주-2",
    "DEVICE00000000185" : "포항-1",
    "DEVICE00000000186" : "포항-2",
    "DEVICE00000000187" : "영주-1",
    "DEVICE00000000188" : "영주-2",
    "DEVICE00000000189" : "진영-1",
    "DEVICE00000000190" : "진영-2",
    "DEVICE00000000191" : "대구-1",
    "DEVICE00000000192" : "대구-2",

}
LoadModal = (src, mac, address, date, time) => {

    var html = 
        '<div id="ViewerWrapper" class="flex_mid" style="flex-direction: column;">' +
            '<div id="CloseBtn" class="flex_mid" onclick="CloseModal()" onmouseover="C_Mouseover(this)" onmouseout="C_Mouseout(this)">' +
                '<p id="X">X</p>' +
            '</div>' +
            '<div class="flex_mid"> '+
                '<div class="arrow_circle flex_mid" onclick="MoveModal('+ Left +')" onmouseover="AL_Mouseover(this)" onmouseout="AL_Mouseout(this)">' +
                    '<div class="arrow_left"></div>' +
                '</div>' +
                '<div class="flex_mid" style="flex-direction: column; margin: 0 1.0417vw">' +
                    '<div class="Wrapper" style="margin-bottom: 0.9259vh;">' +
                        '<div>' +
                            '<div class="View_Title">' +
                                '<p>원본</p>' +
                            '</div>' +
                            '<img id="OrgImg" src="' + src + '" class="View_Image" />' +
                        '</div>' +
                        '<div style="position: relative;">' +
                            '<div>' +
                                '<div class="View_Title">' +
                                '<div style="height:100px;color:white;position:absolute;z-index:1;text-align:right;width:34vw;font-size:12px; right:0px;">'+convertId2name[mac].split("-")[0]+' 국토관리사무소 -'+convertId2name[mac].split("-")[1]+'/ '+address+'/'+date.slice(0,4)+'-'+date.slice(4,6)+'-'+date.slice(6,8)+'/'+time.slice(0,2)+'시'+time.slice(2,4)+'분'+'</div>'+
                                    '<p>검수 기기</p>' +
                                '</div>' +
                                '<img src="' + src + '" class="View_Image" />' +
                            '</div>' +
                            '<canvas id="canvas0" width="1920" height="1080"></canvas>' +
                        '</div>' +
                    '</div>' +
                    '<div class="Wrapper flex_sb">' +
                        '<div style="position: relative;">' +
                            '<div>' +
                                '<div class="View_Title">' +
                                    '<p>인공지능</p>' +
                                '</div>' +
                                '<img src="' + src + '" class="View_Image" />' +
                            '</div>' +
                            '<canvas id="canvas1" width="1920" height="1080"></canvas>' +
                        '</div>' +
                        '<div style="position: relative;">' +
                            '<div>' +
                                '<div class="View_Title">' +
                                    '<p>수기 검수</p>' +
                                '</div>' +
                                '<img src="' + src + '" class="View_Image" />' +
                            '</div>' +
                            '<canvas id="canvas2" width="1920" height="1080"></canvas>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="arrow_circle flex_mid" onclick="MoveModal('+ Right +')" onmouseover="AR_Mouseover(this)" onmouseout="AR_Mouseout(this)">' +
                    '<div class="arrow_right"></div>' +
                '</div>' +
            '</div>' +
        '</div>'

    InnerHtml(Modal, html)

}

//
// Move
//
var ImgCount = Number(ModalImageId.split('_')[1]);

CloseModal = () => {
    Modal.style.display = 'none';
}

C_Mouseover = (e) => {
    var X = document.getElementById('X');

    e.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
    X.style.color = 'black';
}

C_Mouseout = (e) => {
    var X = document.getElementById('X');

    e.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    X.style.color = 'white';
}

AL_Mouseover = (e) => {
    var Arrow_left = document.getElementsByClassName('arrow_left')[0];

    e.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    Arrow_left.style.borderRightColor = 'rgba(255, 255, 255, 0.6)';
}

AL_Mouseout = (e) => {
    var Arrow_left = document.getElementsByClassName('arrow_left')[0];

    e.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
    Arrow_left.style.borderRightColor = 'rgba(0, 0, 0, 0.75)';
}

AR_Mouseover = (e) => {
    var Arrow_right = document.getElementsByClassName('arrow_right')[0];

    e.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    Arrow_right.style.borderLeftColor = 'rgba(255, 255, 255, 0.6)';
}

AR_Mouseout = (e) => {
    var Arrow_right = document.getElementsByClassName('arrow_right')[0];
    
    e.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
    Arrow_right.style.borderLeftColor = 'rgba(0, 0, 0, 0.75)';
}

MoveModal = (e) => {
    if (e == "Left" && 0 < ImgCount) {
        ImgCount -= 1

        var src = document.getElementById('img_' + ImgCount).src
        var address = document.getElementById('img_'+ImgCount).getAttribute('address')
        var mac = document.getElementById('img_'+ImgCount).getAttribute('mac')
        var date = document.getElementById('img_'+ImgCount).getAttribute('date')
        var time = document.getElementById('img_'+ImgCount).getAttribute('time')
        LoadModal(src,mac,address,date, time)

        ModalImageId = document.getElementById('img_' + ImgCount).id
        ModalImageName = document.getElementById('img_' + ImgCount).name
        drawCanvas();
    } else if (e == "Right" && ImgCount < Paging_pic[Index].length) {
        ImgCount += 1
        var src = document.getElementById('img_' + ImgCount).src
        var address = document.getElementById('img_'+ImgCount).getAttribute('address')
        var mac = document.getElementById('img_'+ImgCount).getAttribute('mac')
        var date = document.getElementById('img_'+ImgCount).getAttribute('date')
        var time = document.getElementById('img_'+ImgCount).getAttribute('time')
        LoadModal(src,mac,address,date,time)

        ModalImageId = document.getElementById('img_' + ImgCount).id
        ModalImageName = document.getElementById('img_' + ImgCount).name
        drawCanvas();
    }
}

//
// canvas
//
drawCanvas = () => {
    var temp = document.querySelectorAll('canvas');
    var img_id = Number(ModalImageId.split('_')[1])
    var thisdata = '';

    if (img_id >= 300) {
        img_id -= 300 * index
    }

    PicData.find(element => {
        for (let i = 0; i < element.length; i++) {
            if (element[i]['FILE_PATH'] == ModalImageName) {
                thisdata = element[i];
            }
        }
    });

    console.log('thisdata => ', thisdata)

    var model_result = JSON.parse(thisdata['UTL_RAW.CAST_TO_VARCHAR2(MODEL_RESULT)']);
    if (typeof model_result == 'string') {
        model_result = JSON.parse(model_result)
    }

    var human_result = JSON.parse(thisdata['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)']);
    if (typeof human_result == 'string') {
        human_result = JSON.parse(human_result)
    }

    for (let i = 0; i < temp.length; i++) {
        var ctx = temp[i].getContext("2d");
        ctx.beginPath();

        ctx.lineWidth = 5;
        console.log(Paging_rect[Index][img_id])
        
        if (i == 0) {
            for (let j = 0; j < Paging_rect[Index][img_id].length; j++) {
                ctx.strokeStyle = 'green';

                console.log(Paging_rect[Index][img_id][j])
                ctx.strokeRect(
                    Paging_rect[Index][img_id][j]['pothole-x'], 
                    Paging_rect[Index][img_id][j]['pothole-y'], 
                    Paging_rect[Index][img_id][j]['pothole-width'], 
                    Paging_rect[Index][img_id][j]['pothole-height']
                );
            }
        } else if (i == 1) {
            for (let j = 0; j < Paging_rect[Index][img_id].length; j++) {
                if (model_result[j] == "1" && model_result[j] == 1) {
                    ctx.strokeStyle = 'green';
                } else if (model_result[j] == "0" && model_result[j] == 0) {
                    ctx.strokeStyle = 'red';
                }

                console.log(Paging_rect[Index][img_id][j])
                ctx.strokeRect(
                    Paging_rect[Index][img_id][j]['pothole-x'], 
                    Paging_rect[Index][img_id][j]['pothole-y'], 
                    Paging_rect[Index][img_id][j]['pothole-width'], 
                    Paging_rect[Index][img_id][j]['pothole-height']
                );
            }
        } else if (i == 2) {
            for (let j = 0; j < Object.keys(human_result).length; j++) {
                console.log('human_result => ', human_result)
                if (human_result[j] == "1" && human_result[j] == 1) {
                    ctx.strokeStyle = 'green';

                    ctx.strokeRect(
                        Paging_rect[Index][img_id][j]['pothole-x'], 
                        Paging_rect[Index][img_id][j]['pothole-y'], 
                        Paging_rect[Index][img_id][j]['pothole-width'], 
                        Paging_rect[Index][img_id][j]['pothole-height']
                    );
                } else if (human_result[j] == "0" && human_result[j] == 0) {
                    ctx.strokeStyle = 'red';

                    ctx.strokeRect(
                        Paging_rect[Index][img_id][j]['pothole-x'], 
                        Paging_rect[Index][img_id][j]['pothole-y'], 
                        Paging_rect[Index][img_id][j]['pothole-width'], 
                        Paging_rect[Index][img_id][j]['pothole-height']
                    );
                } else {
                    ctx.strokeStyle = 'blue';
                    
                    ctx.strokeRect(
                        human_result[j]['pothole-x'], 
                        human_result[j]['pothole-y'], 
                        human_result[j]['pothole-width'], 
                        human_result[j]['pothole-height']
                    );
                }
            }
        }
    }
}

removeCanvas = () => {
    var temp = document.querySelectorAll('canvas');
    
    for (var i in temp) {
        var ctx = temp[i].getContext("2d");
        ctx.clearRect(0, 0, temp[i].width, temp[i].height);
    }
}
//
// 실행
//
console.log(ModalImageSrc)
LoadModal(ModalImageSrc,ModalMac,ModalAddress, ModalData, ModalTime);
drawCanvas(RectData);

document.onkeydown = (e) => {
    console.log(e)
    if (e.which == 27) {
        CloseModal();
    }
    if (e.which == 37) {
        MoveModal('Left')
    }
    if (e.which == 39) {
        MoveModal('Right')
    }
}