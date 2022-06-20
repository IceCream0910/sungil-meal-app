moment.lang('ko', {
    weekdays: ["일", "월", "화", "수", "목", "금", "토"],
    weekdaysShort: ["일", "월", "화", "수", "목", "금", "토"],
});
moment.lang('en', {
    weekdays: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
    weekdaysShort: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
});

var ttsAudio = new Audio('https://playentry.org/api/expansionBlock/tts/read.mp3?text=잘못된 요청입니다.');


//tts
const voiceType = localStorage.getItem("sungil_ttsVoice") || 'dinna';

function mealTts() {
    ttsAudio.pause();
    if (currentMenuRaw) {
        var menuArr = currentMenuRaw.replaceAll('\'', '').replaceAll('[중식]', '').split('\n');
        var menuInfoTag = '';

        for (var i = 0; i < menuArr.length; i++) {
            if (menuArr[i].match(/\d+/)) {
                var allegyIndex = menuArr[i].match(/\d+/).index;
                var alle = menuArr[i].substring(allegyIndex, menuArr[i].length);
            } else {
                var alle = 'none';
            }
            var menuName = menuArr[i].substring(0, allegyIndex);
            menuInfoTag += menuName + ', ';
        }

        var text = moment(selectedDate).lang("ko").format('M월 D일 dddd요일') + ' 급식 메뉴는 ' + menuInfoTag.replaceAll('&', ', ') + '입니다.';
    } else {
        var text = moment(selectedDate).lang("ko").format('M월 D일 dddd요일') + '은 급식 정보가 없네요.';
    }
    ttsAudio = new Audio('https://playentry.org/api/expansionBlock/tts/read.mp3?text=' + text + '&speed=0&pitch=0&speaker=' + voiceType + '&volume=1');
    console.log(text);
    ttsAudio.play();
}

function timetableTts() {
    ttsAudio.pause();
    var selectedDay = moment(selectedDate).lang("en").format('dddd');
    if (selectedDay == 'sat' || selectedDay == 'sun') {
        var text = moment(selectedDate).lang("ko").format('M월 D일 dddd요일') + '에는 수업이 없어요.';
    } else {
        var timeDataForTts = timetableRaw[selectedDay];
        var listedClass = '';
        for (var i = 0; i < timeDataForTts.length; i++) {
            listedClass += (i + 1) + '교시 ' + timeDataForTts[i].ITRT_CNTNT + ', ';
        }
        var text = moment(selectedDate).lang("ko").format('M월 D일 dddd요일') + ' 시간표를 알려드릴게요. ' + listedClass + '입니다';
    }
    console.log(text);
    ttsAudio = new Audio('https://playentry.org/api/expansionBlock/tts/read.mp3?text=' + text + '&speed=0&pitch=0&speaker=' + voiceType + '&volume=1');
    ttsAudio.play();

}

function playPause() {
    if (track.paused) {
        track.play();
        //controlBtn.textContent = "Pause";
        controlBtn.className = "pause";
    } else {
        track.pause();
        //controlBtn.textContent = "Play";
        controlBtn.className = "play";
    }
}


var today = moment(new Date()).format('YYYYMMDD');
//var today = moment('20220607').format('YYYYMMDD');

//d day
var todayForDday = new Date();
var ddayDate = new Date(2022, 05, 30);
var gap = ddayDate.getTime() - todayForDday.getTime();
var ddayResult = Math.ceil(gap / (1000 * 60 * 60 * 24));
if (ddayResult < 0) {
    $('#dday').html((-ddayResult + 1) + '일차');
} else if (ddayResult == 0) {
    $('#dday').html('1일차');
} else {
    $('#dday').html('D-' + ddayResult);
}


var selectedDate = today;
$('#date').html(moment(selectedDate).lang("ko").format('M월 D일 (dddd)'));
$('#date').addClass('today');

var grade = localStorage.getItem("sungil_grade");
var classNum = localStorage.getItem("sungil_classNum");
var currentMenuRaw = '';
var timetableRaw = '';
var isTest = false;

var alleList;

if (localStorage.getItem("sungil_alleList")) {
    alleList = localStorage.getItem("sungil_alleList").split(',');
    alleList = alleList.map(function (val) { return ++val; });
    alleList = alleList.join(',').toString();
} else {
    alleList = '';
}

