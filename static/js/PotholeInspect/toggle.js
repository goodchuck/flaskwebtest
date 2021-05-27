// 토글 버튼
var pic = document.getElementById("pic");
var piclist = document.getElementById("piclist");

togglePage = (type) => {
    if (type == 'pic') {
        pic.style.display = 'none';
        piclist.style.display = '';
        PotholeInspectList();
    } else if (type == 'piclist') {
        pic.style.display = '';
        piclist.style.display = 'none';
        PotholeInspect();
    }
}