// Annotation
// "use strict";

var VIA_REGION_SHAPE = {
    RECT: 'rect',
    CIRCLE: 'circle',
    ELLIPSE: 'ellipse',
    POLYGON: 'polygon',
    POINT: 'point',
    POLYLINE: 'polyline'
};

var VIA_REGION_EDGE_TOL = 20; // pixel
var VIA_REGION_POINT_RADIUS = 3;
var VIA_POLYGON_VERTEX_MATCH_TOL  = 5;
var VIA_REGION_MIN_DIM            = 3;
var VIA_MOUSE_CLICK_TOL = 2;
var VIA_ELLIPSE_EDGE_TOL = 0.2; // euclidean distance
var VIA_THETA_TOL = Math.PI/18; // 10 degrees
var VIA_POLYGON_RESIZE_VERTEX_OFFSET = 100;
var VIA_CANVAS_DEFAULT_ZOOM_LEVEL_INDEX = 0;
var VIA_CANVAS_ZOOM_LEVELS = [1.0, 1.5, 2.0, 2.5, 3.0, 4, 5];

var VIA_OBJECT_TYPE = {
    PotHole: '포트홀 ',
    Manhole: 'Manhole',
    Sel3: 'Sel3',
    Sel4: 'Sel4',
    Sel5: 'Sel5',
    Sel6: 'Sel6'
};
var _via_current_object_type = VIA_OBJECT_TYPE.PotHole;
var VIA_THEME_REGION_BOUNDARY_WIDTH = 7;
var VIA_THEME_BOUNDARY_LINE_COLOR = "yellow";
var VIA_THEME_BOUNDARY_FILL_COLOR   = "yellow";
var VIA_THEME_SEL_REGION_FILL_COLOR = "#808080";
var VIA_THEME_SEL_REGION_FILL_BOUNDARY_COLOR = "#F5A100";
var VIA_THEME_SEL_REGION_OPACITY = 0.5;
var VIA_THEME_ATTRIBUTE_VALUE_FONT = '10pt Sans';
var VIA_THEME_CONTROL_POINT_COLOR = '#C55710';

var VIA_CSV_SEP = ',';
var VIA_CSV_KEYVAL_SEP = ':';
var VIA_IMPORT_CSV_COMMENT_CHAR = '#';

var _via_img_metadata = {}; // 로드 된 이미지 메타 데이터를 저장하는 데이터 구조
var _via_img_count = 0; // 로드 된 이미지 수
var _via_canvas_regions = []; // image regions spec. in canvas space
var _via_canvas_scale = 1.0; // current scale of canvas image

var _via_image_id_list = []; // 이미지 ID 배열 (원래 순서)
var _via_image_id = ''; // id={filename+length} of current image
var _via_image_index = -1; // index

var _via_current_image_filename;
var _via_current_image;
var _via_current_image_width;
var _via_current_image_height;

// image canvas
var _via_img_canvas = document.getElementById("image_canvas");
var _via_img_ctx = _via_img_canvas.getContext("2d");
var _via_reg_canvas = document.getElementById("region_canvas");
var _via_reg_ctx = _via_reg_canvas.getContext("2d");
var rect_select_canvas = document.getElementById("rect_select_canvas");
var rect_select_ctx = rect_select_canvas.getContext("2d");
var _via_canvas_width, _via_canvas_height;

// draw rect
var thisdata = '';
var model_result = ''
var human_result = ''
var rect_list = [];
var rect_array = [];
var Rect_Index = 0;

// canvas zoom
var _via_canvas_zoom_level_index = VIA_CANVAS_DEFAULT_ZOOM_LEVEL_INDEX; // 1.0
var _via_canvas_scale_without_zoom = 1.0;

// 응용프로그램의 상태
var _via_is_user_drawing_region = false;
var _via_current_image_loaded = false;
var _via_is_window_resized = false;
var _via_is_user_resizing_region = false;
var _via_is_user_moving_region = false;
var _via_is_user_drawing_polygon = false;
var _via_is_region_selected = false;
var _via_is_all_region_selected = false;
var _via_is_user_updating_attribute_name = false;
var _via_is_user_updating_attribute_value = false;
var _via_is_user_adding_attribute_name = false;
var _via_is_attributes_panel_visible = false;
var _via_is_reg_attr_panel_visible = false;
var _via_is_canvas_zoomed = false;
var _via_is_loading_current_image = false;
var _via_is_region_id_visible = true;
var _via_is_region_boundary_visible = true;
var _via_is_ctrl_pressed = false;

// 영역
var _via_current_shape = VIA_REGION_SHAPE.RECT;
var _via_current_polygon_region_id = -1;
var _via_user_sel_region_id = -1;
var _via_click_x0 = 0;
var _via_click_y0 = 0;
var _via_click_x1 = 0;
var _via_click_y1 = 0;
var _via_region_click_x, _via_region_click_y;
var _via_region_edge = [-1, -1];
var _via_current_x = 0;
var _via_current_y = 0;

// 속성
var _via_region_attributes             = {};
var _via_current_update_attribute_name = "";
var _via_current_update_region_id      = -1;
var _via_file_attributes               = {};
var _via_visible_attr_name             = '';

// 로컬 스토리지 속성
var _via_is_local_storage_available = false;
var _via_is_save_ongoing = false;

// 이미지 리스트
var _via_reload_img_fn_list_table = true;
var _via_loaded_img_fn_list = [];
var _via_loaded_img_fn_list_file_index = [];
var _via_loaded_img_fn_list_table_html = [];

// UI html 요소
var invisible_file_input = document.getElementById("invisible_file_input");
var canvas_panel = document.getElementById("canvas_panel");
var PicMain = document.getElementsByClassName("PicMain");
var ObjScrollBox = document.getElementById("ObjScrollBox");
var SelectedObj = document.getElementsByName("SelectedObj");
var _via_image_path = document.getElementById("_via_image_path");

//
// 어노테이션 데이터 구조
//

function ImageMetadata (filepath, filename) {
    this.filepath = filepath;
    this.filename = filename;
    // this.size = size;
    // this.fileref = fileref; // image url or local file ref.
    this.regions = [];
    this.file_attributes = {}; // image attributes
    this.base64_img_data = ''; // image data stored as base 64
}

function ImageRegion() {
    this.is_user_selected = false;
    this.shape_attributes = {}; // region shape attributes
    this.region_attributes = {}; // region attributes
}

//
// 초기화 루틴
//

_via_init = () => {
    show_home_panel();

    var thisfilename = document.getElementById('filename');
    InnerHtml(thisfilename, current_img_filename);

    var thisfiledate = document.getElementById('filedate');
    var thisyyyyMMdd = '';
    var thisHHmmssSSS = '';
    
    W_Data.find(element => {
        for (let i = 0; i < element.length; i++) {
            if (element[i]['FILE_PATH'] == current_img_filename) {
                thisyyyyMMdd = JSON.parse(element[i].META_DATA).yyyyMMdd
                thisHHmmssSSS = JSON.parse(element[i].META_DATA).HHmmssSSS
            }
        }
    })

    thisyyyyMMdd = thisyyyyMMdd.substring(0,4) + '년 ' +  thisyyyyMMdd.substring(4,6) + '월 ' + thisyyyyMMdd.substring(6,8) + '일 ';
    thisHHmmssSSS = thisHHmmssSSS.substring(0,2) + ':' +  thisHHmmssSSS.substring(2,4) + ':' + thisHHmmssSSS.substring(4,6) + ':' + thisHHmmssSSS.substring(6,9);

    InnerHtml(thisfiledate, thisyyyyMMdd + thisHHmmssSSS)
}

// 기존 rect 그리기
defaultDraw = () => {
    W_Data.find(element => {
        for (var i in element) {
            if (current_img_filename == element[i]['FILE_PATH']) {
                thisdata = element[i]
            }
        }
    })

    model_result = JSON.parse(thisdata['UTL_RAW.CAST_TO_VARCHAR2(MODEL_RESULT)'])
    human_result = JSON.parse(thisdata['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'])
    rect_list = thisdata['META_RECT_LIST'].split('#');
    rect_array = [];
    for (var i in rect_list) {
        rect_array.push(JSON.parse(rect_list[i]))
    }

    rect_array.sort((a,b) => {
        return a['pothole-x'] - b['pothole-x'];
    })
}

drawAllRect = () => {
    defaultDraw();

    rect_select_ctx.beginPath();
    rect_select_ctx.lineWidth = 5;

    for (let i = 0; i < Object.keys(model_result).length; i++) {
        if (Object.keys(model_result).length !== 1 && i == 0) {
            console.log('blue')
            rect_select_ctx.strokeStyle = 'blue';
        } else if (model_result[i] == "1" && model_result[i] == 1) {
            console.log('green')
            rect_select_ctx.strokeStyle = 'green';
        } else if (model_result[i] == "0" && model_result[i] == 0) {
            console.log('red')
            rect_select_ctx.strokeStyle = 'red';
        }
        console.log(rect_array[i]['pothole-x'])
        rect_select_ctx.strokeRect(rect_array[i]['pothole-x'], rect_array[i]['pothole-y'], rect_array[i]['pothole-width'], rect_array[i]['pothole-height']);
    }
    rect_select_ctx.closePath();

    // rect_select_canvas.width = PicMain[0].clientWidth
    // rect_select_canvas.height = (PicMain[0].clientWidth / 1920) * 1080
}

// 검수
Inspect = (all, boolean) => {
    if (typeof human_result == 'string') {
        human_result = JSON.parse(human_result)
    }


    if (all == 'All') {
        for (let i = 0; i < Object.keys(human_result).length; i++) {
            human_result[i] = boolean.toString()
        }
    } else {
        human_result[Rect_Index] = boolean.toString();
    }

    thisdata['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'] = JSON.stringify(human_result)
    thisdata['HUMAN_CHECKED'] = "1"

    rect_select_ctx.beginPath();
    rect_select_ctx.lineWidth = 5;

    for (let i = 0; i < Object.keys(human_result).length; i++) {
        if (Object.keys(model_result).length !== 1 && i == Rect_Index) {
            rect_select_ctx.strokeStyle = 'blue';
        } else if (human_result[i] == "1" && human_result[i] == 1) {
            rect_select_ctx.strokeStyle = 'green';
        } else if (human_result[i] == "0" && human_result[i] == 0) {
            rect_select_ctx.strokeStyle = 'red';
        }
        console.log(rect_array[i])
        rect_select_ctx.strokeRect(rect_array[i]['pothole-x'], rect_array[i]['pothole-y'], rect_array[i]['pothole-width'], rect_array[i]['pothole-height']);
    }
    rect_select_ctx.closePath();
}

ctxLeft = () => {
    console.log('길이', Object.keys(model_result).length)
    if (Object.keys(model_result).length == 1 && Rect_Index == 0) {
        return 0;
    } else {
        console.log('left')

        Rect_Index -= 1        
        ctx.clearRect(0, 0, rect_select_canvas.width, rect_select_canvas.height); 
        
        rect_select_ctx.beginPath();
        rect_select_ctx.lineWidth = 5;

        for (let i = 0; i < Object.keys(human_result).length; i++) {
            if (i == Rect_Index) {
                rect_select_ctx.strokeStyle = 'blue';
            } else if (human_result[i] == "1" && human_result[i] == 1) {
                rect_select_ctx.strokeStyle = 'green';
            } else if (human_result[i] == "0" && human_result[i] == 0) {
                rect_select_ctx.strokeStyle = 'red';
            }
            rect_select_ctx.strokeRect(rect_array[i]['pothole-x'], rect_array[i]['pothole-y'], rect_array[i]['pothole-width'], rect_array[i]['pothole-height']);
        }
        rect_select_ctx.closePath();
    }
}

ctxRight = () => {
    console.log(Rect_Index)
    console.log(model_result)
    if (Object.keys(model_result).length !== 1 && Rect_Index < Object.keys(human_result).length - 1) {
        console.log('right')

        Rect_Index += 1
        ctx.clearRect(0, 0, rect_select_canvas.width, rect_select_canvas.height); 

        rect_select_ctx.beginPath();
        rect_select_ctx.lineWidth = 5;
    
        for (let i = 0; i < Object.keys(human_result).length; i++) {
            if (i == Rect_Index) {
                rect_select_ctx.strokeStyle = 'blue';
            } else if (human_result[i] == "1" && human_result[i] == 1) {
                rect_select_ctx.strokeStyle = 'green';
            } else if (human_result[i] == "0" && human_result[i] == 0) {
                rect_select_ctx.strokeStyle = 'red';
            }
            rect_select_ctx.strokeRect(rect_array[i]['pothole-x'], rect_array[i]['pothole-y'], rect_array[i]['pothole-width'], rect_array[i]['pothole-height']);
        }
        rect_select_ctx.closePath();
    } else {
        return 0;
    }
}

//
// 상단 탐색 모음 용 핸들러
//

// 홈 패널 보기
show_home_panel = () => {
    if (_via_current_image_loaded) {
        show_all_canvas();
    } else {
        clear_image_display_area();
    }
}

// 로컬 이미지 선택
sel_local_images = () => {
    // source: https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
    if (invisible_file_input) {
        invisible_file_input.accept = '.jpg,.jpeg,.png,.bmp';
        invisible_file_input.onchange = store_local_img_ref;
        invisible_file_input.click();
    }
}

// 어노테이션 데이터 파일로 저장
download_all_region_data = (type) => {
    // Javascript strings (DOMString) is automatically converted to utf-8
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob
    var all_region_data = pack_via_metadata(type);
    var blob_attr = {
        type: 'text/' + type + ';charset=utf-8'
    };
    var all_region_data_blob = new Blob(all_region_data, blob_attr);

    if (all_region_data_blob.size > (2 * 1024 * 1024) &&
        type === 'csv') {
        // show_message('CSV 파일의 크기는 ' + (all_region_data_blob.size/(1024*1024)) +
        //             ' MB입니다. JSON 파일로도 저장할 수 있습니다.');
        console.log('CSV 파일의 크기는 ' + (all_region_data_blob.size/(1024*1024)) + ' MB입니다. JSON 파일로도 저장할 수 있습니다.')
    } else {
        save_data_to_local_file(all_region_data_blob, 'via_region_data.' + type);
    }
}

// 이미지 디스플레이 비우기
clear_image_display_area = () => {
    hide_all_canvas();
}