var favTagsList;
if (localStorage.getItem("sungil_favTagsList")) {
    favTagsList = localStorage.getItem("sungil_favTagsList").split(',');
} else {
    favTagsList = ["훈제", "참치마요", "미트볼", "우동", "망고", "샌드위치", "피자", "햄버거", "돈까스", "브라운소스", "핫바", "새우튀김", "스파게티", "감자튀김", "빵", "떡꼬치", "와플", "바나나", "스테이크", "탕수육", "스크렘블", "초코", "맛탕", "바베큐", "떡갈비", "비엔나", "브라우니", "치킨마요", "타코야끼", "도넛", "치즈", "핫도그", "치킨", "스프", "소세지", "메론", "떡볶이", "샐러드", "모닝빵", "불고기", "햄"];
}


if (grade && classNum) {
    $('#gradeClassLabel').html(grade + '학년 ' + classNum + '반');
}

$.datepicker.setDefaults({
    dateFormat: 'yy-mm-dd',
    prevText: '이전 달',
    nextText: '다음 달',
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNames: ['일', '월', '화', '수', '목', '금', '토'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
    showMonthAfterYear: true,
    yearSuffix: '년'
});

$("#datepicker").datepicker({
    onSelect: function (dataTExt) {
        selectedDate = moment(dataTExt).format('YYYYMMDD');
        $('#date').html(moment(selectedDate).lang("ko").format('M월 D일 (dddd)'));
        $('body').css('overflow', 'auto');
        $('.modal-in').css('bottom', '-1850px');
        setTimeout(function () {
            $('.modal-in').css('display', 'none');
        }, 100);
        $('.sheet-backdrop').removeClass('backdrop-in');
        updateInfo();
    }
});





$(document).ready(function () {
    updateInfo();
    //가정통신문
    $.ajax({
        type: "GET",
        url: "https://sungil-school-api.vercel.app/notices",
        success: function (result) {
            var data = JSON.parse(result);
            $('#notices-content').html('');
            for (var i = 0; i < 5; i++) {
                var title = data.articles[i].title;
                var createdAt = moment(new Date(data.articles[i].created_at)).format('YYYY-MM-DD');
                var link = data.articles[i].view_link;
                if (data.articles[i].files) {
                    var fileUrl = data.articles[i].files[1].url;
                    var fileName = data.articles[i].files[1].title;
                }
                $('#notices-content').append(`<div class="card notice-card" onclick="window.open('` + link + `', '_blank')">
            <h4>`+ title + `</h4>
            <div class="file-box" onclick="window.open('` + fileUrl + `', '_blank')">
            `+ fileName + `
            </div>
            <p>`+ createdAt + `</p>
        </div>`);
            }
            if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                var notice_items = document.getElementsByClassName('notice-card');
                for (var i = 0; i < notice_items.length; i++) {
                    notice_items[i].classList.add("dark");
                }
            }
        }
    });
});


function backDate() {
    let yesterday = moment(selectedDate).add(-1, 'days');
    selectedDate = moment(yesterday).format('YYYYMMDD');
    $('#date').html(moment(selectedDate).lang("ko").format('M월 D일 (dddd)'));
    if (today == selectedDate) {
        $('#date').addClass('today');

    } else {
        $('#date').removeClass('today');
    }
    updateInfo();
}

function forwardDate() {
    let tomorrow = moment(selectedDate).add(1, 'days');
    selectedDate = moment(tomorrow).format('YYYYMMDD');
    $('#date').html(moment(selectedDate).lang("ko").format('M월 D일 (dddd)'));
    if (today == selectedDate) {
        $('#date').addClass('today');

    } else {
        $('#date').removeClass('today');
    }
    updateInfo();
}

String.prototype.insertAt = function (index, str) {
    return this.slice(0, index) + str + this.slice(index)
}

