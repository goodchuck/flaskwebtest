
var Modal = document.getElementById('Modal');
var modelName = '';
var modelac = '';
var modelrc = '';
var modelpc = '';
var modelf1 = '';
var data = [
    'model_1', 'model_2', 'model_3', 'model_4', 'model_5', 'model_6', 'model_7', 'model_8', 'model_9', 'model_10', 'model_11', 'model_12', 'model_13', 'model_14', 'model_15', 'model_16', 'model_17', 'model_18', 'model_19', 'model_20', 'model_21', 'model_22', 'model_23', 'model_24', 'model_25', 'model_26', 'model_27', 'model_28', 'model_29', 'model_30', 'model_31', 'model_32', 'model_33', 'model_34', 'model_35', 'model_36', 'model_37', 'model_38', 'model_39', 'model_40', 'model_41', 'model_42', 'model_43', 'model_44', 'model_45', 'model_46', 'model_47', 'model_48', 'model_49', 'model_50',
]
var actest = [
    '20','40','60','80','90','97'
]
var rctest = [
    '80','60','40','20', '10', '7'
]
var pctest = [
    '20','40','60','80','90','97'
]
var f1test = [
    '80','60','40','20', '10', '7'
]
LoadModal = () => {
    var btntxt = '';

    if (modelBox_title == '모델 조회') {
        btntxt = '확인'
        btntype = 0
    } else if (modelBox_title == '모델 교체') {
        btntxt = '교체 하기'
        btntype = 1
    }

    var list = '';

    for (let i = 0; i < data.length; i++) {
        list += 
            '<div class="row" style="display: flex;" onclick="clickModel(this)">' +
                '<p class="flex_mid" style="width: 15%; height: 40px; border-right: 1px solid #DADADA;">' + (i+1) + '</p>' +
                '<p class="flex_ac" style="width: 85%; height: 40px; padding-left: 15px;">' + data[i] + '</p>' +
            '</div>'
    }

    var html = 
        '<div id="ViewerWrapper" class="flex_mid" style="flex-direction: column;">' +
            '<div id="CloseBtn" class="flex_mid" onclick="CloseModal()" onmouseover="C_Mouseover(this)" onmouseout="C_Mouseout(this)">' +
                '<p id="X">X</p>' +
            '</div>' +
            '<div class="modelBox flex_mid"> '+
                '<div class="modelBox_title flex_ac">' +
                    '<p>' + modelBox_title + '</p>' +
                '</div>' +
                '<div id="modelList">' +
                    list +
                '</div>' +
                '<div class="btn flex_mid" onclick="clickBtn(' + btntype + ')">' +
                    '<p>' + btntxt + '</p>' +
                '</div>' +
            '</div>' +
        '</div>'

    InnerHtml(Modal, html)

}


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

clickModel = (e) => {
    var temp = document.getElementsByClassName('row');

    for (let i = 0; i < temp.length; i++) {
        temp[i].style.backgroundColor = '#FFFFFF'
    }

    e.style.backgroundColor = '#f0f0f0'
    
    modelName = e.lastChild.innerText
    
    
    for(let j = 0; j< data.length; j++){
        console.log(j);
        if(modelName == data[j]){
            console.log(data[j]);
            modelac = actest[j];
            modelrc = rctest[j];
            modelpc = actest[j];
            modelf1 = f1test[j];
            break;
        }
    }
    if(btntype == 0){
        document.getElementById('test6').innerText = modelName;
        MakeTable(2,document.getElementById('DoughnutChartWrapper2'));
        color1 = "#fa709a"
        color2 = "#fee140"
        MakeDoughnutChart(2, color1,color2)
    } if (btntype == 1){
        document.getElementById('test').innerText = modelName;
        document.getElementById('test2').innerText = modelac + "%";
        document.getElementById('test3').innerText = modelrc + "%";
        document.getElementById('test4').innerText = modelpc + "%";
        document.getElementById('test5').innerText = modelf1 + "%";
        MakeTable(1,document.getElementById('DoughnutChartWrapper'));
        MakeDoughnutChart(1,"rgba(147,165,207)","rgba(228,239,233)")
    }
    
    console.log(modelName)
    
    
}

clickBtn = (type) => {
    CloseModal();
    console.log(type)
} 

//
// 실행
//
LoadModal();