// 객체 종류 선택
sel_object_type = (sel_object_type) => {
    _via_current_object_type = sel_object_type;

    switch (_via_current_object_type) {
        case VIA_OBJECT_TYPE.PotHole: 
            VIA_THEME_BOUNDARY_LINE_COLOR = "yellow";
            VIA_THEME_BOUNDARY_FILL_COLOR   = "yellow";

            break;
        case VIA_OBJECT_TYPE.Manhole: 
            VIA_THEME_BOUNDARY_LINE_COLOR = "#FF7F27";
            VIA_THEME_BOUNDARY_FILL_COLOR   = "#FF7F27";

            break;
        case VIA_OBJECT_TYPE.Sel3:
            VIA_THEME_BOUNDARY_LINE_COLOR = "#FFF200";
            VIA_THEME_BOUNDARY_FILL_COLOR   = "#FFF200";

            break;
        case VIA_OBJECT_TYPE.Sel4:
            VIA_THEME_BOUNDARY_LINE_COLOR = "#00A2E8";
            VIA_THEME_BOUNDARY_FILL_COLOR   = "#00A2E8";

            break;
        case VIA_OBJECT_TYPE.Sel5:
            VIA_THEME_BOUNDARY_LINE_COLOR = "#A349A4";
            VIA_THEME_BOUNDARY_FILL_COLOR   = "#A349A4";

            break;
        case VIA_OBJECT_TYPE.Sel6:
            VIA_THEME_BOUNDARY_LINE_COLOR = "#FFAEC9";
            VIA_THEME_BOUNDARY_FILL_COLOR   = "#FFAEC9";

            break;
        default:
            VIA_THEME_BOUNDARY_LINE_COLOR = "yellow";
            VIA_THEME_BOUNDARY_FILL_COLOR   = "yellow";

            break;
    }
}

//
// 로컬 파일 업로더
//

//로컬 이미지 참조 저장
store_local_img_ref = (event) => {   
    var filepath = current_img_path;
    var filename = current_img_filename;
    var img_id = current_img_filename;

    _via_img_metadata[img_id] 
    = new ImageMetadata(filepath,
                        filename
                        );
}

//
// 데이터 가져오기
//

_via_get_image_id = (filename) => {
    if (typeof (size) === 'undefined') {
        return filename;
    } else {
        return filename + size;
    }
}

//
// 데이터 내보내기
//

//데이터 포장
pack_via_metadata = (return_type) => {
    if (return_type === 'csv') {
        var csvdata = [];
        var csvheader =
            '#filename,file_size,file_attributes,region_count,region_id,region_shape_attributes,region_attributes';
        csvdata.push(csvheader);

        for (var image_id in _via_img_metadata) {
            var fattr = map_to_json(_via_img_metadata[image_id].file_attributes);
            fattr = escape_for_csv(fattr);

            var prefix = '\n' + _via_img_metadata[image_id].filename;
            prefix += ',' + _via_img_metadata[image_id].size;
            prefix += ',"' + fattr + '"';

            var r = _via_img_metadata[image_id].regions;

            if (r.length !== 0) {
                for (var i = 0; i < r.length; ++i) {
                    var csvline = [];
                    csvline.push(prefix);
                    csvline.push(r.length);
                    csvline.push(i);

                    var sattr = map_to_json(r[i].shape_attributes);
                    sattr = '"' + escape_for_csv(sattr) + '"';
                    csvline.push(sattr);

                    var rattr = map_to_json(r[i].region_attributes);
                    rattr = '"' + escape_for_csv(rattr) + '"';
                    csvline.push(rattr);
                    csvdata.push(csvline.join(VIA_CSV_SEP));
                }
            } else {
                // @todo: reconsider this practice of adding an empty entry
                csvdata.push(prefix + ',0,0,"{}","{}"');
            }
        }
        return csvdata;
    } else {
        // JSON.stringify() does not work with Map()
        // hence, we cast everything as objects
        var _via_img_metadata_as_obj = {};
        for (var image_id in _via_img_metadata) {
            var image_data = {};
            // image_data.fileref = _via_img_metadata[image_id].fileref;
            if (document.getElementById("UserName") == null) {
                alert('작업자를 입력해주세요.')
                return;
            } else {
                image_data.username = document.getElementById("UserName").innerText;
            }
            image_data.fileref = '';
            image_data.size = _via_img_metadata[image_id].size;
            image_data.filename = _via_img_metadata[image_id].filename;
            image_data.base64_img_data = '';
            //image_data.base64_img_data = _via_img_metadata[image_id].base64_img_data;

            // copy file attributes
            image_data.file_attributes = {};
            for (var key in _via_img_metadata[image_id].file_attributes) {
                image_data.file_attributes[key] = _via_img_metadata[image_id].file_attributes[key];
            }

            // copy all region shape_attributes
            image_data.regions = {};
            for (var i = 0; i < _via_img_metadata[image_id].regions.length; ++i) {
                image_data.regions[i] = {};
                image_data.regions[i].shape_attributes = {};
                image_data.regions[i].region_attributes = {};
                // copy region shape_attributes
                for (var key in _via_img_metadata[image_id].regions[i].shape_attributes) {
                    image_data.regions[i].shape_attributes[key] = _via_img_metadata[image_id].regions[i]
                        .shape_attributes[key];
                }
                // copy region_attributes
                for (var key in _via_img_metadata[image_id].regions[i].region_attributes) {
                    image_data.regions[i].region_attributes[key] = _via_img_metadata[image_id].regions[i]
                        .region_attributes[key];
                }
            }
            _via_img_metadata_as_obj[image_id] = image_data;
        }
        return [JSON.stringify(_via_img_metadata_as_obj)];
    }
}

//데이터 로컬파일로 저장
save_data_to_local_file = (data, filename) => {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(data);
    a.target = '_blank';
    a.download = filename;

    // simulate a mouse click event
    var event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    a.dispatchEvent(event);
}


//
//사용자 인터페이스 관리자
//

//이미지 보여주기
show_image = (image_index) => {
    var filename = current_img_filename;
    var img_id = filename;

    _via_current_image = new Image();

    // 응용 프로그램의 현재 상태 업데이트
    _via_current_image.addEventListener( "load", function() {
        _via_image_id = img_id;
        _via_image_index = image_index;
        _via_current_image_loaded = true;
        _via_is_loading_current_image = false;
        _via_click_x0 = 0;
        _via_click_y0 = 0;
        _via_click_x1 = 0;
        _via_click_y1 = 0;
        _via_is_user_drawing_region = false;
        _via_is_window_resized = false;
        _via_is_user_resizing_region = false;
        _via_is_user_moving_region = false;
        _via_is_user_drawing_polygon = false;
        _via_is_region_selected = false;
        _via_user_sel_region_id = -1;
        _via_current_image_width = _via_current_image.naturalWidth;
        _via_current_image_height = _via_current_image.naturalHeight;
    
        // 캔버스 크기 설정
        // 브라우저 창의 현재 차원에 기반
        var de = document.documentElement;
        // console.log(PicMain[0].clientWidth)
        var canvas_panel_width = PicMain[0].clientWidth;
        var canvas_panel_height = PicMain[0].clientHeight;
        _via_canvas_width = _via_current_image_width;
        _via_canvas_height = _via_current_image_height;
    
        if (_via_canvas_width > canvas_panel_width) {
            // resize image to match the panel width
            var scale_width = canvas_panel_width / _via_current_image.naturalWidth;
            _via_canvas_width = canvas_panel_width;
            _via_canvas_height = _via_current_image.naturalHeight * scale_width;
        }
        if (_via_canvas_height > canvas_panel_height) {
            // resize further image if its height is larger than the image panel
            var scale_height = canvas_panel_height / _via_canvas_height;
            _via_canvas_height = canvas_panel_height;
            _via_canvas_width = _via_canvas_width * scale_height;
        }
    
        _via_canvas_width = Math.round(_via_canvas_width);
        _via_canvas_height = Math.round(_via_canvas_height);
        _via_canvas_scale = _via_current_image.naturalWidth / _via_canvas_width;
        _via_canvas_scale_without_zoom = _via_canvas_scale;
        set_all_canvas_size(_via_canvas_width, _via_canvas_height);
        //set_all_canvas_scale(_via_canvas_scale_without_zoom);
    
        // 캔버스가 모두 보이는지 확인
        clear_image_display_area();
        show_all_canvas();
    
        // 우리는 이미지 캔버스에서 이미지를 한번만 그리면 된다.
        _via_img_ctx.clearRect(0, 0, _via_canvas_width, _via_canvas_height);
        _via_img_ctx.drawImage(_via_current_image, 0, 0,
            _via_canvas_width, _via_canvas_height);
    
        _via_load_canvas_regions(); // 이미지를 캔버스 공간으로 변환
        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();
    
        // 이미지 리스트 새로고침
        _via_reload_img_fn_list_table = true;
    });
    _via_current_image.src = current_img_path;
    // InnerHtml(_via_image_path, _via_img_metadata[img_id].filepath)
}

// 이미지 영역을 캔버스 영역으로 변환
_via_load_canvas_regions = () => {
    // load all existing annotations into _via_canvas_regions
    var regions = _via_img_metadata[_via_image_id].regions;
    _via_canvas_regions = [];
    for (var i = 0; i < regions.length; ++i) {
        var region_i = new ImageRegion();
        for (var key in regions[i].region_attributes) {
            region_i.region_attributes[key] = regions[i].region_attributes[key];
        }
        for (var key in regions[i].shape_attributes) {
            region_i.shape_attributes[key] = regions[i].shape_attributes[key];
        }
        _via_canvas_regions.push(region_i);

        switch (_via_canvas_regions[i].shape_attributes['name']) {
            case VIA_REGION_SHAPE.RECT:
                var x = regions[i].shape_attributes['x'] / _via_canvas_scale;
                var y = regions[i].shape_attributes['y'] / _via_canvas_scale;
                var width = regions[i].shape_attributes['width'] / _via_canvas_scale;
                var height = regions[i].shape_attributes['height'] / _via_canvas_scale;

                _via_canvas_regions[i].shape_attributes['x'] = Math.round(x);
                _via_canvas_regions[i].shape_attributes['y'] = Math.round(y);
                _via_canvas_regions[i].shape_attributes['width'] = Math.round(width);
                _via_canvas_regions[i].shape_attributes['height'] = Math.round(height);
                break;

            case VIA_REGION_SHAPE.CIRCLE:
                var cx = regions[i].shape_attributes['cx'] / _via_canvas_scale;
                var cy = regions[i].shape_attributes['cy'] / _via_canvas_scale;
                var r = regions[i].shape_attributes['r'] / _via_canvas_scale;
                _via_canvas_regions[i].shape_attributes['cx'] = Math.round(cx);
                _via_canvas_regions[i].shape_attributes['cy'] = Math.round(cy);
                _via_canvas_regions[i].shape_attributes['r'] = Math.round(r);
                break;

            case VIA_REGION_SHAPE.ELLIPSE:
                var cx = regions[i].shape_attributes['cx'] / _via_canvas_scale;
                var cy = regions[i].shape_attributes['cy'] / _via_canvas_scale;
                var rx = regions[i].shape_attributes['rx'] / _via_canvas_scale;
                var ry = regions[i].shape_attributes['ry'] / _via_canvas_scale;
                _via_canvas_regions[i].shape_attributes['cx'] = Math.round(cx);
                _via_canvas_regions[i].shape_attributes['cy'] = Math.round(cy);
                _via_canvas_regions[i].shape_attributes['rx'] = Math.round(rx);
                _via_canvas_regions[i].shape_attributes['ry'] = Math.round(ry);
                break;

            case VIA_REGION_SHAPE.POLYGON:
                var all_points_x = regions[i].shape_attributes['all_points_x'].slice(0);
                var all_points_y = regions[i].shape_attributes['all_points_y'].slice(0);
                for (var j = 0; j < all_points_x.length; ++j) {
                    all_points_x[j] = Math.round(all_points_x[j] / _via_canvas_scale);
                    all_points_y[j] = Math.round(all_points_y[j] / _via_canvas_scale);
                }
                _via_canvas_regions[i].shape_attributes['all_points_x'] = all_points_x;
                _via_canvas_regions[i].shape_attributes['all_points_y'] = all_points_y;
                break;

            case VIA_REGION_SHAPE.POINT:
                var cx = regions[i].shape_attributes['cx'] / _via_canvas_scale;
                var cy = regions[i].shape_attributes['cy'] / _via_canvas_scale;

                _via_canvas_regions[i].shape_attributes['cx'] = Math.round(cx);
                _via_canvas_regions[i].shape_attributes['cy'] = Math.round(cy);
                break;
        }
    }
}

// 영역 모양 선택
select_region_shape = (sel_shape_name) => {
    for (var shape_name in VIA_REGION_SHAPE) {
        var ui_element = document.getElementById('region_shape_' + VIA_REGION_SHAPE[shape_name]);
        ui_element.classList.remove('RegSel');
    }

    _via_current_shape = sel_shape_name;
    var ui_element = document.getElementById('region_shape_' + _via_current_shape);
    ui_element.classList.add('RegSel');

    switch (_via_current_shape) {
        case VIA_REGION_SHAPE.RECT: // Fall-through
        case VIA_REGION_SHAPE.CIRCLE: // Fall-through
        case VIA_REGION_SHAPE.ELLIPSE:
            // show_message('Press single click and drag mouse to draw ' +
            //              _via_current_shape + ' region');
            break;

        case VIA_REGION_SHAPE.POLYLINE:
        case VIA_REGION_SHAPE.POLYGON:
            _via_is_user_drawing_polygon = false;
            _via_current_polygon_region_id = -1;

            // show_message('[Enter] to finish, [Esc] to cancel, ' +
            //              '[Click] to define polygon/polyline vertices')
            break;

        case VIA_REGION_SHAPE.POINT:
            // show_message('Press single click to define points (or landmarks)');
            break;

        default:
            // show_message('Unknown shape selected!');
            break;
    }
}

// 모든 캔버스 사이즈 설정
set_all_canvas_size = (w, h) => {
    _via_img_canvas.height = h;
    _via_img_canvas.width = w;

    _via_reg_canvas.height = h;
    _via_reg_canvas.width = w;

    canvas_panel.style.height = h + 'px';
    canvas_panel.style.width = w + 'px';
}

// 모든 캔버스 스케일 설정
set_all_canvas_scale = (s) => {
    _via_img_ctx.scale(s, s);
    rect_select_ctx.scale(s, s);
    _via_reg_ctx.scale(s, s);
}

// 캔버스 보기
show_all_canvas = () => {
    canvas_panel.style.display = 'inline-flex';
}

// 캔버스 숨기기
hide_all_canvas = () => {
    canvas_panel.style.display = 'none';
}

// 누락된 영역 속성 계산
count_missing_region_attr = (img_id) => {
    var miss_region_attr_count = 0;
    var attr_count = Object.keys(_via_region_attributes).length;
    for (var i = 0; i < _via_img_metadata[img_id].regions.length; ++i) {
        var set_attr_count = Object.keys(_via_img_metadata[img_id].regions[i].region_attributes).length;
        miss_region_attr_count += (attr_count - set_attr_count);
    }
    return miss_region_attr_count;
}