var data;
var newData;
function updateInfo() {
    var cachedData = JSON.parse(localStorage.getItem("sungil_api_cache")) || null;
    var cachedData_date = localStorage.getItem("sungil_api_cache_date") || null;
    var requestDate = selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6).replace(/(^0+)/, "");
    $('#meal-loader').show();
    $('#meal-menus').empty();
    if (!isTest) {
        var text = ["시간표 물어보는 중", "달력 체크중", "급식실 훔쳐보는 중"];
        var counter = 0;
        var elem = $("#loading-text");
        setInterval(change, 1000);
        function change() {
            elem.fadeOut(function () {
                elem.html(text[counter]);
                counter++;
                if (counter >= text.length) { counter = 0; }
                elem.fadeIn();
            });
        }

        document.getElementsByClassName('loading-overlay')[0].classList.add('is-active');
        $('#schedule-content').html('');

        if (cachedData && cachedData_date == requestDate) {
            displayMeal(cachedData);
            displaySchedule(cachedData);
            document.getElementsByClassName('loading-overlay')[0].classList.remove('is-active');
        } else {
            $.ajax({
                type: "GET",
                url: "https://sungil-school-api.vercel.app/api/" + selectedDate,
                success: function (result) {
                    data = JSON.parse(result);
                    localStorage.setItem("sungil_api_cache", JSON.stringify(data));
                    localStorage.setItem("sungil_api_cache_date", selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6).replace(/(^0+)/, ""));

                    //급식
                    displayMeal(data);
                    document.getElementsByClassName('loading-overlay')[0].classList.remove('is-active');

                    //학사일정
                    if (data.schedule) {
                        displaySchedule(data);
                        //$('#schedule-content').html(data.schedule.EVENT_NM);
                    }
                }
            });
        }


        //시간표
        if (!grade || !classNum) {
            $('#timetable').html('학년/반 설정을 먼저 진행해주세요.');
            $('.timetable-wrap').hide();
            $('#nosetting-timetable').show();

        } else {
            $('.timetable-wrap').show();
            $('#nosetting-timetable').hide();

            var cachedTimeData = JSON.parse(localStorage.getItem("sungil_timeapi_cache")) || null;
            var cachedTimeData_date = localStorage.getItem("sungil_timeapi_cache_date") || null;
            var requestTimeDate = selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6).replace(/(^0+)/, "") + '--' + getWeekNo(moment(selectedDate).format('YYYY-MM-DD'));

            if (cachedTimeData && cachedTimeData_date == requestTimeDate) {
                displayTimetable(cachedTimeData);
                //변경 사항 체크
                $.ajax({
                    type: "GET",
                    url: 'https://sungil-school-api.vercel.app/timetable?date=' + selectedDate + '&grade=' + grade + '&classNum=' + classNum,
                    success: function (result_time) {
                        var data = JSON.parse(result_time);
                        if (JSON.stringify(cachedTimeData) != JSON.stringify(data)) {
                            console.log('시간표 변동 사항 발견!', cachedTimeData, data);
                            localStorage.setItem("sungil_timeapi_cache", JSON.stringify(data));
                            localStorage.setItem("sungil_timeapi_cache_date", selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6).replace(/(^0+)/, "") + '--' + getWeekNo(moment(selectedDate).format('YYYY-MM-DD')));
                            displayTimetable(data);
                        } else { console.log('시간표 변경 사항 없음, 기존 데이터 그대로 사용 유지'); }
                    }
                });

            } else {
                if (!$('.loading-overlay').hasClass('is-active')) {
                    document.getElementsByClassName('loading-overlay')[0].classList.add('is-active');
                }

                $.ajax({
                    type: "GET",
                    url: 'https://sungil-school-api.vercel.app/timetable?date=' + selectedDate + '&grade=' + grade + '&classNum=' + classNum,
                    success: function (result_time) {
                        var data = JSON.parse(result_time);

                        localStorage.setItem("sungil_timeapi_cache", JSON.stringify(data));
                        localStorage.setItem("sungil_timeapi_cache_date", selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6).replace(/(^0+)/, "") + '--' + getWeekNo(moment(selectedDate).format('YYYY-MM-DD')));

                        displayTimetable(data);
                        if ($('.loading-overlay').hasClass('is-active')) {
                            document.getElementsByClassName('loading-overlay')[0].classList.remove('is-active');
                        }
                    }
                });
            }
        }
        //시간표 끝
    }
}

function refreshNewData() {
    console.log(newData)
    displayTimetable(newData);
    $('.snackbar').fadeOut(250);
}


