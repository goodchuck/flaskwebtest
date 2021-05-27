// Sideber
ClickedMenu = (e) => {
    console.log(e.id);
    var ThisID = document.querySelector('#' + e.id);
    var ThisDMID = document.querySelector('#D' + e.id);

    if (ThisDMID.style.display == 'none') {
        ThisDMID.style.display = ''

        ThisID.style.background = '#FFFFFF'
        ThisID.style.color = '#353540'        
    } else if (ThisDMID.style.display == '') {
        ThisDMID.style.display = 'none'

        ThisID.style.background = ''
        ThisID.style.color = ''
    }
}

//
// ChangeBody
//

var current_page = '';
var history_page = '';

window.onload=()=> {
    var Contents = $('body');

    current_page = 'S_PotholeState.html';

    console.log(current_page)
    Contents.load(current_page);
}

Refresh = () => {
    if (current_page !== '') {
        var Contents = $('body');
        
        Contents.load('S_AIMgt.html')
    }
}

Back = () => {
    if (history_page !== '' && current_page !== history_page) {
        var Contents = $('body');

        Contents.load(history_page)
        current_page = history_page;
    }
}

iconhover = (e) => {
    var name = e.name
    e.src = '../img/icon/' + name + '_hover.png'
}

iconout = (e) => {
    var name = e.name
    e.src = '../img/icon/' + name + '.png'
}

// Server
AIMgt = () => {
    var Contents = $('body');

    history_page = current_page;
    current_page = 'S_AIMgt.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];
}

var modelBox_title = '';
ModelDetail = (e) => {
    console.log(e)
    if (e.id == 'searchModel') {
        modelBox_title = '모델 조회'
    } else if (e.id == 'changeModel') {
        modelBox_title = '모델 교체'
    }

    var Modal = $('#Modal');
    Modal.css('display', '')

    Modal.load('S_ModelDetail.html');

    result = [];
    Data = [];
    Data2 = [];
}

DeviceMgt = () => {
    var Contents = $('body');

    history_page = current_page;
    current_page = 'S_DeviceMgt.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];
}

PotholeState = () => {
    var Contents = $('body');

    history_page = current_page;
    current_page = 'S_PotholeState.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];
}

// Pothle
PotholeInspect = () => {
    var Contents = $('body');

    history_page = current_page;
    current_page = 'P_PotholeInspect.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];
}

PotholeInspectList = () => {
    var Contents = $('body');

    history_page = current_page;
    current_page = 'P_PotholeInspectList.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];
}

var current_img_filename = '';
var current_img_index = 0;
var current_img_path = '';

Annotation = (e, type) => {
    if (type == 1) {
        current_img_filename = e.parentNode.parentNode.childNodes[4].firstChild.name
        current_img_path = e.parentNode.parentNode.childNodes[4].firstChild.src
    } else if (type == 2) {
        current_img_filename = e.parentNode.firstChild.name
        current_img_path =  e.parentNode.firstChild.src
    }else {
        current_img_filename = e.name
        current_img_path = e.src;
    }

    var Contents = $('body');

    history_page = current_page;
    current_page = 'Annotation.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];
}

Viewer = () => {
    var Contents = $('body');
    
    history_page = current_page;
    current_page = 'P_Viewer.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];
}

var ModalImage = '';
DetailViewer = (e) => {
    var Modal = $('#Modal');
    Modal.css('display', '')

    Modal.load('P_DetailViewer.html');
    ModalImage = e;
}

TableChart = () => {
    var Contents = $('body');
    
    history_page = current_page;
    current_page = 'C_TableChart.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];
}

ImgChart = () => {
    var Contents = $('body');
    
    history_page = current_page;
    current_page = 'C_ImgChart.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];
}

CSV = () => {
    var Contents = $('body');
    
    history_page = current_page;
    current_page = 'C_CSV.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];
}

aiInfo = ()=>{
    var Contents = $('body');
    
    history_page = current_page;
    current_page = 'aiInfo.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];
}
testInfo = ()=>{
    var Contents = $('body');
    
    history_page = current_page;
    current_page = 'testInfo.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];

}
resultInfo = ()=>{
    var Contents = $('body');
    
    history_page = current_page;
    current_page = 'resultInfo.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];

}

safeInfo = ()=>{
    var Contents = $('body');
    
    history_page = current_page;
    current_page = 'safeInfo.html';
    Contents.load(current_page);

    result = [];
    Data = [];
    Data2 = [];

}