// 누락된 파일 속성 계산
count_missing_file_attr = (img_id) => {
    return Object.keys(_via_file_attributes).length - Object.keys(_via_img_metadata[img_id].file_attributes).length;
}

// 모든 영역 선택 전환
toggle_all_regions_selection = (is_selected) => {
    for (var i = 0; i < _via_canvas_regions.length; ++i) {
        _via_canvas_regions[i].is_user_selected = is_selected;
        _via_img_metadata[_via_image_id].regions[i].is_user_selected = is_selected;
    }
    _via_is_all_region_selected = is_selected;
}

// 영역만 선택
select_only_region = (region_id) => {
    toggle_all_regions_selection(false);
    set_region_select_state(region_id, true);
    _via_is_region_selected = true;
    _via_user_sel_region_id = region_id;
}

// 영역 선택 상태 설정
set_region_select_state = (region_id, is_selected) => {
    _via_canvas_regions[region_id].is_user_selected = is_selected;
    _via_img_metadata[_via_image_id].regions[region_id].is_user_selected = is_selected;
}

//
// 이미지 클릭 핸들러
//

// // 더블클릭시 주석모드로 들어가기
// _via_reg_canvas.addEventListener('dblclick', function (e) {
//     _via_click_x0 = e.offsetX;
//     _via_click_y0 = e.offsetY;
//     var region_id = is_inside_region(_via_click_x0, _via_click_y0);

//     if (region_id !== -1) {
//         // user clicked inside a region, show attribute panel
//         if (!_via_is_reg_attr_panel_visible) {
//             toggle_reg_attr_panel();
//         }
//     }
// }, false);

// 사용자가 캔버스를 클릭
_via_reg_canvas.addEventListener('mousedown', function (e) {
    select_object_type();
    // console.log(_via_img_metadata)
    // console.log(_via_img_metadata.regions)
    _via_click_x0 = e.offsetX;
    _via_click_y0 = e.offsetY;
    _via_region_edge = is_on_region_corner(_via_click_x0, _via_click_y0);
    var region_id = is_inside_region(_via_click_x0, _via_click_y0);

    if (_via_is_region_selected) {
        // 사용자가 영역 경계를 클릭했는지 확인
        if (_via_region_edge[1] > 0) {
            if (!_via_is_user_resizing_region) {
                // 영역 크기 재설정
                if (_via_region_edge[0] !== _via_user_sel_region_id) {
                    _via_user_sel_region_id = _via_region_edge[0];
                }
                _via_is_user_resizing_region = true;
            }
        } else {
            var yes = is_inside_this_region(_via_click_x0,
                _via_click_y0,
                _via_user_sel_region_id);
            if (yes) {
                if (!_via_is_user_moving_region) {
                    _via_is_user_moving_region = true;
                    _via_region_click_x = _via_click_x0;
                    _via_region_click_y = _via_click_y0;
                }
            }
            if (region_id === -1) {
                // 모든 영역의 외부에 클릭
                _via_is_user_drawing_region = true;
                // 모든 영역 선택 취소
                _via_is_region_selected = false;
                _via_user_sel_region_id = -1;
                toggle_all_regions_selection(false);
            }
        }
    } else {
        if (region_id === -1) {
            // 영역 밖에서 클릭
            if (_via_current_shape !== VIA_REGION_SHAPE.POLYGON &&
                _via_current_shape !== VIA_REGION_SHAPE.POLYLINE &&
                _via_current_shape !== VIA_REGION_SHAPE.POINT) {
                // 경계 상자 그리기 이벤트
                _via_is_user_drawing_region = true;
            }
        } else {
            // 영역 안에서 클릭
            // (1) 영역 선택 또는 (2) 영역 그리기로 이어질 수 있음
            _via_is_user_drawing_region = true;
        }
    }
    e.preventDefault();
}, false);

// 다음 기능을 구현함:
//  - 새로운 영역 그리기 (폴리곤 포함)
//  - 기존 영역 이동 / 크기 조정 / 선택 / 선택 취소
_via_reg_canvas.addEventListener('mouseup', function (e) {
    _via_click_x1 = e.offsetX;
    _via_click_y1 = e.offsetY;

    var click_dx = Math.abs(_via_click_x1 - _via_click_x0);
    var click_dy = Math.abs(_via_click_y1 - _via_click_y0);

    load_object_list();

    // 사용자가 영역 이동을 완료했음을 나타냄
    if (_via_is_user_moving_region) {
        _via_is_user_moving_region = false;
        _via_reg_canvas.style.cursor = "default";

        var move_x = Math.round(_via_click_x1 - _via_region_click_x);
        var move_y = Math.round(_via_click_y1 - _via_region_click_y);

        if (Math.abs(move_x) > VIA_MOUSE_CLICK_TOL ||
            Math.abs(move_y) > VIA_MOUSE_CLICK_TOL) {

            var image_attr = _via_img_metadata[_via_image_id].regions[_via_user_sel_region_id]
                .shape_attributes;
            var canvas_attr = _via_canvas_regions[_via_user_sel_region_id].shape_attributes;

            switch (canvas_attr['name']) {
                case VIA_REGION_SHAPE.RECT:
                    var xnew = image_attr['x'] + Math.round(move_x * _via_canvas_scale);
                    var ynew = image_attr['y'] + Math.round(move_y * _via_canvas_scale);
                    image_attr['x'] = xnew;
                    image_attr['y'] = ynew;

                    canvas_attr['x'] = Math.round(image_attr['x'] / _via_canvas_scale);
                    canvas_attr['y'] = Math.round(image_attr['y'] / _via_canvas_scale);
                    break;

                case VIA_REGION_SHAPE.CIRCLE: // Fall-through
                case VIA_REGION_SHAPE.ELLIPSE: // Fall-through
                case VIA_REGION_SHAPE.POINT:
                    var cxnew = image_attr['cx'] + Math.round(move_x * _via_canvas_scale);
                    var cynew = image_attr['cy'] + Math.round(move_y * _via_canvas_scale);
                    image_attr['cx'] = cxnew;
                    image_attr['cy'] = cynew;

                    canvas_attr['cx'] = Math.round(image_attr['cx'] / _via_canvas_scale);
                    canvas_attr['cy'] = Math.round(image_attr['cy'] / _via_canvas_scale);
                    break;

                case VIA_REGION_SHAPE.POLYLINE: // handled by polygon
                case VIA_REGION_SHAPE.POLYGON:
                    var img_px = image_attr['all_points_x'];
                    var img_py = image_attr['all_points_y'];
                    for (var i = 0; i < img_px.length; ++i) {
                        img_px[i] = img_px[i] + Math.round(move_x * _via_canvas_scale);
                        img_py[i] = img_py[i] + Math.round(move_y * _via_canvas_scale);
                    }

                    var canvas_px = canvas_attr['all_points_x'];
                    var canvas_py = canvas_attr['all_points_y'];
                    for (var i = 0; i < canvas_px.length; ++i) {
                        canvas_px[i] = Math.round(img_px[i] / _via_canvas_scale);
                        canvas_py[i] = Math.round(img_py[i] / _via_canvas_scale);
                    }
                    break;
            }
        } else {
            // 사용자가 이미 선택한 영역을 클릭함을 나타냄.
            // 사용자가 이 영역 내에서 다른 중첩 영역을 선택하려는 의도를 나타낼 수 있음.

            // 중첩 된 영역의 문제를 해결하기 위해 오름차순과 내림차순으로 캔버스 영역을 횡단함.
            var nested_region_id = is_inside_region(_via_click_x0, _via_click_y0, true);
            if (nested_region_id >= 0 && nested_region_id !== _via_user_sel_region_id) {
                _via_user_sel_region_id = nested_region_id;
                _via_is_region_selected = true;
                _via_is_user_moving_region = false;

                // 사용자가 Shift 키를 누르지 않은 경우 다른 모든 영역 선택 취소
                if (!e.shiftKey) {
                    toggle_all_regions_selection(false);
                }
                set_region_select_state(nested_region_id, true);
            }
        }
        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();
        save_current_data_to_browser_cache();
        return;
    }

    // 사용자가 영역 크기 조정을 완료했음을 나타냄.
    if (_via_is_user_resizing_region) {
        // _via_click(x0,y0) to _via_click(x1,y1)
        _via_is_user_resizing_region = false;
        _via_reg_canvas.style.cursor = "default";

        // 영역 업데이트
        var region_id = _via_region_edge[0];
        var image_attr = _via_img_metadata[_via_image_id].regions[region_id].shape_attributes;
        var canvas_attr = _via_canvas_regions[region_id].shape_attributes;

        switch (canvas_attr['name']) {
            case VIA_REGION_SHAPE.RECT:
                var d = [canvas_attr['x'], canvas_attr['y'], 0, 0];
                d[2] = d[0] + canvas_attr['width'];
                d[3] = d[1] + canvas_attr['height'];

                var mx = _via_current_x;
                var my = _via_current_y;
                var preserve_aspect_ratio = false;

                // (mx, my)가 직사각형의 대각선을 연결하는 선에 놓 이도록 제한함.
                if (_via_is_ctrl_pressed) {
                    preserve_aspect_ratio = true;
                }

                rect_update_corner(_via_region_edge[1], d, mx, my, preserve_aspect_ratio);
                rect_standardize_coordinates(d);

                var w = Math.abs(d[2] - d[0]);
                var h = Math.abs(d[3] - d[1]);

                image_attr['x'] = Math.round(d[0] * _via_canvas_scale);
                image_attr['y'] = Math.round(d[1] * _via_canvas_scale);
                image_attr['width'] = Math.round(w * _via_canvas_scale);
                image_attr['height'] = Math.round(h * _via_canvas_scale);

                canvas_attr['x'] = Math.round(image_attr['x'] / _via_canvas_scale);
                canvas_attr['y'] = Math.round(image_attr['y'] / _via_canvas_scale);
                canvas_attr['width'] = Math.round(image_attr['width'] / _via_canvas_scale);
                canvas_attr['height'] = Math.round(image_attr['height'] / _via_canvas_scale);
                break;

            case VIA_REGION_SHAPE.CIRCLE:
                var dx = Math.abs(canvas_attr['cx'] - _via_current_x);
                var dy = Math.abs(canvas_attr['cy'] - _via_current_y);
                var new_r = Math.sqrt(dx * dx + dy * dy);

                image_attr['r'] = Math.round(new_r * _via_canvas_scale);
                canvas_attr['r'] = Math.round(image_attr['r'] / _via_canvas_scale);
                break;

            case VIA_REGION_SHAPE.ELLIPSE:
                var new_rx = canvas_attr['rx'];
                var new_ry = canvas_attr['ry'];
                var dx = Math.abs(canvas_attr['cx'] - _via_current_x);
                var dy = Math.abs(canvas_attr['cy'] - _via_current_y);

                switch (_via_region_edge[1]) {
                    case 5:
                        new_ry = dy;
                        break;

                    case 6:
                        new_rx = dx;
                        break;

                    default:
                        new_rx = dx;
                        new_ry = dy;
                        break;
                }

                image_attr['rx'] = Math.round(new_rx * _via_canvas_scale);
                image_attr['ry'] = Math.round(new_ry * _via_canvas_scale);

                canvas_attr['rx'] = Math.round(image_attr['rx'] / _via_canvas_scale);
                canvas_attr['ry'] = Math.round(image_attr['ry'] / _via_canvas_scale);
                break;

            case VIA_REGION_SHAPE.POLYLINE: // 다각형으로 처리
            case VIA_REGION_SHAPE.POLYGON:
                var moved_vertex_id = _via_region_edge[1] - VIA_POLYGON_RESIZE_VERTEX_OFFSET;

                var imx = Math.round(_via_current_x * _via_canvas_scale);
                var imy = Math.round(_via_current_y * _via_canvas_scale);
                image_attr['all_points_x'][moved_vertex_id] = imx;
                image_attr['all_points_y'][moved_vertex_id] = imy;
                canvas_attr['all_points_x'][moved_vertex_id] = Math.round(imx / _via_canvas_scale);
                canvas_attr['all_points_y'][moved_vertex_id] = Math.round(imy / _via_canvas_scale);

                if (moved_vertex_id === 0 && canvas_attr['name'] === VIA_REGION_SHAPE.POLYGON) {
                    // 우리가 경로를 닫기 위해 끝의 초기 지점이기 때문에
                    // 첫 번째와 마지막 정점을 모두 이동함.
                    var n = canvas_attr['all_points_x'].length;
                    image_attr['all_points_x'][n - 1] = imx;
                    image_attr['all_points_y'][n - 1] = imy;
                    canvas_attr['all_points_x'][n - 1] = Math.round(imx / _via_canvas_scale);
                    canvas_attr['all_points_y'][n - 1] = Math.round(imy / _via_canvas_scale);
                }
                break;
        }

        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();
        save_current_data_to_browser_cache();
        return;
    }

    // 한 번의 클릭을 나타냅니다 (= mousedown + mouseup)
    if (click_dx < VIA_MOUSE_CLICK_TOL || click_dy < VIA_MOUSE_CLICK_TOL) {
        // 사용자가 이미 다각형을 그리는 경우 클릭 할 때마다 새 점이 추가됨.
        if (_via_is_user_drawing_polygon) {
            var canvas_x0 = Math.round(_via_click_x0);
            var canvas_y0 = Math.round(_via_click_y0);

            // 클릭 한 지점이 첫 번째 지점에 가까운 지 확인
            var fx0 = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x'][
                0
            ];
            var fy0 = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_y'][
                0
            ];
            var dx = (fx0 - canvas_x0);
            var dy = (fy0 - canvas_y0);
            // @todo : 최소한 주어진 값을 갖도록 둘러싸인 다각형으로 구분 된 내부 영역에 대한 테스트를 추가함.
            if (Math.sqrt(dx * dx + dy * dy) <= VIA_POLYGON_VERTEX_MATCH_TOL &&
                _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x']
                .length >= 3) {
                // 사용자가 첫 번째 다각형 점을 클릭하여 경로를 닫았으며 다각형에 3 개 이상의 점이 정의되어 있음.
                _via_is_user_drawing_polygon = false;

                // _via_canvas_regions []에 저장된 모든 다각형 점 추가
                var all_points_x = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes[
                    'all_points_x'].slice(0);
                var all_points_y = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes[
                    'all_points_y'].slice(0);
                // 가까운 경로-최종 다각형 영역이 최소 4 개의 점을 포함하도록함.
                all_points_x.push(all_points_x[0]);
                all_points_y.push(all_points_y[0]);

                var canvas_all_points_x = [];
                var canvas_all_points_y = [];

                //var points_str = '';
                for (var i = 0; i < all_points_x.length; ++i) {
                    all_points_x[i] = Math.round(all_points_x[i] * _via_canvas_scale);
                    all_points_y[i] = Math.round(all_points_y[i] * _via_canvas_scale);

                    canvas_all_points_x[i] = Math.round(all_points_x[i] / _via_canvas_scale);
                    canvas_all_points_y[i] = Math.round(all_points_y[i] / _via_canvas_scale);

                    //points_str += all_points_x[i] + ' ' + all_points_y[i] + ',';
                }
                //points_str = points_str.substring(0, points_str.length-1); // remove last comma

                var polygon_region = new ImageRegion();
                polygon_region.region_attributes['object_type'] = _via_current_object_type
                polygon_region.shape_attributes['name'] = 'polygon';
                //polygon_region.shape_attributes['points'] = points_str;
                polygon_region.shape_attributes['all_points_x'] = all_points_x;
                polygon_region.shape_attributes['all_points_y'] = all_points_y;
                _via_current_polygon_region_id = _via_img_metadata[_via_image_id].regions.length;
                _via_img_metadata[_via_image_id].regions.push(polygon_region);

                // 캔버스 업데이트
                _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x'] =
                    canvas_all_points_x;
                _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_y'] =
                    canvas_all_points_y;

                // 새로 그린 영역이 자동으로 선택됨.
                select_only_region(_via_current_polygon_region_id);

                _via_current_polygon_region_id = -1;
                save_current_data_to_browser_cache();
            } else {
                // 사용자가 새 다각형 점을 클릭했음.
                _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x'].push(
                    canvas_x0);
                _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_y'].push(
                    canvas_y0);
            }
        } else {
            var region_id = is_inside_region(_via_click_x0, _via_click_y0);
            if (region_id >= 0) {
                // 첫 번째 클릭은 영역을 선택함.
                _via_user_sel_region_id = region_id;
                _via_is_region_selected = true;
                _via_is_user_moving_region = false;
                _via_is_user_drawing_region = false;

                // 사용자가 Shift 키를 누르지 않은 경우 다른 모든 영역 선택 취소
                if (!e.shiftKey) {
                    toggle_all_regions_selection(false);
                }
                set_region_select_state(region_id, true);
                //show_message('Click and drag to move or resize the selected region');
            } else {
                if (_via_is_user_drawing_region) {
                    // 모든 영역 선택 지우기
                    _via_is_user_drawing_region = false;
                    _via_is_region_selected = false;
                    toggle_all_regions_selection(false);
                } else {
                    switch (_via_current_shape) {
                        case VIA_REGION_SHAPE.POLYLINE: // POLYGON의 case에서 처리
                        case VIA_REGION_SHAPE.POLYGON:
                            // 사용자가 새 다각형의 첫 번째 지점을 클릭함.
                            _via_is_user_drawing_polygon = true;

                            var canvas_polygon_region = new ImageRegion();
                            canvas_polygon_region.region_attributes['object_type'] = _via_current_object_type
                            canvas_polygon_region.shape_attributes['name'] = _via_current_shape;
                            canvas_polygon_region.shape_attributes['all_points_x'] = [Math.round(
                                _via_click_x0)];
                            canvas_polygon_region.shape_attributes['all_points_y'] = [Math.round(
                                _via_click_y0)];
                            _via_canvas_regions.push(canvas_polygon_region);
                            _via_current_polygon_region_id = _via_canvas_regions.length - 1;
                            break;
                    }
                }
            }
        }
        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();
        return;
    }


    // 사용자가 새 영역 그리기를 완료했음을 나타냄.
    if (_via_is_user_drawing_region) {

        _via_is_user_drawing_region = false;

        var region_x0, region_y0, region_x1, region_y1;
        // (x0, y0)이 왼쪽 상단이고 (x1, y1)이 오른쪽 하단인지 확인함.
        if (_via_click_x0 < _via_click_x1) {
            region_x0 = _via_click_x0;
            region_x1 = _via_click_x1;
        } else {
            region_x0 = _via_click_x1;
            region_x1 = _via_click_x0;
        }

        if (_via_click_y0 < _via_click_y1) {
            region_y0 = _via_click_y0;
            region_y1 = _via_click_y1;
        } else {
            region_y0 = _via_click_y1;
            region_y1 = _via_click_y0;
        }

        var original_img_region = new ImageRegion();
        var canvas_img_region = new ImageRegion();
        var region_dx = Math.abs(region_x1 - region_x0);
        var region_dy = Math.abs(region_y1 - region_y0);

        // 새로 그린 영역이 자동으로 선택됨.
        toggle_all_regions_selection(false);
        original_img_region.is_user_selected = true;
        canvas_img_region.is_user_selected = true;
        _via_is_region_selected = true;
        _via_user_sel_region_id = _via_canvas_regions.length; // 새로운 영역의 id

        if (region_dx > VIA_REGION_MIN_DIM || region_dy > VIA_REGION_MIN_DIM) { // 0 희미한 영역 피하기
            switch (_via_current_shape) {
                case VIA_REGION_SHAPE.RECT:
                    var x = Math.round(region_x0 * _via_canvas_scale);
                    var y = Math.round(region_y0 * _via_canvas_scale);
                    var width = Math.round(region_dx * _via_canvas_scale);
                    var height = Math.round(region_dy * _via_canvas_scale);

                    original_img_region.region_attributes['object_type'] = _via_current_object_type
                    original_img_region.shape_attributes['name'] = 'rect';
                    original_img_region.shape_attributes['x'] = x;
                    original_img_region.shape_attributes['y'] = y;
                    original_img_region.shape_attributes['width'] = width;
                    original_img_region.shape_attributes['height'] = height;

                    canvas_img_region.region_attributes['object_type'] = _via_current_object_type
                    canvas_img_region.shape_attributes['name'] = 'rect';
                    canvas_img_region.shape_attributes['x'] = Math.round(x / _via_canvas_scale);
                    canvas_img_region.shape_attributes['y'] = Math.round(y / _via_canvas_scale);
                    canvas_img_region.shape_attributes['width'] = Math.round(width / _via_canvas_scale);
                    canvas_img_region.shape_attributes['height'] = Math.round(height / _via_canvas_scale);

                    _via_img_metadata[_via_image_id].regions.push(original_img_region);
                    _via_canvas_regions.push(canvas_img_region);
                    break;

                case VIA_REGION_SHAPE.CIRCLE:
                    var cx = Math.round(region_x0 * _via_canvas_scale);
                    var cy = Math.round(region_y0 * _via_canvas_scale);
                    var r = Math.round(Math.sqrt(region_dx * region_dx + region_dy * region_dy) *
                        _via_canvas_scale);

                        original_img_region.region_attributes['object_type'] = _via_current_object_type
                    original_img_region.shape_attributes['name'] = 'circle';
                    original_img_region.shape_attributes['cx'] = cx;
                    original_img_region.shape_attributes['cy'] = cy;
                    original_img_region.shape_attributes['r'] = r;

                    canvas_img_region.region_attributes['object_type'] = _via_current_object_type
                    canvas_img_region.shape_attributes['name'] = 'circle';
                    canvas_img_region.shape_attributes['cx'] = Math.round(cx / _via_canvas_scale);
                    canvas_img_region.shape_attributes['cy'] = Math.round(cy / _via_canvas_scale);
                    canvas_img_region.shape_attributes['r'] = Math.round(r / _via_canvas_scale);

                    _via_img_metadata[_via_image_id].regions.push(original_img_region);
                    _via_canvas_regions.push(canvas_img_region);
                    break;

                case VIA_REGION_SHAPE.ELLIPSE:
                    var cx = Math.round(region_x0 * _via_canvas_scale);
                    var cy = Math.round(region_y0 * _via_canvas_scale);
                    var rx = Math.round(region_dx * _via_canvas_scale);
                    var ry = Math.round(region_dy * _via_canvas_scale);

                    original_img_region.region_attributes['object_type'] = _via_current_object_type
                    original_img_region.shape_attributes['name'] = 'ellipse';
                    original_img_region.shape_attributes['cx'] = cx;
                    original_img_region.shape_attributes['cy'] = cy;
                    original_img_region.shape_attributes['rx'] = rx;
                    original_img_region.shape_attributes['ry'] = ry;

                    canvas_img_region.region_attributes['object_type'] = _via_current_object_type
                    canvas_img_region.shape_attributes['name'] = 'ellipse';
                    canvas_img_region.shape_attributes['cx'] = Math.round(cx / _via_canvas_scale);
                    canvas_img_region.shape_attributes['cy'] = Math.round(cy / _via_canvas_scale);
                    canvas_img_region.shape_attributes['rx'] = Math.round(rx / _via_canvas_scale);
                    canvas_img_region.shape_attributes['ry'] = Math.round(ry / _via_canvas_scale);

                    _via_img_metadata[_via_image_id].regions.push(original_img_region);
                    _via_canvas_regions.push(canvas_img_region);
                    break;

                case VIA_REGION_SHAPE.POLYLINE: // VIA_REGION_SHAPE.POLYGON case에서 처리
                case VIA_REGION_SHAPE.POLYGON:
                    // _via_is_user_drawing polygon에 의해 처리됨.
                    break;
            }
        } else {
            // show_message('Prevented accidental addition of a very small region.');
        }
        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();

        save_current_data_to_browser_cache();
        return;
    }
});