function displayMeal(data) {
    //급식
    var day = selectedDate.substring(6, 8).replace(/(^0+)/, "");

    if (data.meal[day]) {
        $('#no-meal').hide();
        $('#exist-meal').fadeIn();
        currentMenuRaw = data.meal[day].toString().replace(':', '');
        var menuArr = currentMenuRaw.replaceAll('\'', '').replaceAll('[중식]', '').split('\n');
        var menuInfoTag = '';

        for (var i = 0; i < menuArr.length; i++) {
            if (menuArr[i].match(/\d+/)) {
                var allegyIndex = menuArr[i].match(/\d+/).index;
                var alle = menuArr[i].substring(allegyIndex, menuArr[i].length);
            } else {
                var alle = 'none';
                var allegyIndex = menuArr[i].length;
            }
            var menuName = menuArr[i].substring(0, allegyIndex);


            if (alleList != '') {
                var isDanger = false;
                var tempAlleList = alle.split('.');
                $.each(tempAlleList, function (index, element) {
                    if (alleList.split(',').includes(element)) {
                        isDanger = true;
                        return true;
                    }
                });


                if (isDanger) {
                    menuInfoTag += '<a class="mealItem dangerMeal" href="javascript:openMenuBanner(\'' + menuName + '\', \'' + alle + '\')">' + menuName + '</a><br>';
                } else {
                    var isFavorite = false;
                    $.each(favTagsList, function (index, element) {
                        console.log(element, menuName, element.indexOf(menuName) !== -1)
                        if ((menuName).includes(element)) {
                            isFavorite = true;
                            return true;
                        }
                    });

                    if (isFavorite) {
                        menuInfoTag += '<a class="mealItem favMenu" href="javascript:openMenuBanner(\'' + menuName + '\', \'' + alle + '\')">' + menuName + '✨</a><br>';
                    } else {
                        menuInfoTag += '<a class="mealItem" href="javascript:openMenuBanner(\'' + menuName + '\', \'' + alle + '\')">' + menuName + '</a><br>';
                    }
                }
            } else {
                var isFavorite = false;
                $.each(favTagsList, function (index, element) {
                    if ((menuName).includes(element)) {
                        isFavorite = true;
                        return true;
                    }
                });

                if (isFavorite) {
                    menuInfoTag += '<a class="mealItem favMenu" href="javascript:openMenuBanner(\'' + menuName + '\', \'' + alle + '\')">' + menuName + '✨</a><br>';
                } else {
                    menuInfoTag += '<a class="mealItem" href="javascript:openMenuBanner(\'' + menuName + '\', \'' + alle + '\')">' + menuName + '</a><br>';
                }
            }



        }


        $('#meal-menus').html(menuInfoTag);
        $('#meal-loader').hide();


        if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
            var items = document.getElementsByClassName('mealItem');
            for (var i = 0; i < items.length; i++) {
                items[i].classList.add("dark");
            }
        }

    } else {
        currentMenuRaw = '';
        $('#meal-loader').hide();
        $('#no-meal').fadeIn();
        $('#exist-meal').hide();
        $('#kcal').html('');
        $('#meal-menus').html('');
    }


}

function displaySchedule(data) {
    var schedules = data.schedule;
    var length = Object.keys(schedules).length - 2; //year, month 제외 해당 월 일 수 산출
    for (var i = 1; i <= length; i++) {
        if (schedules[i] != '') {
            $('#schedule-content').append('<div class="schedule-item"><span class="day-text">' + i + '</span><h3 class="schedule-name">' + schedules[i].replaceAll(',', "<br>") + '</h3></div>');
        }
    }

}

function displayTimetable(data) {
    var day = moment(selectedDate).day();
    var sections = document.querySelectorAll("th");
    for (var i = 0; i < sections.length; i++) {
        var item = sections.item(i);
        $(item).removeClass('active');
    }

    switch (day) {
        case 1:
            $('#m1').addClass('active');
            $('#m2').addClass('active');
            $('#m3').addClass('active');
            $('#m4').addClass('active');
            $('#m5').addClass('active');
            $('#m6').addClass('active');
            $('#m7').addClass('active');
            break;
        case 2:
            $('#tu1').addClass('active');
            $('#tu2').addClass('active');
            $('#tu3').addClass('active');
            $('#tu4').addClass('active');
            $('#tu5').addClass('active');
            $('#tu6').addClass('active');
            $('#tu7').addClass('active');
            break;
        case 3:
            $('#w1').addClass('active');
            $('#w2').addClass('active');
            $('#w3').addClass('active');
            $('#w4').addClass('active');
            $('#w5').addClass('active');
            $('#w6').addClass('active');
            $('#w7').addClass('active');
            break;
        case 4:
            $('#th1').addClass('active');
            $('#th2').addClass('active');
            $('#th3').addClass('active');
            $('#th4').addClass('active');
            $('#th5').addClass('active');
            $('#th6').addClass('active');
            $('#th7').addClass('active');
            break;
        case 5:
            $('#f1').addClass('active');
            $('#f2').addClass('active');
            $('#f3').addClass('active');
            $('#f4').addClass('active');
            $('#f5').addClass('active');
            $('#f6').addClass('active');
            $('#f7').addClass('active');
            break;
        default:
            break;

    }

    timetableRaw = data;
    for (var i = 0; i < data.mon.length; i++) {
        $('#m' + ((i + 1).toString())).html(data.mon[i].ITRT_CNTNT);
    }
    for (var i = 0; i < data.tue.length; i++) {
        $('#tu' + ((i + 1).toString())).html(data.tue[i].ITRT_CNTNT);
    }
    for (var i = 0; i < data.wed.length; i++) {
        $('#w' + ((i + 1).toString())).html(data.wed[i].ITRT_CNTNT);
    }
    for (var i = 0; i < data.thu.length; i++) {
        $('#th' + ((i + 1).toString())).html(data.thu[i].ITRT_CNTNT);
    }
    for (var i = 0; i < data.fri.length; i++) {
        $('#f' + ((i + 1).toString())).html(data.fri[i].ITRT_CNTNT);
    }
}

