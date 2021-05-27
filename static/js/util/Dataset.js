var Period = document.querySelector('#Period');
var PeriodStart = document.querySelector('#PeriodStart');
var PeriodEnd = document.querySelector('#PeriodEnd');

var DateValues = [];
var ReverseDateValues = [];
var DeviceValues = [];

var DeviceTempData = [];

var temp = [];
var temp2 = [];
var temp3 = [];

arrayDateValue = (data) => {
    for (let i = 0; i < data.length; i++) {
        DateValues.push(JSON.parse(data[i].META_DATA).yyyyMMdd)
    }
    
    DateValues = DateValues.filter((element, index) => {
        return DateValues.indexOf(element) === index;
    })
    
    DateValues.sort((a,b) => {
        return a - b;
    });
}

arrayReverseDateValue = (data) => {
    for (let i = 0; i < data.length; i++) {
        ReverseDateValues.push(JSON.parse(data[i].META_DATA).yyyyMMdd)
    }
    
    ReverseDateValues = ReverseDateValues.filter((element, index) => {
        return ReverseDateValues.indexOf(element) === index;
    })
    
    ReverseDateValues.sort((a,b) => {
        return b - a;
    });
}

//
// Original Data
//
arrayDateData = (data, type) => {
    for (let i = 0; i < DateValues.length; i++) {
        data.filter((element) => {
            if (JSON.parse(element.META_DATA).yyyyMMdd === DateValues[i]) {
                temp.push(element)
            }
        })

        temp.sort((a,b) => {
            return JSON.parse(a.META_DATA).HHmmssSSS - JSON.parse(b.META_DATA).HHmmssSSS
        })

        if (temp.length !== 0) {
            type.push(temp)
        }
        
        temp = [];
    }
}

arrayReverseDateData = (data, type) => {
    for (let i = 0; i < ReverseDateValues.length; i++) {
        data.filter((element) => {
            if (JSON.parse(element.META_DATA).yyyyMMdd === ReverseDateValues[i]) {
                temp.push(element)
            }
        })

        temp.sort((a,b) => {
            return JSON.parse(b.META_DATA).HHmmssSSS - JSON.parse(a.META_DATA).HHmmssSSS
        })

        if (temp.length !== 0) {
            type.push(temp)
        }
        
        temp = [];
    }
}

//
// Device Data
//

var secretariat = [
    '수원국토관리사무소-1',
    '수원국토관리사무소-2',
    '의정부국토관리사무소-1',
    '의정부국토관리사무소-2',
    '홍천국토관리사무소-1',
    '홍천국토관리사무소-2',
    '강릉국토관리사무소-1',
    '강릉국토관리사무소-2',
    '정선국토관리사무소-1',
    '정선국토관리사무소-2',
    '논산국토관리사무소-1',
    '논산국토관리사무소-2',
    '충주국토관리사무소-1',
    '충주국토관리사무소-2',
    '보은국토관리사무소-1',
    '보은국토관리사무소-2',
    '예산국토관리사무소-1',
    '예산국토관리사무소-2',
    '광주국토관리사무소-1',
    '광주국토관리사무소-2',
    '남원국토관리사무소-1',
    '남원국토관리사무소-2',
    '순천국토관리사무소-1',
    '순천국토관리사무소-2',
    '전주국토관리사무소-1',
    '전주국토관리사무소-2',
    '진주국토관리사무소-1',
    '진주국토관리사무소-2',
    '포항국토관리사무소-1',
    '포항국토관리사무소-2',
    '영주국토관리사무소-1',
    '영주국토관리사무소-2', 
    '진영국토관리사무소-1',
    '진영국토관리사무소-2',
    '대구국토관리사무소-1',
    '대구국토관리사무소-2'
]

arrayDeviceValue = () => {
    for (let i = 0; i < 36; i++) {
        console.log(secretariat[i])
        DeviceValues.push(secretariat[i] + '<br/>(DEVICE00000000' + ( i + 157) + ')')
    }
}

arrayDeviceData = (data, type) => {
    for (let i = 0; i < DeviceValues.length; i++) {
        data.filter((element) => {
            // console.log(DeviceValues[i])
            if (DeviceValues[i].split('(')[1].split(')')[0] == JSON.parse(element.META_DATA).MAC) {
                // console.log(element)
                temp.push(element)
            }
        })


        temp.sort((a,b) => {
            return JSON.parse(a.META_DATA).yyyyMMdd - JSON.parse(b.META_DATA).yyyyMMdd
        })

        DeviceTempData.push(temp)
        temp = [];
    }

    for (let i = 0; i < DeviceTempData.length; i++) {
        for (let j = 0; j < DateValues.length; j++) {
            DeviceTempData[i].filter((element) => {
                if (DateValues[j] === JSON.parse(element.META_DATA).yyyyMMdd) {
                    temp2.push(element)
                }
            })

            if (temp2.length !== 0) {
                temp2.sort((a,b) => {
                    return JSON.parse(a.META_DATA).HHmmssSSS - JSON.parse(b.META_DATA).HHmmssSSS
                })

                temp3.push(temp2)
                temp2 = [];
            }
        }
    type.push(temp3)
    temp3 = [];
    }
}

arrayRectData = (data, type) => {
    var temp = '';
    var temp_arr = [];

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            var temp = data[i][j].META_RECT_LIST
            temp = temp.split("#");
            for (let k = 0; k < temp.length; k++) {
                temp_arr.push(JSON.parse(temp[k]))
            }
            
            temp_arr.sort((a,b)=>{
                var x1 = a['pothole-x']
                var y1 = a['pothole-y']
                var x2 = b['pothole-x']
                var y2 = b['pothole-y']
        
                if ( y1 == y2 ) {
                    return x1-x2;
                } else {
                    return y1-y2
                }
            })
            
            type.push(temp_arr)
            temp_arr=[];
        }
    }
}