// 객체 JSON 저장
save_rect_json = () => {
    var agree = confirm('이전 페이지로 돌아가시겠습니까?')
    if (agree) {
        var thisdata = '';
    
        W_Data.find(element => {
            for (var i in element) {
                if (current_img_filename == element[i]['FILE_PATH']) {
                    thisdata = element[i]
                }
            }
        })
    
        console.log(thisdata)
        for ( let i = 0; i < _via_canvas_regions.length; i++ ) {       
            var human_result = thisdata['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)']
            human_result = JSON.parse(human_result)
        
            var rect_index = Object.keys(human_result).length
    
            human_result[rect_index] = {
                "pothole-x": (_via_canvas_regions[i].shape_attributes.x) * (1920 / _via_reg_canvas.width),
                "pothole-y": (_via_canvas_regions[i].shape_attributes.y) * (1080 / _via_reg_canvas.height),
                "pothole-width": (_via_canvas_regions[i].shape_attributes.width) * (1920 / _via_reg_canvas.width),
                "pothole-height": (_via_canvas_regions[i].shape_attributes.height) * (1080 / _via_reg_canvas.height),
            }
    
            thisdata['UTL_RAW.CAST_TO_VARCHAR2(HUMAN_RESULT)'] = JSON.stringify(human_result)
        }
        
        console.log(thisdata)
        alert('저장되었습니다.')

        Back();
    } else {
        return 0;
    }
}


// 객체 목록 생성
load_object_list = () => {
    var vcr_index = 0;
    if ( _via_canvas_regions.length !== vcr_index ) {
        // console.log(_via_canvas_regions)
        // console.log(_via_img_metadata)

        var vcr_html = '';

        for ( let i = 0; i < _via_canvas_regions.length; i++ ) {
            var vcr_id = i + 1

            if (_via_canvas_regions[i].shape_attributes.name == 'rect') {

                var x = (_via_canvas_regions[i].shape_attributes.x) * (1920 / _via_reg_canvas.width)
                var y = (_via_canvas_regions[i].shape_attributes.y) * (1080 / _via_reg_canvas.height)
                var w = (_via_canvas_regions[i].shape_attributes.width) * (1920 / _via_reg_canvas.width)
                var h = (_via_canvas_regions[i].shape_attributes.height) * (1080 / _via_reg_canvas.height)
                
                vcr_html += 
                '<div id="' + _via_canvas_regions[i].region_attributes.object_type + '_' + i + '" class="wrapper" onclick="select_object(this)">' + 
                        '<table border="0">' +
                            '<tr>' +
                                '<td class="ObjTilte" colspan="4">포트홀 ' + vcr_id + '</td>' +
                            '</tr>' +
                            '<tr>' +
                                '<td style="width: 30%">X 좌표</td>' +
                                '<td style="width: 20%">' + x.toFixed(2) + '</td>' +
                                '<td style="width: 30%">Y 좌표</td>' +
                                '<td style="width: 20%">' + y.toFixed(2) + '</td>' +
                            '</tr>' +
                            '<tr>' +
                                '<td style="width: 30%">가로 길이</td>' +
                                '<td style="width: 20%">' + w.toFixed(2) + '</td>' +
                                '<td style="width: 30%">세로 길이</td>' +
                                '<td style="width: 20%">' + h.toFixed(2) + '</td>' +
                            '</tr>' +
                        '</table>' +
                '</div>'            
            }
        }
        InnerHtml(ObjScrollBox, vcr_html)
        vcr_index += 1
        vcr_html = '';
    }
}

// 객체 선택
select_object = (e) => {
    var index = e.id.split('_');

    select_only_region(index[1]);
}

_via_reg_canvas.addEventListener("mouseover", function (e) {
    // 마우스 커서 아이콘 변경
    _via_redraw_reg_canvas();
    _via_reg_canvas.focus();
});
    