Kakao.init('c2c4f841a560ad18bfed29d190dfac19');

//kakao 공유
function shareMeal() {
    if (currentMenuRaw) {
        var menuArr = currentMenuRaw.replaceAll('\'', '').replaceAll('[중식]', '').split('\n');
        var menuInfoTag = '';

        for (var i = 0; i < menuArr.length; i++) {
            if (menuArr[i].match(/\d+/)) {
                var allegyIndex = menuArr[i].match(/\d+/).index;
                var alle = menuArr[i].substring(allegyIndex, menuArr[i].length);
            } else {
                var alle = 'none';
            }
            var menuName = menuArr[i].substring(0, allegyIndex);
            menuInfoTag += menuName + '\n';
        }

        var content = '<' + moment(selectedDate).lang("ko").format('M월 D일(dddd)') + ' 성일고 급식>\n' + menuInfoTag;
        Kakao.Link.sendDefault({
            objectType: 'text',
            text:
                content,
            link: {
                mobileWebUrl: 'https://sungil.vercel.app',
                webUrl: 'https://sungil.vercel.app',
            },
        })
    } else {
        $('#copied').text('내용 없음');
        setTimeout(function () {
            $('#copied').text('');
        }, 1000);
    }

}


const isMobile = () => { return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) }


// Detects if device is on iOS 
const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
}

//localstorage
var isWebappDismiss = localStorage.getItem('isWebappDismiss') || false;
// Detects if device is in standalone mode
const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

// Checks if should display install popup notification:
if (isIos() && !isInStandaloneMode()) {
    // offer app installation here
    //
    if (isWebappDismiss === false) {
        $('.pwaBanner').show();
        if (!isMobile()) {
            $('#desktop').show();
        } else {
            if (isIos()) {
                $('#ios').show();
            } else {
                $('#android').show();
            }
        }
        //
    }
}



//pwa 설치 안내 팝업
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    //
    //$('.pwaBanner').show();
    if (!isMobile()) {
        $('#desktop').show();
    } else {
        if (isIos()) {
            $('#ios').show();
        } else {
            $('#android').show();
        }
    }
});

function getWeekNo(v_date_str) {
    var date = new Date();
    if (v_date_str) {
        date = new Date(v_date_str);
    }
    return Math.ceil(date.getDate() / 7);
}



//kakao image search api
function search(query) {
    $.ajax({
        type: "GET",
        url: 'https://dapi.kakao.com/v2/search/image?query=' + query,
        headers: {
            'Authorization': 'KakaoAK a1cb5ad868a6adb4d8d59d2454d4b2bc'
        },
        success: function (result) {
            var data = result;
            i = 0;
            var image_result = '<img class="menu-image" src="' + data.documents[i].thumbnail_url + '" class="img-thumbnail" onclick="selectImage(\'' + data.documents[i].image_url + '\')">';

            $('#image_result').html(image_result);
        }
    });
}



