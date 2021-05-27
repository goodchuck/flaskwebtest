var DT = new Date(); 

getCurrentTime = () => {
    var Hour = DT.getHours();
    var Minutes = DT.getMinutes();
    var Seconds = DT.getSeconds();

    if (Hour < 10) {
        Hour = "0" + Hour;
    }
    if (Minutes < 10) {
        Minutes = "0" + Minutes;
    }
    if (Seconds < 10) {
        Seconds = "0" + Seconds;
    }
    var CurrentTime = { HH: Hour, mm: Minutes, SS : Seconds }

    return CurrentTime;
}

getToday = () => {
    var Year = DT.getFullYear();
    var Month = 1 + DT.getMonth();
    var Day = DT.getDate();

    if ( Month < 10 ){
        Month = "0" + Month;
    }
    if ( Day < 10 ){
        Day = "0" + Day;
    }

    Year = Year.toString();
    Month = Month.toString();
    Day = Day.toString();

    var Today = Year +  Month +  Day;
    Today = Number(Today)
    // Today = Today.toString()

    return Today;
}

getYesterday = () => {
    var YDADT = new Date(DT.setDate(DT.getDate()-1));

    var YDAYear = YDADT.getFullYear();
    var YDAMonth = 1 + YDADT.getMonth();
    var YDADay = YDADT.getDate();
    
    if ( YDAMonth < 10 ){
        YDAMonth = "0" + YDAMonth;
    }
    if ( YDADay < 10 ){
        YDADay = "0" + YDADay;
    }
    
    YDAYear = YDAYear.toString();
    YDAMonth = YDAMonth.toString();
    YDADay = YDADay.toString();
    
    var Yesterday = YDAYear +  YDAMonth +  YDADay;
    Yesterday = Number(Yesterday)
    // Yesterday = Yesterday.toString()
    
    DT = new Date();

    return Yesterday;
}

getThisWeek = () => {
    var TWDT = new Date(DT.setDate(DT.getDate()-6));

    var TWYear = TWDT.getFullYear();
    var TWMonth = 1 + TWDT.getMonth();
    var TWDay = TWDT.getDate();
    
    if ( TWMonth < 10 ){
        TWMonth = "0" + TWMonth;
    }
    if ( TWDay < 10 ){
        TWDay = "0" + TWDay;
    }
    
    TWYear = TWYear.toString();
    TWMonth = TWMonth.toString();
    TWDay = TWDay.toString();
    
    var ThisWeek = TWYear + TWMonth + TWDay;
    ThisWeek = Number(ThisWeek)
    
    DT = new Date();

    return ThisWeek;
}


getThisMonth = () => {
    var TMYear = DT.getFullYear();
    var TMMonth = 1 + DT.getMonth();
    var TMDay = 1;
    
    if ( TMMonth < 10 ){
        TMMonth = "0" + TMMonth;
    }
    if ( TMDay < 10 ){
        TMDay = "0" + TMDay;
    }
    
    TMYear = TMYear.toString();
    TMMonth = TMMonth.toString();
    TMDay = TMDay.toString();
    
    var ThisMonth = TMYear + TMMonth + TMDay;
    ThisMonth = Number(ThisMonth);

    return ThisMonth;
}