_via_reg_canvas.addEventListener('mousemove', function (e) {
    if (!_via_current_image_loaded) {
        return;
    }

    _via_current_x = e.offsetX;
    _via_current_y = e.offsetY;

    if (_via_is_region_selected) {
        if (!_via_is_user_resizing_region) {
            // 사용자가 마우스 커서를 영역 크기 조정 의도를 나타내는 영역 경계로 이동했는지 확인

            _via_region_edge = is_on_region_corner(_via_current_x, _via_current_y);

            if (_via_region_edge[0] === _via_user_sel_region_id) {
                switch (_via_region_edge[1]) {
                    // 직사각형
                    case 1: // Fall-through // 직사각형의 왼쪽 상단 모서리
                    case 3: // 직사각형의 오른쪽 하단 모서리
                        _via_reg_canvas.style.cursor = "nwse-resize";
                        break;
                    case 2: // Fall-through // 직사각형의 오른쪽 상단 모서리
                    case 4: // 직사각형의 왼쪽 하단 모서리
                        _via_reg_canvas.style.cursor = "nesw-resize";
                        break;

                    case 5: // Fall-through // 직사각형의 상단 중간 지점
                    case 7: // 직사각형의 하단 중간 지점
                        _via_reg_canvas.style.cursor = "ns-resize";
                        break;
                    case 6: // Fall-through // 직사각형의 상단 중간 지점
                    case 8: // 직사각형의 하단 중간 지점
                        _via_reg_canvas.style.cursor = "ew-resize";
                        break;

                        // 원과 타원
                    case 5:
                        _via_reg_canvas.style.cursor = "n-resize";
                        break;
                    case 6:
                        _via_reg_canvas.style.cursor = "e-resize";
                        break;

                    default:
                        _via_reg_canvas.style.cursor = "default";
                        break;
                }

                if (_via_region_edge[1] >= VIA_POLYGON_RESIZE_VERTEX_OFFSET) {
                    // 다각형 정점 위에 마우스를 놓음.
                    _via_reg_canvas.style.cursor = "crosshair";
                }
            } else {
                var yes = is_inside_this_region(_via_current_x,
                    _via_current_y,
                    _via_user_sel_region_id);
                if (yes) {
                    _via_reg_canvas.style.cursor = "move";
                } else {
                    _via_reg_canvas.style.cursor = "default";
                }
            }
        }
    }

    if (_via_is_user_drawing_region) {
        // 사용자가 마우스 커서를 끌 때 영역 그리기
        if (_via_canvas_regions.length) {
            _via_redraw_reg_canvas(); // 오래된 중간 직사각형 지우기
        } else {
            // 그려지는 첫 번째 영역, 전체 영역 캔버스를 지우기
            _via_reg_ctx.clearRect(0, 0, _via_reg_canvas.width, _via_reg_canvas.height);
        }

        var region_x0, region_y0;

        if (_via_click_x0 < _via_current_x) {
            if (_via_click_y0 < _via_current_y) {
                region_x0 = _via_click_x0;
                region_y0 = _via_click_y0;
            } else {
                region_x0 = _via_click_x0;
                region_y0 = _via_current_y;
            }
        } else {
            if (_via_click_y0 < _via_current_y) {
                region_x0 = _via_current_x;
                region_y0 = _via_click_y0;
            } else {
                region_x0 = _via_current_x;
                region_y0 = _via_current_y;
            }
        }
        var dx = Math.round(Math.abs(_via_current_x - _via_click_x0));
        var dy = Math.round(Math.abs(_via_current_y - _via_click_y0));

        switch (_via_current_shape) {
            case VIA_REGION_SHAPE.RECT:
                _via_draw_rect_region(region_x0, region_y0, dx, dy, false);
                break;

            case VIA_REGION_SHAPE.CIRCLE:
                var circle_radius = Math.round(Math.sqrt(dx * dx + dy * dy));
                _via_draw_circle_region(region_x0, region_y0, circle_radius, false);
                break;

            case VIA_REGION_SHAPE.ELLIPSE:
                _via_draw_ellipse_region(region_x0, region_y0, dx, dy, false);
                break;

            case VIA_REGION_SHAPE.POLYGON:
                // this is handled by the if ( _via_is_user_drawing_polygon ) { ... }
                // see below
                break;
        }
        _via_reg_canvas.focus();
    }

    if (_via_is_user_resizing_region) {
        // 사용자가 경계 상자 가장자리에서 마우스를 클릭했으며 
        // 이제 사용자가 마우스 커서를 드래그 할 때 그리기 영역을 이동하고 있음.
        if (_via_canvas_regions.length) {
            _via_redraw_reg_canvas(); // 오래된 중간 직사각형 지우기
        } else {
            // 그려지는 첫 번째 영역, 전체 영역 캔버스를 지우기
            _via_reg_ctx.clearRect(0, 0, _via_reg_canvas.width, _via_reg_canvas.height);
        }

        var region_id = _via_region_edge[0];
        var attr = _via_canvas_regions[region_id].shape_attributes;
        console.log(attr)
        switch (attr['name']) {
            case VIA_REGION_SHAPE.RECT:
                // original rectangle
                var d = [attr['x'], attr['y'], 0, 0];
                d[2] = d[0] + attr['width'];
                d[3] = d[1] + attr['height'];

                var mx = _via_current_x;
                var my = _via_current_y;
                var preserve_aspect_ratio = false;
                // constrain (mx,my) to lie on a line connecting a diagonal of rectangle
                if (_via_is_ctrl_pressed) {
                    preserve_aspect_ratio = true;
                }

                rect_update_corner(_via_region_edge[1], d, mx, my, preserve_aspect_ratio);
                rect_standardize_coordinates(d);

                var w = Math.abs(d[2] - d[0]);
                var h = Math.abs(d[3] - d[1]);
                _via_draw_rect_region(d[0], d[1], w, h, true);
                break;

            case VIA_REGION_SHAPE.CIRCLE:
                var dx = Math.abs(attr['cx'] - _via_current_x);
                var dy = Math.abs(attr['cy'] - _via_current_y);
                var new_r = Math.sqrt(dx * dx + dy * dy);
                _via_draw_circle_region(attr['cx'],
                    attr['cy'],
                    new_r,
                    true);
                break;

            case VIA_REGION_SHAPE.ELLIPSE:
                var new_rx = attr['rx'];
                var new_ry = attr['ry'];
                var dx = Math.abs(attr['cx'] - _via_current_x);
                var dy = Math.abs(attr['cy'] - _via_current_y);
                switch (_via_region_edge[1]) {
                    case 5:
                        new_ry = dy;
                        break;

                    case 6:
                        new_rx = dx;
                        break;

                    default:
                        new_rx = dx;
                        new_ry = dy;
                        break;
                }
                _via_draw_ellipse_region(attr['cx'],
                    attr['cy'],
                    new_rx,
                    new_ry,
                    true);
                break;

            case VIA_REGION_SHAPE.POLYLINE: // polygon에서  처리
            case VIA_REGION_SHAPE.POLYGON:
                var moved_all_points_x = attr['all_points_x'].slice(0);
                var moved_all_points_y = attr['all_points_y'].slice(0);
                var moved_vertex_id = _via_region_edge[1] - VIA_POLYGON_RESIZE_VERTEX_OFFSET;

                moved_all_points_x[moved_vertex_id] = _via_current_x;
                moved_all_points_y[moved_vertex_id] = _via_current_y;

                if (moved_vertex_id === 0 && attr['name'] === VIA_REGION_SHAPE.POLYGON) {
                    // move both first and last vertex because we
                    // the initial point at the end to close path
                    moved_all_points_x[moved_all_points_x.length - 1] = _via_current_x;
                    moved_all_points_y[moved_all_points_y.length - 1] = _via_current_y;
                }
                _via_draw_polygon_region(moved_all_points_x,
                    moved_all_points_y,
                    true);
                break;
        }
        _via_reg_canvas.focus();
    }

    if (_via_is_user_moving_region) {
        // 사용자가 마우스 커서를 끌 때 영역 그리기
        if (_via_canvas_regions.length) {
            _via_redraw_reg_canvas(); // 오래된 중간 직사각형 지우기
        } else {
            // 그려지는 첫 번째 영역, 전체 영역 캔버스를 지우기
            _via_reg_ctx.clearRect(0, 0, _via_reg_canvas.width, _via_reg_canvas.height);
        }

        var move_x = (_via_current_x - _via_region_click_x);
        var move_y = (_via_current_y - _via_region_click_y);
        var attr = _via_canvas_regions[_via_user_sel_region_id].shape_attributes;

        switch (attr['name']) {
            case VIA_REGION_SHAPE.RECT:
                _via_draw_rect_region(attr['x'] + move_x,
                    attr['y'] + move_y,
                    attr['width'],
                    attr['height'],
                    true);
                break;

            case VIA_REGION_SHAPE.CIRCLE:
                _via_draw_circle_region(attr['cx'] + move_x,
                    attr['cy'] + move_y,
                    attr['r'],
                    true);
                break;

            case VIA_REGION_SHAPE.ELLIPSE:
                _via_draw_ellipse_region(attr['cx'] + move_x,
                    attr['cy'] + move_y,
                    attr['rx'],
                    attr['ry'],
                    true);
                break;

            case VIA_REGION_SHAPE.POLYLINE: // polygon에서 처리
            case VIA_REGION_SHAPE.POLYGON:
                var moved_all_points_x = attr['all_points_x'].slice(0);
                var moved_all_points_y = attr['all_points_y'].slice(0);
                for (var i = 0; i < moved_all_points_x.length; ++i) {
                    moved_all_points_x[i] += move_x;
                    moved_all_points_y[i] += move_y;
                }
                _via_draw_polygon_region(moved_all_points_x,
                    moved_all_points_y,
                    true);
                break;

            case VIA_REGION_SHAPE.POINT:
                _via_draw_point_region(attr['cx'] + move_x,
                    attr['cy'] + move_y,
                    true);
                break;
        }
        _via_reg_canvas.focus();
        return;
    }

    if (_via_is_user_drawing_polygon) {
        _via_redraw_reg_canvas();
        var attr = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes;
        var all_points_x = attr['all_points_x'];
        var all_points_y = attr['all_points_y'];
        var npts = all_points_x.length;

        var line_x = [all_points_x.slice(npts - 1), _via_current_x];
        var line_y = [all_points_y.slice(npts - 1), _via_current_y];
        _via_draw_polygon_region(line_x, line_y, false);
    }

    draw_guide_lines(_via_current_x, _via_current_y);
});

// 마우스 가이드 라인
draw_guide_lines = (x, y) => {
    _via_img_ctx.strokeStyle = '#FFC633';
    _via_img_ctx.lineWidth = 1.5;
    _via_redraw_img_canvas()
    draw_guide_lines_x(y)
    draw_guide_lines_y(x)
}

// 가로선 그리기
draw_guide_lines_x = (y) => {
    _via_img_ctx.beginPath();
    _via_img_ctx.moveTo(0, y + 0.5);
    _via_img_ctx.lineTo(_via_img_ctx.canvas.width, y + 0.5);
    _via_img_ctx.stroke();
}

// 세로선 그리기
draw_guide_lines_y = (x) => {
    _via_img_ctx.beginPath();
    _via_img_ctx.moveTo(x + 0.5, 0);
    _via_img_ctx.lineTo(x + 0.5, _via_img_ctx.canvas.height);
    _via_img_ctx.stroke();
}

//
// 캔버스 업데이트 루틴
//

// 객체 종류 정하기
select_object_type = () => {
    for (let i = 0; i < SelectedObj.length; i++) {
        if (SelectedObj[i].checked == true) {
            // console.log("check!")
            var id = SelectedObj[i].id;
            color = document.getElementById(id+"_Color");

            color = color.style.backgroundColor;
            VIA_THEME_BOUNDARY_LINE_COLOR = color;
            VIA_THEME_BOUNDARY_Fill_COLOR = color;
            VIA_THEME_SEL_REGION_FILL_BOUNDARY_COLOR = color;
        }
    }
}

// 이미지 캔버스 다시 그리기
_via_redraw_img_canvas = () => {
    if (_via_current_image_loaded) {
        _via_img_ctx.clearRect(0, 0, _via_img_canvas.width, _via_img_canvas.height);
        _via_img_ctx.drawImage(_via_current_image, 0, 0,
            _via_img_canvas.width, _via_img_canvas.height);
    }
}

//영역 캔버스 다시 그리기
_via_redraw_reg_canvas = () => {
    if (_via_current_image_loaded) {
        if (_via_canvas_regions.length > 0) {
            _via_reg_ctx.clearRect(0, 0, _via_reg_canvas.width, _via_reg_canvas.height);
            if (_via_is_region_boundary_visible) {
                draw_all_regions();
            }

            if (_via_is_region_id_visible) {
                draw_all_region_id();
            }
        }
    }
}

// 영역 캔버스 지우기
_via_clear_reg_canvas = () => {
    _via_reg_ctx.clearRect(0, 0, _via_reg_canvas.width, _via_reg_canvas.height);
}

// 모든 영역 그리기
draw_all_regions = () => {
    for (var i = 0; i < _via_canvas_regions.length; ++i) {
        var r_attr = _via_canvas_regions[i].region_attributes;

        switch (r_attr['object_type']) {
            case VIA_OBJECT_TYPE.PotHole:
                draw_shape(i, 'yellow')
                break;
            case VIA_OBJECT_TYPE.Manhole:
                draw_shape(i, '#FF7F27')
                break;
            case VIA_OBJECT_TYPE.Sel3:
                draw_shape(i, '#FFF200')
                break;
            case VIA_OBJECT_TYPE.Sel4:
                draw_shape(i, '#00A2E8')
                break;
            case VIA_OBJECT_TYPE.Sel5:
                draw_shape(i, '#A349A4')
                break;
            case VIA_OBJECT_TYPE.Sel6:
                draw_shape(i, '#FFAEC9')
                break;
        }
    }
}

draw_shape = (i, color) => {
    var attr = _via_canvas_regions[i].shape_attributes;
    var is_selected = _via_canvas_regions[i].is_user_selected;

    switch (attr['name']) {
        case VIA_REGION_SHAPE.RECT:
            _via_draw_rect_region(attr['x'],
                attr['y'],
                attr['width'],
                attr['height'],
                is_selected,
                color);
            break;

        case VIA_REGION_SHAPE.CIRCLE:
            _via_draw_circle_region(attr['cx'],
                attr['cy'],
                attr['r'],
                is_selected,
                color);
            break;

        case VIA_REGION_SHAPE.ELLIPSE:
            _via_draw_ellipse_region(attr['cx'],
                attr['cy'],
                attr['rx'],
                attr['ry'],
                is_selected,
                color);
            break;

        case VIA_REGION_SHAPE.POLYLINE: // polygon에서 처리
        case VIA_REGION_SHAPE.POLYGON:
            _via_draw_polygon_region(attr['all_points_x'],
                attr['all_points_y'],
                is_selected,
                color);
            break;

        case VIA_REGION_SHAPE.POINT:
            _via_draw_point_region(attr['cx'],
                attr['cy'],
                is_selected,
                color);
            break;
    }
}

// 영역 경계 크기 조정을위한 제어점.
// 제어점 그리기
_via_draw_control_point = (cx, cy) => {
    _via_reg_ctx.beginPath();
    _via_reg_ctx.arc(cx, cy, VIA_REGION_POINT_RADIUS, 0, 2 * Math.PI, false);
    _via_reg_ctx.closePath();

    _via_reg_ctx.fillStyle = VIA_THEME_CONTROL_POINT_COLOR;
    _via_reg_ctx.globalAlpha = 1.0;
    _via_reg_ctx.fill();
}

// 직사각형 영역 그리기
_via_draw_rect_region = (x, y, w, h, is_selected, color) => {
    if (is_selected) {
        _via_draw_rect(x, y, w, h);

        _via_reg_ctx.strokeStyle = VIA_THEME_SEL_REGION_FILL_BOUNDARY_COLOR;
        _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 2;
        _via_reg_ctx.stroke();

        _via_reg_ctx.fillStyle = VIA_THEME_SEL_REGION_FILL_COLOR;
        _via_reg_ctx.globalAlpha = VIA_THEME_SEL_REGION_OPACITY;
        _via_reg_ctx.fill();
        _via_reg_ctx.globalAlpha = 1.0;

        _via_draw_control_point(x, y);
        _via_draw_control_point(x + w, y + h);
        _via_draw_control_point(x, y + h);
        _via_draw_control_point(x + w, y);
        _via_draw_control_point(x + w / 2, y);
        _via_draw_control_point(x + w / 2, y + h);
        _via_draw_control_point(x, y + h / 2);
        _via_draw_control_point(x + w, y + h / 2);
    } else {
        // 채우기 선 그리기.
        _via_reg_ctx.strokeStyle = color;
        _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 2;
        _via_draw_rect(x, y, w, h);
        _via_reg_ctx.stroke();
    }
}