function openMenuBanner(name, allegy) {
    if (allegy == 'none') {
        $('#allergy-info').html('알레르기 정보 없음');
    } else {

        var tempAlleList = allegy.split('.');
        $.each(tempAlleList, function (index, element) {
            if (alleList.split(',').includes(element)) {
                tempAlleList[index] = '?' + element + '!'
            } else { tempAlleList[index] = element }
        });
        allegy = tempAlleList.join(".");

        var allegyString = allegy.replace('10', '돼지고기').replace('11', '복숭아').replace('12', '토마토').replace('13', '아황산염').replace('14', '호두').replace('15', '닭고기').replace('16', '쇠고기').replace('17', '오징어').replace('18', '조개류(굴, 전복, 홍합 포함)').replace('19', '잣').replaceAll('.', ', ').replace('1', '난류').replace('2', '우유').replace('3', '메밀').replace('4', '땅콩').replace('5', '대두').replace('6', '밀').replace('7', '고등어').replace('8', '게').replace('9', '새우')
            .replaceAll('?', '<span id="dangerAllegy">').replaceAll('!', '</span>');
        $('#allergy-info').html(allegyString.substring(0, allegyString.length - 2));
    }

    search(name);
    $('.sheet-backdrop').addClass('backdrop-in');
    $('#menu-name').html(name);
    $('.menuBanner').show("slide", { direction: "down" }, 100);;

}

//메뉴 상세정보 팝업 이외 클릭 시 닫기
document.addEventListener('click', function (e) {
    if ($('.menuBanner').is(':visible')) {
        if (!$(e.target).hasClass("menuBanner")) {
            $('.sheet-backdrop').removeClass('backdrop-in');
            $('.menuBanner').hide("slide", { direction: "down" }, 100);;
        }

    }
});

//pwa 팝업 이외 클릭 시 닫기
document.addEventListener('click', function (e) {
    if ($('.pwaBanner').is(':visible')) {
        if (!$(e.target).hasClass("pwaBanner")) {
            $('.pwaBanner').hide("slide", { direction: "down" }, 100);;
        }

    }
});

/* bottom sheet */
$('.pop').on('click', function () {
    $('#modal-title').text('날짜 선택');
    $('#datepicker').show();
    $('#whatsnew').hide();
    $('#exam').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#datepicker').height() + 130 + 'px');
    }, 100);
});

$('.sheet-backdrop').on('click', function () {
    $('body').css('overflow', 'auto');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('display', 'none');
    }, 100);
    $('.sheet-backdrop').removeClass('backdrop-in');
});

/* bottom sheet */
$('.whatsnew-btn').on('click', function () {
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').text('새로운 기능');
    $('#datepicker').hide();
    $('#whatsnew').show();
    $('#exam').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#whatsnew').height() + 130 + 'px');
    }, 100);
});


$('#examSchedule').on('click', function () {
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').text('1학기 2차 지필평가 일정');
    $('#datepicker').hide();
    $('#whatsnew').hide();
    $('#exam').show();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    if (grade == '1') {
        $('.grade_btn').removeClass('active');
        $('.grade_btn:eq(0)').addClass('active');
        $('.exam1').show();
        $('.exam2').hide();
        $('.exam3').hide();
    } else if (grade == '2') {
        $('.grade_btn').removeClass('active');
        $('.grade_btn:eq(1)').addClass('active');
        $('.exam1').hide();
        $('.exam2').show();
        $('.exam3').hide();
    } else {
        $('.grade_btn').removeClass('active');
        $('.grade_btn:eq(2)').addClass('active');
        $('.exam1').hide();
        $('.exam2').hide();
        $('.exam3').show();
    }
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#tbody-timetable').height() + 230 + 'px');
    }, 100);
});


///custom modal sheet///
$('.c-modal').each(function () {
    var mc = new Hammer(this);

    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });

    mc.on("swipedown", function (ev) {
        console.log(ev)
        $('body').css('overflow', 'auto');
        $('.modal-in').css('bottom', '-1850px');
        setTimeout(function () {
            $('.modal-in').css('display', 'none');
        }, 100);

        $('.sheet-backdrop').removeClass('backdrop-in');
    });
});

$('.page-content').each(function () {
    var mc = new Hammer(this);

    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });

    mc.on("swipedown", function (ev) {
        console.log(ev)
        $('body').css('overflow', 'auto');
        $('.modal-in').css('bottom', '-1850px');
        setTimeout(function () {
            $('.modal-in').css('display', 'none');
        }, 100);

        $('.sheet-backdrop').removeClass('backdrop-in');
    });
});

$('.grade_btn').on('click', function () {
    $('.grade_btn').removeClass('active');
    $(this).addClass('active');
    var grade = $(this).attr('data-grade');

    if (grade == '1') {
        $('.exam1').show();
        $('.exam2').hide();
        $('.exam3').hide();
    } else if (grade == '2') {
        $('.exam1').hide();
        $('.exam2').show();
        $('.exam3').hide();
    } else {
        $('.exam1').hide();
        $('.exam2').hide();
        $('.exam3').show();
    }
});