// 직사각형 그리기
_via_draw_rect = (x, y, w, h) => {
    _via_reg_ctx.beginPath();
    _via_reg_ctx.moveTo(x, y);
    _via_reg_ctx.lineTo(x + w, y);
    _via_reg_ctx.lineTo(x + w, y + h);
    _via_reg_ctx.lineTo(x, y + h);
    _via_reg_ctx.closePath();
}

// 원형 영역 그리기
_via_draw_circle_region = (cx, cy, r, is_selected, color) => {
    if (is_selected) {
        _via_draw_circle(cx, cy, r);

        _via_reg_ctx.strokeStyle = VIA_THEME_SEL_REGION_FILL_BOUNDARY_COLOR;
        _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 2;
        _via_reg_ctx.stroke();

        _via_reg_ctx.fillStyle = VIA_THEME_SEL_REGION_FILL_COLOR;
        _via_reg_ctx.globalAlpha = VIA_THEME_SEL_REGION_OPACITY;
        _via_reg_ctx.fill();
        _via_reg_ctx.globalAlpha = 1.0;

        _via_draw_control_point(cx + r, cy);
    } else {
        // 채우기 선 그리기
        _via_reg_ctx.strokeStyle = color;
        _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 2;
        _via_draw_circle(cx, cy, r);
        _via_reg_ctx.stroke();
    }
}

// 원형 그리기
_via_draw_circle = (cx, cy, r) => {
    _via_reg_ctx.beginPath();
    _via_reg_ctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
    _via_reg_ctx.closePath();
}

// 타원 영역 그리기
_via_draw_ellipse_region = (cx, cy, rx, ry, is_selected, color) => {
    if (is_selected) {
        _via_draw_ellipse(cx, cy, rx, ry);

        _via_reg_ctx.strokeStyle = VIA_THEME_SEL_REGION_FILL_BOUNDARY_COLOR;
        _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 2;
        _via_reg_ctx.stroke();

        _via_reg_ctx.fillStyle = VIA_THEME_SEL_REGION_FILL_COLOR;
        _via_reg_ctx.globalAlpha = VIA_THEME_SEL_REGION_OPACITY;
        _via_reg_ctx.fill();
        _via_reg_ctx.globalAlpha = 1.0;

        _via_draw_control_point(cx + rx, cy);
        _via_draw_control_point(cx, cy - ry);
    } else {
        // 채우기 선 그리기
        _via_reg_ctx.strokeStyle = color;
        _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 2;
        _via_draw_ellipse(cx, cy, rx, ry);
        _via_reg_ctx.stroke();
    }
}

// 타원 그리기
_via_draw_ellipse = (cx, cy, rx, ry) => {
    _via_reg_ctx.save();

    _via_reg_ctx.beginPath();
    _via_reg_ctx.translate(cx - rx, cy - ry);
    _via_reg_ctx.scale(rx, ry);
    _via_reg_ctx.arc(1, 1, 1, 0, 2 * Math.PI, false);

    _via_reg_ctx.restore(); // 원래 상태로 복원
    _via_reg_ctx.closePath();

}

// 다각형 영역 그리기
_via_draw_polygon_region = (all_points_x, all_points_y, is_selected, color) => {
    if (is_selected) {
        _via_reg_ctx.beginPath();
        _via_reg_ctx.moveTo(all_points_x[0], all_points_y[0]);

        for (var i = 1; i < all_points_x.length; ++i) {
            _via_reg_ctx.lineTo(all_points_x[i], all_points_y[i]);
        }

        _via_reg_ctx.strokeStyle = VIA_THEME_SEL_REGION_FILL_BOUNDARY_COLOR;
        _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 2;
        _via_reg_ctx.stroke();

        _via_reg_ctx.fillStyle = VIA_THEME_SEL_REGION_FILL_COLOR;
        _via_reg_ctx.globalAlpha = VIA_THEME_SEL_REGION_OPACITY;
        _via_reg_ctx.fill();
        _via_reg_ctx.globalAlpha = 1.0;

        for (var i = 0; i < all_points_x.length; ++i) {
            _via_draw_control_point(all_points_x[i], all_points_y[i]);
        }
    } else {
        for (var i = 1; i < all_points_x.length; ++i) {
            // 채우기 선 그리기
            _via_reg_ctx.strokeStyle = color;
            _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 2;
            _via_reg_ctx.beginPath();
            _via_reg_ctx.moveTo(all_points_x[i - 1], all_points_y[i - 1]);
            _via_reg_ctx.lineTo(all_points_x[i], all_points_y[i]);
            _via_reg_ctx.stroke();

            var slope_i = (all_points_y[i] - all_points_y[i - 1]) / (all_points_x[i] - all_points_x[i - 1]);
            if (slope_i > 0) {
                // 양쪽에 경계선을 그림.
                _via_reg_ctx.strokeStyle = color;
                _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 4;
                _via_reg_ctx.beginPath();
                _via_reg_ctx.moveTo(parseInt(all_points_x[i - 1]) - parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4),
                    parseInt(all_points_y[i - 1]) + parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4));
                _via_reg_ctx.lineTo(parseInt(all_points_x[i]) - parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4),
                    parseInt(all_points_y[i]) + parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4));
                _via_reg_ctx.stroke();
                _via_reg_ctx.beginPath();
                _via_reg_ctx.moveTo(parseInt(all_points_x[i - 1]) + parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4),
                    parseInt(all_points_y[i - 1]) - parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4));
                _via_reg_ctx.lineTo(parseInt(all_points_x[i]) + parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4),
                    parseInt(all_points_y[i]) - parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4));
                _via_reg_ctx.stroke();
            } else {
                // 양쪽의 경계선을 그림.
                _via_reg_ctx.strokeStyle = color;
                _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 4;
                _via_reg_ctx.beginPath();
                _via_reg_ctx.moveTo(parseInt(all_points_x[i - 1]) + parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4),
                    parseInt(all_points_y[i - 1]) + parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4));
                _via_reg_ctx.lineTo(parseInt(all_points_x[i]) + parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4),
                    parseInt(all_points_y[i]) + parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4));
                _via_reg_ctx.stroke();
                _via_reg_ctx.beginPath();
                _via_reg_ctx.moveTo(parseInt(all_points_x[i - 1]) - parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4),
                    parseInt(all_points_y[i - 1]) - parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4));
                _via_reg_ctx.lineTo(parseInt(all_points_x[i]) - parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4),
                    parseInt(all_points_y[i]) - parseInt(VIA_THEME_REGION_BOUNDARY_WIDTH / 4));
                _via_reg_ctx.stroke();
            }
        }
    }
}

// 포인트 영역 그리기
_via_draw_point_region = (cx, cy, is_selected) => {
    if (is_selected) {
        _via_draw_point(cx, cy, VIA_REGION_POINT_RADIUS);

        _via_reg_ctx.strokeStyle = VIA_THEME_SEL_REGION_FILL_BOUNDARY_COLOR;
        _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 2;
        _via_reg_ctx.stroke();

        _via_reg_ctx.fillStyle = VIA_THEME_SEL_REGION_FILL_COLOR;
        _via_reg_ctx.globalAlpha = VIA_THEME_SEL_REGION_OPACITY;
        _via_reg_ctx.fill();
        _via_reg_ctx.globalAlpha = 1.0;
    } else {
        // 채우기 선 그리기
        _via_reg_ctx.strokeStyle = VIA_THEME_BOUNDARY_FILL_COLOR;
        _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 2;
        _via_draw_point(cx, cy, VIA_REGION_POINT_RADIUS);
        _via_reg_ctx.stroke();

        // 채우기 선의 양쪽에 경계선을 그림.
        _via_reg_ctx.strokeStyle = VIA_THEME_BOUNDARY_LINE_COLOR;
        _via_reg_ctx.lineWidth = VIA_THEME_REGION_BOUNDARY_WIDTH / 4;
        _via_draw_point(cx, cy,
            VIA_REGION_POINT_RADIUS - VIA_THEME_REGION_BOUNDARY_WIDTH / 2);
        _via_reg_ctx.stroke();
        _via_draw_point(cx, cy,
            VIA_REGION_POINT_RADIUS + VIA_THEME_REGION_BOUNDARY_WIDTH / 2);
        _via_reg_ctx.stroke();
    }
}

// 포인트 그리기
_via_draw_point = (cx, cy, r) => {
    _via_reg_ctx.beginPath();
    _via_reg_ctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
    _via_reg_ctx.closePath();
}

// 모든 영역 이름 그리기
draw_all_region_id = () => {
    _via_reg_ctx.shadowColor = "transparent";
    for (var i = 0; i < _via_img_metadata[_via_image_id].regions.length; ++i) {
        var canvas_reg = _via_canvas_regions[i];

        var bbox = get_region_bounding_box(canvas_reg);
        var x = bbox[0];
        var y = bbox[1];
        var w = Math.abs(bbox[2] - bbox[0]);
        _via_reg_ctx.font = VIA_THEME_ATTRIBUTE_VALUE_FONT;

        var annotation_str = (i + 1).toString();
        var bgnd_rect_width = _via_reg_ctx.measureText(annotation_str).width;

        var char_width = _via_reg_ctx.measureText('M').width;
        var char_height = 1.8 * char_width;

        var r = _via_img_metadata[_via_image_id].regions[i].region_attributes;
        if (Object.keys(r).length === 1) {
            // 속성 값 표시
            for (var key in r) {
                annotation_str = r[key] + (i + 1).toString();
            }
            var strw = _via_reg_ctx.measureText(annotation_str).width;

            bgnd_rect_width = (strw + char_width) * 0.9;
        }

        if (canvas_reg.shape_attributes['name'] === VIA_REGION_SHAPE.POLYGON ||
            canvas_reg.shape_attributes['name'] === VIA_REGION_SHAPE.POLYLINE) {
            // 첫 번째 정점 근처에 레이블을 배치
            x = canvas_reg.shape_attributes['all_points_x'][0];
            y = canvas_reg.shape_attributes['all_points_y'][0];
        } else {
            // 라벨의 중앙
            x = x - (bgnd_rect_width / 2 - w / 2);
        }

        // 먼저 배경 사각형을 먼저 그림.
        _via_reg_ctx.fillStyle = 'black';
        _via_reg_ctx.globalAlpha = 0.9;
        _via_reg_ctx.fillRect(Math.floor(x),
            Math.floor(y - 1.1 * char_height),
            Math.floor(bgnd_rect_width),
            Math.floor(char_height));

        // 그런 다음, 배경 사각형 위에 텍스트를 그립니다
        _via_reg_ctx.globalAlpha = 1.0;
        _via_reg_ctx.fillStyle = '#A4E87F';
        _via_reg_ctx.font = '13px Noto Sans KR'
        _via_reg_ctx.fillText(annotation_str,
            Math.floor(x + 0.4 * char_width),
            Math.floor(y - 0.35 * char_height));

    }
}

// 영역 경계 상자 가져 오기
get_region_bounding_box = (region) => {
    var d = region.shape_attributes;
    var bbox = new Array(4);

    switch (d['name']) {
        case 'rect':
            bbox[0] = d['x'];
            bbox[1] = d['y'];
            bbox[2] = d['x'] + d['width'];
            bbox[3] = d['y'] + d['height'];
            break;

        case 'circle':
            bbox[0] = d['cx'] - d['r'];
            bbox[1] = d['cy'] - d['r'];
            bbox[2] = d['cx'] + d['r'];
            bbox[3] = d['cy'] + d['r'];
            break;

        case 'ellipse':
            bbox[0] = d['cx'] - d['rx'];
            bbox[1] = d['cy'] - d['ry'];
            bbox[2] = d['cx'] + d['rx'];
            bbox[3] = d['cy'] + d['ry'];
            break;

        case 'polyline': // handled by polygon
        case 'polygon':
            var all_points_x = d['all_points_x'];
            var all_points_y = d['all_points_y'];

            var minx = Number.MAX_SAFE_INTEGER;
            var miny = Number.MAX_SAFE_INTEGER;
            var maxx = 0;
            var maxy = 0;
            for (var i = 0; i < all_points_x.length; ++i) {
                if (all_points_x[i] < minx) {
                    minx = all_points_x[i];
                }
                if (all_points_x[i] > maxx) {
                    maxx = all_points_x[i];
                }
                if (all_points_y[i] < miny) {
                    miny = all_points_y[i];
                }
                if (all_points_y[i] > maxy) {
                    maxy = all_points_y[i];
                }
            }
            bbox[0] = minx;
            bbox[1] = miny;
            bbox[2] = maxx;
            bbox[3] = maxy;
            break;

        case 'point':
            bbox[0] = d['cx'] - VIA_REGION_POINT_RADIUS;
            bbox[1] = d['cy'] - VIA_REGION_POINT_RADIUS;
            bbox[2] = d['cx'] + VIA_REGION_POINT_RADIUS;
            bbox[3] = d['cy'] + VIA_REGION_POINT_RADIUS;
            break;
    }
    return bbox;
}

//
// 영역 충돌 루틴
//

// 영역 내부
is_inside_region = (px, py, descending_order) => {
    var N = _via_canvas_regions.length;
    if (N === 0) {
        return -1;
    }
    var start, end, del;
    // 중첩 된 영역의 문제를 해결하기 위해 오름차순과 내림차순으로 캔버스 영역을 횡단함.
    if (descending_order) {
        start = N - 1;
        end = -1;
        del = -1;
    } else {
        start = 0;
        end = N;
        del = 1;
    }

    var i = start;
    while (i !== end) {
        var yes = is_inside_this_region(px, py, i);
        if (yes) {
            return i;
        }
        i = i + del;
    }
    return -1;
}

// 이 영역 안에 있음.
is_inside_this_region = (px, py, region_id) => {
    var attr = _via_canvas_regions[region_id].shape_attributes;
    var result = false;
    switch (attr['name']) {
        case VIA_REGION_SHAPE.RECT:
            result = is_inside_rect(attr['x'],
                attr['y'],
                attr['width'],
                attr['height'],
                px, py);
            break;

        case VIA_REGION_SHAPE.CIRCLE:
            result = is_inside_circle(attr['cx'],
                attr['cy'],
                attr['r'],
                px, py);
            break;

        case VIA_REGION_SHAPE.ELLIPSE:
            result = is_inside_ellipse(attr['cx'],
                attr['cy'],
                attr['rx'],
                attr['ry'],
                px, py);
            break;

        case VIA_REGION_SHAPE.POLYLINE: // handled by POLYGON
        case VIA_REGION_SHAPE.POLYGON:
            result = is_inside_polygon(attr['all_points_x'],
                attr['all_points_y'],
                px, py);
            break;

        case VIA_REGION_SHAPE.POINT:
            result = is_inside_point(attr['cx'],
                attr['cy'],
                px, py);
            break;
    }
    return result;
}

// 직사각형 내부
is_inside_rect = (x, y, w, h, px, py) => {
    return px > x &&
        px < (x + w) &&
        py > y &&
        py < (y + h);
}

// 원형 내부
is_inside_circle = (cx, cy, r, px, py) => {
    var dx = px - cx;
    var dy = py - cy;
    return (dx * dx + dy * dy) < r * r;
}

// 타원 내부
is_inside_ellipse = (cx, cy, rx, ry, px, py) => {
    var dx = (cx - px);
    var dy = (cy - py);
    return ((dx * dx) / (rx * rx)) + ((dy * dy) / (ry * ry)) < 1;
}

// 다각형 내부
// (px, py)가 다각형 밖에 있으면 0을 반환함
// source: http://geomalgorithms.com/a03-_inclusion.html
is_inside_polygon = (all_points_x, all_points_y, px, py) => {
    var wn = 0; // 주회 횟수 카운터

    // 다각형의 모든 가장자리를 반복
    for (var i = 0; i < all_points_x.length - 1; ++i) { // V [i]에서 V [i + 1]까지의 엣지
        var is_left_value = is_left(all_points_x[i], all_points_y[i],
            all_points_x[i + 1], all_points_y[i + 1],
            px, py);

        if (all_points_y[i] <= py) {
            if (all_points_y[i + 1] > py && is_left_value > 0) {
                ++wn;
            }
        } else {
            if (all_points_y[i + 1] <= py && is_left_value < 0) {
                --wn;
            }
        }
    }
    if (wn === 0) {
        return 0;
    } else {
        return 1;
    }
}

// 포인트 내부
is_inside_point = (cx, cy, px, py) => {
    var dx = px - cx;
    var dy = py - cy;
    var r2 = VIA_POLYGON_VERTEX_MATCH_TOL * VIA_POLYGON_VERTEX_MATCH_TOL;
    return (dx * dx + dy * dy) < r2;
}

// 반환 값
// > 0 => (x2, y2)가 (x0, y0)과 (x1, y1)을 연결하는 선의 왼쪽에 있는 경우
// = 0 => (x2, y2)가 (x0, y0)과 (x1, y1)을 연결하는 선에 있는 경우
// < 0 => (x2, y2)가 (x0, y0)과 (x1, y1)을 연결하는 선의 오른쪽에 있는 경우
// source: http://geomalgorithms.com/a03-_inclusion.html
// 남아있음.
is_left = (x0, y0, x1, y1, x2, y2) => {
    return (((x1 - x0) * (y2 - y0)) - ((x2 - x0) * (y1 - y0)));
}

// 영역 코너
is_on_region_corner = (px, py) => {
    var _via_region_edge = [-1, -1]; // region_id, corner_id [top-left=1,top-right=2,bottom-right=3,bottom-left=4]

    for (var i = 0; i < _via_canvas_regions.length; ++i) {
        var attr = _via_canvas_regions[i].shape_attributes;
        var result = false;
        _via_region_edge[0] = i;

        switch (attr['name']) {
            case VIA_REGION_SHAPE.RECT:
                result = is_on_rect_edge(attr['x'],
                    attr['y'],
                    attr['width'],
                    attr['height'],
                    px, py);
                break;

            case VIA_REGION_SHAPE.CIRCLE:
                result = is_on_circle_edge(attr['cx'],
                    attr['cy'],
                    attr['r'],
                    px, py);
                break;

            case VIA_REGION_SHAPE.ELLIPSE:
                result = is_on_ellipse_edge(attr['cx'],
                    attr['cy'],
                    attr['rx'],
                    attr['ry'],
                    px, py);
                break;

            case VIA_REGION_SHAPE.POLYLINE: // handled by polygon
            case VIA_REGION_SHAPE.POLYGON:
                result = is_on_polygon_vertex(attr['all_points_x'],
                    attr['all_points_y'],
                    px, py);
                break;

            case VIA_REGION_SHAPE.POINT:
                // since there are no edges of a point
                result = 0;
                break;
        }

        if (result > 0) {
            _via_region_edge[1] = result;
            return _via_region_edge;
        }
    }
    _via_region_edge[0] = -1;
    return _via_region_edge;
}

// 직사각형 모서리
is_on_rect_edge = (x, y, w, h, px, py) => {
    var dx0 = Math.abs(x - px);
    var dy0 = Math.abs(y - py);
    var dx1 = Math.abs(x + w - px);
    var dy1 = Math.abs(y + h - py);
    //[top-left=1,top-right=2,bottom-right=3,bottom-left=4]
    if (dx0 < VIA_REGION_EDGE_TOL &&
        dy0 < VIA_REGION_EDGE_TOL) {
        return 1;
    }
    if (dx1 < VIA_REGION_EDGE_TOL &&
        dy0 < VIA_REGION_EDGE_TOL) {
        return 2;
    }
    if (dx1 < VIA_REGION_EDGE_TOL &&
        dy1 < VIA_REGION_EDGE_TOL) {
        return 3;
    }

    if (dx0 < VIA_REGION_EDGE_TOL &&
        dy1 < VIA_REGION_EDGE_TOL) {
        return 4;
    }

    var mx0 = Math.abs(x + w / 2 - px);
    var my0 = Math.abs(y + h / 2 - py);
    //[top-middle=5,right-middle=6,bottom-middle=7,left-middle=8]
    if (mx0 < VIA_REGION_EDGE_TOL &&
        dy0 < VIA_REGION_EDGE_TOL) {
        return 5;
    }
    if (dx1 < VIA_REGION_EDGE_TOL &&
        my0 < VIA_REGION_EDGE_TOL) {
        return 6;
    }
    if (mx0 < VIA_REGION_EDGE_TOL &&
        dy1 < VIA_REGION_EDGE_TOL) {
        return 7;
    }
    if (dx0 < VIA_REGION_EDGE_TOL &&
        my0 < VIA_REGION_EDGE_TOL) {
        return 8;
    }

    return 0;
}

// 원형 가장자리
is_on_circle_edge = (cx, cy, r, px, py) => {
    var dx = cx - px;
    var dy = cy - py;
    if (Math.abs(Math.sqrt(dx * dx + dy * dy) - r) < VIA_REGION_EDGE_TOL) {
        var theta = Math.atan2(py - cy, px - cx);
        if (Math.abs(theta - (Math.PI / 2)) < VIA_THETA_TOL ||
            Math.abs(theta + (Math.PI / 2)) < VIA_THETA_TOL) {
            return 5;
        }
        if (Math.abs(theta) < VIA_THETA_TOL ||
            Math.abs(Math.abs(theta) - Math.PI) < VIA_THETA_TOL) {
            return 6;
        }

        if (theta > 0 && theta < (Math.PI / 2)) {
            return 1;
        }
        if (theta > (Math.PI / 2) && theta < (Math.PI)) {
            return 4;
        }
        if (theta < 0 && theta > -(Math.PI / 2)) {
            return 2;
        }
        if (theta < -(Math.PI / 2) && theta > -Math.PI) {
            return 3;
        }
    } else {
        return 0;
    }
}

// 타원 가장자리
is_on_ellipse_edge = (cx, cy, rx, ry, px, py) => {
    var dx = (cx - px) / rx;
    var dy = (cy - py) / ry;

    if (Math.abs(Math.sqrt(dx * dx + dy * dy) - 1) < VIA_ELLIPSE_EDGE_TOL) {
        var theta = Math.atan2(py - cy, px - cx);
        if (Math.abs(theta - (Math.PI / 2)) < VIA_THETA_TOL ||
            Math.abs(theta + (Math.PI / 2)) < VIA_THETA_TOL) {
            return 5;
        }
        if (Math.abs(theta) < VIA_THETA_TOL ||
            Math.abs(Math.abs(theta) - Math.PI) < VIA_THETA_TOL) {
            return 6;
        }
    } else {
        return 0;
    }
}

// 다각형 꼭짓점
is_on_polygon_vertex = (all_points_x, all_points_y, px, py) => {
    var n = all_points_x.length;
    for (var i = 0; i < n; ++i) {
        if (Math.abs(all_points_x[i] - px) < VIA_POLYGON_VERTEX_MATCH_TOL &&
            Math.abs(all_points_y[i] - py) < VIA_POLYGON_VERTEX_MATCH_TOL) {
            return (VIA_POLYGON_RESIZE_VERTEX_OFFSET + i);
        }
    }
    return 0;
}

// 직사각형 표준화 좌표
rect_standardize_coordinates = (d) => {
    // d [x0, y0, x1, y1]은 (d [0], d [1])이 왼쪽 상단 모서리이고 (d [2], d [3])가 오른쪽 하단 모서리임을 확인함.
    if (d[0] > d[2]) {
        // 교체
        var t = d[0];
        d[0] = d[2];
        d[2] = t;
    }

    if (d[1] > d[3]) {
        // 교체
        var t = d[1];
        d[1] = d[3];
        d[3] = t;
    }
}

//직사각형 코너 업데이트
rect_update_corner = (corner_id, d, x, y, preserve_aspect_ratio) => {
    // 전제 조건 : d [x0, y0, x1, y1] 표준화
    // 사후 조건 : 모서리가 이동 됨 (d가 표준화되지 않을 수 있음)
    if (preserve_aspect_ratio) {
        switch (corner_id) {
            case 1: // Fall-through // 상단 좌측
            case 3: // 하단 우측
                var dx = d[2] - d[0];
                var dy = d[3] - d[1];
                var norm = Math.sqrt(dx * dx + dy * dy);
                var nx = dx / norm; // 직사각형의 대각선을 따라있는 단위 벡터의 x 구성 요소
                var ny = dy / norm; // y 구성요소
                var proj = (x - d[0]) * nx + (y - d[1]) * ny;
                var proj_x = nx * proj;
                var proj_y = ny * proj;
                // (mx, my)가 (x0, y0)과 (x1, y1)을 연결하는 선에 놓 이도록 제한
                x = Math.round(d[0] + proj_x);
                y = Math.round(d[1] + proj_y);
                break;

            case 2: // Fall-through // 상단 우측
            case 4: // 하단 좌측
                var dx = d[2] - d[0];
                var dy = d[1] - d[3];
                var norm = Math.sqrt(dx * dx + dy * dy);
                var nx = dx / norm; // 직사각형의 대각선을 따라있는 단위 벡터의 x 구성 요소
                var ny = dy / norm; // y 구성요소
                var proj = (x - d[0]) * nx + (y - d[3]) * ny;
                var proj_x = nx * proj;
                var proj_y = ny * proj;
                // (mx, my)가 (x0, y0)과 (x1, y1)을 연결하는 선에 놓 이도록 제한
                x = Math.round(d[0] + proj_x);
                y = Math.round(d[3] + proj_y);
                break;
        }
    }
    switch (corner_id) {
        case 1: // 상단 좌측
            d[0] = x;
            d[1] = y;
            break;

        case 3: // 하단 우측
            d[2] = x;
            d[3] = y;
            break;

        case 2: // 상단 우측
            d[2] = x;
            d[1] = y;
            break;

        case 4: // 하단 좌측
            d[0] = x;
            d[3] = y;
            break;

        case 5: // 상단 중간
            d[1] = y;
            break;

        case 6: // 우측 중간
            d[2] = x;
            break;

        case 7: // 하단 중간
            d[3] = y;
            break;

        case 8: // 좌측 중간
            d[0] = x;
            break;
    }
}

// UI 구성요소 업데이트
_via_update_ui_components = () => {
    if (!_via_is_window_resized && _via_current_image_loaded) {
        // show_message('Resizing window ...');
        show_all_canvas();

        _via_is_window_resized = true;
        show_image(_via_image_index);

        if (_via_is_canvas_zoomed) {
            reset_zoom_level();
        }
    }
}

//
// 바로 가기 키 처리기
//

// 키 눌렀다가 뗄 때
_via_reg_canvas.addEventListener('keyup', function (e) {
    if (_via_is_user_updating_attribute_value ||
        _via_is_user_updating_attribute_name ||
        _via_is_user_adding_attribute_name) {

        return;
    }

    if (e.which === 17) { // Ctrl key
        _via_is_ctrl_pressed = false;
    }
});

// 키 누룰 때
_via_reg_canvas.addEventListener('keydown', function (e) {
    if (_via_is_user_updating_attribute_value ||
        _via_is_user_updating_attribute_name ||
        _via_is_user_adding_attribute_name) {

        return;
    }

    // 사용자 명령
    if (e.ctrlKey) {
        _via_is_ctrl_pressed = true;
        if (e.which === 83) { // Ctrl + s
            download_all_region_data('json');
            e.preventDefault();
            // show_message('파일이 저장되었습니다.');
            return;
        }

        if (e.which === 65) { // Ctrl + a
            sel_all_regions();
            e.preventDefault();
            return;
        }

        if (e.which === 67) { // Ctrl + c
            if (_via_is_region_selected ||
                _via_is_all_region_selected) {
                copy_sel_regions();
                e.preventDefault();
            }
            return;
        }

        if (e.which === 86) { // Ctrl + v
            paste_sel_regions();
            e.preventDefault();
            return;
        }
    }

    if (e.which === 46 || e.which === 8) { // Del or Backspace
        del_sel_regions();
        e.preventDefault();
    }
    if (e.which === 78 || e.which === 39) { // n or right arrow
        move_to_next_image();
        e.preventDefault();
        return;
    }
    if (e.which === 80 || e.which === 37) { // n or right arrow
        move_to_prev_image();
        e.preventDefault();
        return;
    }
    if (e.which === 32 && _via_current_image_loaded) { // Space
        toggle_img_list();
        e.preventDefault();
        return;
    }

    // zoom
    if (_via_current_image_loaded) {
        // see: http://www.javascripter.net/faq/keycodes.htm
        if (e.which === 61 || e.which === 187) { // + for zoom in
            if (e.shiftKey) {
                zoom_in();
            } else { // = for zoom reset
                reset_zoom_level();
            }
            return;
        }

        if (e.which === 173 || e.which === 189) { // - for zoom out
            zoom_out();
            return;
        }
    }

    if (e.which === 27) { // Esc
        if (_via_is_user_updating_attribute_value ||
            _via_is_user_updating_attribute_name ||
            _via_is_user_adding_attribute_name) {

            _via_is_user_updating_attribute_value = false;
            _via_is_user_updating_attribute_name = false;
            _via_is_user_adding_attribute_name = false;
        }

        if (_via_is_user_resizing_region) {
            // cancel region resizing action
            _via_is_user_resizing_region = false;
        }

        if (_via_is_region_selected) {
            // clear all region selections
            _via_is_region_selected = false;
            _via_user_sel_region_id = -1;
            toggle_all_regions_selection(false);
        }

        if (_via_is_user_drawing_polygon) {
            _via_is_user_drawing_polygon = false;
            _via_canvas_regions.splice(_via_current_polygon_region_id, 1);
        }

        if (_via_is_user_drawing_region) {
            _via_is_user_drawing_region = false;
        }

        if (_via_is_user_resizing_region) {
            _via_is_user_resizing_region = false
        }

        if (_via_is_user_updating_attribute_name ||
            _via_is_user_updating_attribute_value) {
            _via_is_user_updating_attribute_name = false;
            _via_is_user_updating_attribute_value = false;

        }

        if (_via_is_user_moving_region) {
            _via_is_user_moving_region = false
        }

        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();
        e.preventDefault();
        return;
    }

    if (e.which === 112) { // F1 for help
        show_getting_started_panel();
        e.preventDefault();
        return;
    }
    if (e.which === 113) { // F2 for about
        show_about_panel();
        e.preventDefault();
        return;
    }
    if (e.which === 13) { // Enter key
        if (_via_current_shape === VIA_REGION_SHAPE.POLYLINE ||
            _via_current_shape === VIA_REGION_SHAPE.POLYGON) {
            // [Enter] 키는 polygon 또는 polyline 그리기 작업의 완료를 나타내는 데 사용됨.

            var npts = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x']
                .length;
            if (npts <= 2 && _via_current_shape === VIA_REGION_SHAPE.POLYGON) {
                // show_message('For a polygon, you must define at least 3 points. ' +
                //              'Press [Esc] to cancel drawing operation.!');
                return;
            }
            if (npts <= 1 && _via_current_shape === VIA_REGION_SHAPE.POLYLINE) {
                // show_message('A polyline must have at least 2 points. ' +
                //              'Press [Esc] to cancel drawing operation.!');
                return;
            }

            _via_is_user_drawing_polygon = false;
            add_new_polygon();

            // newly drawn region is automatically selected
            select_only_region(_via_current_polygon_region_id);

            _via_current_polygon_region_id = -1;
            save_current_data_to_browser_cache();
            _via_redraw_reg_canvas();
            _via_reg_canvas.focus();
        }
    }
});

// 새 다각형 추가
add_new_polygon = () => {
    // _via_canvas_regions []에 저장된 모든 다각형 점 추가
    var all_points_x = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x'].slice(
        0);
    var all_points_y = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_y'].slice(
        0);

    if (_via_current_shape === VIA_REGION_SHAPE.POLYGON) {
        // 다각형의 가까운 경로 (사용자는 최종 정점을 연결할 필요가 없음) 따라서 모든 다각형에는 최소 4 개의 점이 있음.
        all_points_x.push(all_points_x[0]);
        all_points_y.push(all_points_y[0]);
    }

    var canvas_all_points_x = [];
    var canvas_all_points_y = [];

    //var points_str = '';
    for (var i = 0; i < all_points_x.length; ++i) {
        all_points_x[i] = Math.round(all_points_x[i] * _via_canvas_scale);
        all_points_y[i] = Math.round(all_points_y[i] * _via_canvas_scale);

        canvas_all_points_x[i] = Math.round(all_points_x[i] / _via_canvas_scale);
        canvas_all_points_y[i] = Math.round(all_points_y[i] / _via_canvas_scale);
    }

    var polygon_region = new ImageRegion();
    polygon_region.region_attributes['object_type'] = _via_current_object_type;
    polygon_region.shape_attributes['name'] = _via_current_shape;
    polygon_region.shape_attributes['all_points_x'] = all_points_x;
    polygon_region.shape_attributes['all_points_y'] = all_points_y;
    _via_current_polygon_region_id = _via_img_metadata[_via_image_id].regions.length;
    _via_img_metadata[_via_image_id].regions.push(polygon_region);

    // 캔버스 업데이트
    _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['name'] = _via_current_shape;
    _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x'] = canvas_all_points_x;
    _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_y'] = canvas_all_points_y;
}

// 선택 영역 삭제
del_sel_regions = () => {
    if (!_via_current_image_loaded) {
        // show_message('First load some images!');
        return;
    }

    var del_region_count = 0;
    if (_via_is_all_region_selected) {
        del_region_count = _via_canvas_regions.length;
        _via_canvas_regions.splice(0);
        _via_img_metadata[_via_image_id].regions.splice(0);
    } else {
        var sorted_sel_reg_id = [];
        for (var i = 0; i < _via_canvas_regions.length; ++i) {
            if (_via_canvas_regions[i].is_user_selected) {
                var del_id = _via_canvas_regions[i].region_attributes.object_type + '_' + i
                var del_box = document.getElementById(del_id)
                del_box.parentNode.removeChild(del_box)
                sorted_sel_reg_id.push(i);
            }
        }
        sorted_sel_reg_id.sort(function (a, b) {
            return (b - a);
        });
        for (var i = 0; i < sorted_sel_reg_id.length; ++i) {
            _via_canvas_regions.splice(sorted_sel_reg_id[i], 1);
            _via_img_metadata[_via_image_id].regions.splice(sorted_sel_reg_id[i], 1);
            del_region_count += 1;
        }
    }

    _via_is_all_region_selected = false;
    _via_is_region_selected = false;
    _via_user_sel_region_id = -1;

    if (_via_canvas_regions.length === 0) {
        // 모든 영역이 삭제되었으므로 영역 캔버스를 지움.
        _via_clear_reg_canvas();
    } else {
        _via_redraw_reg_canvas();
    }
    _via_reg_canvas.focus();
    save_current_data_to_browser_cache();

    // show_message(del_region_count + '개의 선택된 영역을 삭제합니다.');
}

// 모든 영역 선택
sel_all_regions = () => {
    if (!_via_current_image_loaded) {
        // show_message('First load some images!');
        return;
    }

    toggle_all_regions_selection(true);
    _via_is_all_region_selected = true;
    _via_redraw_reg_canvas();
}

// 선택된 영역 복사
copy_sel_regions = () => {
    if (!_via_current_image_loaded) {
        // show_message('First load some images!');
        return;
    }

    if (_via_is_region_selected ||
        _via_is_all_region_selected) {
        _via_copied_image_regions.splice(0);
        for (var i = 0; i < _via_img_metadata[_via_image_id].regions.length; ++i) {
            var img_region = _via_img_metadata[_via_image_id].regions[i];
            var canvas_region = _via_canvas_regions[i];
            if (canvas_region.is_user_selected) {
                _via_copied_image_regions.push(clone_image_region(img_region));
            }
        }
        // show_message('Copied ' + _via_copied_image_regions.length +
        //              ' selected regions. Press Ctrl + v to paste');
    } else {
        // show_message('Select a region first!');
    }
}

// 선택된 영역 붙여넣기
paste_sel_regions = () => {
    if (!_via_current_image_loaded) {
        // show_message('First load some images!');
        return;
    }

    if (_via_copied_image_regions.length) {
        var pasted_reg_count = 0;
        for (var i = 0; i < _via_copied_image_regions.length; ++i) {
            // 복사 된 영역이이 이미지의 경계 내에 있는지 확인
            var bbox = get_region_bounding_box(_via_copied_image_regions[i]);
            if (bbox[2] < _via_current_image_width && bbox[3] < _via_current_image_height) {
                var r = clone_image_region(_via_copied_image_regions[i]);
                _via_img_metadata[_via_image_id].regions.push(r);

                pasted_reg_count += 1;
            }
        }
        _via_load_canvas_regions();
        var discarded_reg_count = _via_copied_image_regions.length - pasted_reg_count;
        // show_message('Pasted ' + pasted_reg_count + ' regions. ' +
        //              'Discarded ' + discarded_reg_count + ' regions exceeding image boundary.');
        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();
    } else {
        // show_message('To paste a region, you first need to select a region and copy it!');
    }
}

// 줌 초기화
reset_zoom_level = () => {
    if (!_via_current_image_loaded) {
        // show_message('First load some images!');
        return;
    }
    if (_via_is_canvas_zoomed) {
        _via_is_canvas_zoomed = false;
        _via_canvas_zoom_level_index = VIA_CANVAS_DEFAULT_ZOOM_LEVEL_INDEX;

        var zoom_scale = VIA_CANVAS_ZOOM_LEVELS[_via_canvas_zoom_level_index];
        set_all_canvas_scale(zoom_scale);
        set_all_canvas_size(_via_canvas_width, _via_canvas_height);
        _via_canvas_scale = _via_canvas_scale_without_zoom;

        _via_load_canvas_regions(); // image to canvas space transform
        _via_redraw_img_canvas();
        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();
        // show_message('Zoom reset');
    } else {
        // show_message('Cannot reset zoom because image zoom has not been applied!');
    }
}

// 줌 인
zoom_in = () => {
    if (!_via_current_image_loaded) {
        // show_message('First load some images!');
        return;
    }

    if (_via_canvas_zoom_level_index === (VIA_CANVAS_ZOOM_LEVELS.length - 1)) {
        // show_message('Further zoom-in not possible');
    } else {
        _via_canvas_zoom_level_index += 1;
        console.log(_via_canvas_zoom_level_index)

        _via_is_canvas_zoomed = true;
        var zoom_scale = VIA_CANVAS_ZOOM_LEVELS[_via_canvas_zoom_level_index];
        set_all_canvas_scale(zoom_scale);
        set_all_canvas_size(_via_canvas_width * zoom_scale,
            _via_canvas_height * zoom_scale);
        _via_canvas_scale = _via_canvas_scale_without_zoom / zoom_scale;

        _via_load_canvas_regions(); // image to canvas space transform
        _via_redraw_img_canvas();
        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();
        // show_message('Zoomed in to level ' + zoom_scale + 'X');
    }
}

// 줌 아웃
zoom_out = () => {
    if (!_via_current_image_loaded) {
        // show_message('First load some images!');
        return;
    }

    if (_via_canvas_zoom_level_index === 0) {
        return;
        // show_message('Further zoom-out not possible');
    } else {
        _via_canvas_zoom_level_index -= 1;
        console.log(_via_canvas_zoom_level_index)

        _via_is_canvas_zoomed = true;
        var zoom_scale = VIA_CANVAS_ZOOM_LEVELS[_via_canvas_zoom_level_index];
        set_all_canvas_scale(zoom_scale);
        set_all_canvas_size(_via_canvas_width * zoom_scale,
            _via_canvas_height * zoom_scale);
        _via_canvas_scale = _via_canvas_scale_without_zoom / zoom_scale;

        _via_load_canvas_regions(); // image to canvas space transform
        _via_redraw_img_canvas();
        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();
        // show_message('Zoomed out to level ' + zoom_scale + 'X');
    }
}

// 영역 경계 가시성 전환
toggle_region_boundary_visibility = () => {
    _via_is_region_boundary_visible = !_via_is_region_boundary_visible;
    _via_redraw_reg_canvas();
    _via_reg_canvas.focus();
}

// 영역 아이디 가시성 변환
toggle_region_id_visibility = () => {
    _via_is_region_id_visible = !_via_is_region_id_visible;
    _via_redraw_reg_canvas();
    _via_reg_canvas.focus();
}

//
// 마우스 휠 이벤트 리스너
//

window.addEventListener('wheel', function (e) {
    if (!_via_current_image_loaded) {
        return;
    }

    if (e.ctrlKey) {
        if (e.deltaY < 0) {
            zoom_in();
        } else {
            zoom_out();
        }
        e.preventDefault();
    }
});

//
//브라우저 캐시(예 : localStorage)에서 주석 데이터의 지속성
//

// 로컬 스토리지 확인
check_local_storage = () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    try {
        var x = '__storage_test__';
        localStorage.setItem(x, x);
        localStorage.removeItem(x);
        return true;
    } catch (e) {
        return false;
    }
}

// 브라우저 캐시에 현재 데이터 저장 
save_current_data_to_browser_cache = () => {
    setTimeout(function () {
        if (_via_is_local_storage_available &&
            !_via_is_save_ongoing) {
            try {
                _via_is_save_ongoing = true;
                var img_metadata = pack_via_metadata('json');
                var timenow = new Date().toUTCString();
                localStorage.setItem('_via_timestamp', timenow);
                localStorage.setItem('_via_img_metadata', img_metadata[0]);
                // save attributes
                var attr = [];
                for (var attribute in _via_region_attributes) {
                    attr.push(attribute);
                }
                localStorage.setItem('_via_region_attributes', JSON.stringify(attr));
                _via_is_save_ongoing = false;
            } catch (err) {
                _via_is_save_ongoing = false;
                _via_is_local_storage_available = false;
                // show_message('Failed to save annotation data to browser cache.');
                alert('Failed to save annotation data to browser cache.');
                console.log('Failed to save annotation data to browser cache');
                console.log(err.message);
            }
        }
    }, 1000);
}

// 로컬 스토리지 안에 via data
is_via_data_in_localStorage = () => {
    return localStorage.getItem('_via_timestamp') &&
        localStorage.getItem('_via_img_metadata');
}

// 로컬 스토리지에서 via_data 제거
remove_via_data_from_localStorage = () => {
    if (check_local_storage() && is_via_data_in_localStorage()) {
        localStorage.removeItem('_via_timestamp');
        localStorage.removeItem('_via_img_metadata');
    }
}

// 로컬 스토리지 데이터 저장
download_localStorage_data = (type) => {
    var saved_date = new Date(localStorage.getItem('_via_timestamp'));

    var localStorage_data_blob = new Blob([localStorage.getItem('_via_img_metadata')], {
        type: 'text/json;charset=utf-8'
    });

    save_data_to_local_file(localStorage_data_blob, 'VIA_browser_cache_' + saved_date + '.json');
}

//
// 실행
//
_via_init()
store_local_img_ref();
show_image();
drawAllRect();
SideBar();
clickedInspection();

document.onkeydown = (e) => {
    console.log(e)
    if (e.which == 49) {
        Inspect('', 1)
    }
    if (e.which == 50) {
        Inspect('', 0)
    }
    if (e.which == 51) {
        Inspect('All', 1)
    }
    if (e.which == 52) {
        Inspect('All', 0)
    }
    if (e.which == 37) {
        ctxLeft();
    }
    if (e.which == 39) {
        ctxRight();
    }
    if (e.which == 187) {
        zoom_in();
    }
    if (e.which == 189) {
        zoom_out();
    }
}