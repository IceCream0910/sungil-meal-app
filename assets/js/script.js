const firebaseConfig = {
    apiKey: "AIzaSyDsE3S6NdSB_BO03pHBA3VVkCo6RWn-3Tw",
    authDomain: "ssoak-72f93.firebaseapp.com",
    projectId: "ssoak-72f93",
    storageBucket: "ssoak-72f93.appspot.com",
    messagingSenderId: "998236238275",
    appId: "1:998236238275:web:254b37e7a33448259ecd76",
    databaseURL: "https://ssoak-72f93-default-rtdb.firebaseio.com",
};

firebase.initializeApp(firebaseConfig);

moment.lang('ko', {
    weekdays: ["일", "월", "화", "수", "목", "금", "토"],
    weekdaysShort: ["일", "월", "화", "수", "목", "금", "토"],
});
moment.lang('en', {
    weekdays: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
    weekdaysShort: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
});


if (!window.matchMedia("screen and (min-width: 769px)").matches) { //모바일 => false
    updateOrder();
}


function updateOrder() {
    const orderIndex = JSON.parse(localStorage.getItem('ssoak-home-order')) || { "0": { "meal": 0 }, "1": { "timetable": 1 }, "2": { "selfcheck": 2 }, "3": { "schedule": 3 }, "4": { "notice": 4 } };
    for (var i = 0; i < 5; i++) {
        const key = Object.keys(orderIndex[i])[0];
        const value = orderIndex[i][key];
        switch (key) {
            case 'meal':
                $('.meal-wrap').data('index', value);
                break;
            case 'selfcheck':
                $('.selfcheck-wrap').data('index', value);
                break;
            case 'timetable':
                $('.siganpyo-wrap').data('index', value);
                break;
            case 'schedule':
                $('.schedule-wrap').data('index', value);
                break;
            case 'notice':
                $('.notice-wrap').data('index', value);
                break;
        }
    }
    orderElements();
}


function orderElements() {
    var listItems = Array.from(document.querySelectorAll("#order-item"));
    listItems.sort(function (a, b) {
        return $(a).data('index') - $(b).data('index');
    }).forEach(function (item) {
        document.querySelector(".home-order-wrap").appendChild(item);
    });
}

function isApp() {
    var ua = navigator.userAgent;
    if (ua.indexOf('hybridApp') > -1) {
        return true;
    } else {
        return false;
    }
}

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

var todayForDday = new Date();
var ddayDate = new Date(2022, 07, 22);
var gap = ddayDate.getTime() - todayForDday.getTime();
var ddayResult = Math.ceil(gap / (1000 * 60 * 60 * 24));
if (ddayResult > 0) {
    $('#dday').html('개학까지 ' + ddayResult + '일 남았어요');
} else if (ddayResult == 0) {
    $('#dday').html('오늘 개학이에요');
} else {
    $('#dday').html('등록되는대로 보여줄게요.');
}

var selectedDate = today;
$('#date').html(moment(selectedDate).lang("ko").format('M월 D일 (dddd)'));
$('#date').addClass('today');

var grade = localStorage.getItem("sungil_grade") || null;
var classNum = localStorage.getItem("sungil_classNum") || null;
var currentMenuRaw = '';
var timetableRaw = '';
var isTest = false;

var alleList;
const ENCRYPT_KEY = 'QXj2z5hrFXUcL9EGDDLf';

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

    if (grade == null || classNum == null) { //학년반 정보가 없을 경우 온보딩 표시
        console.log('dd')
        $('.onboard').css("display", "flex");
        $('#hello').css("display", "flex");
        $('#home').hide();
        setTimeout(function () {
            $('#hello').hide()
            $('#initialize').fadeIn()
        }, 2000);
    } else {
        $('#gradeClassLabel').html(grade + '학년 ' + classNum + '반');
    }

    updateInfo();
    //가정통신문
    $.ajax({
        type: "GET",
        url: "https://sungil-school-api.vercel.app/notices",
        success: function (result) {
            var data = JSON.parse(result);
            $('#notices-content').html('<h3 class="card__primary__title__text">가정통신문</h3><br>');
            for (var i = 0; i < 5; i++) {
                var title = data.articles[i].title;
                var createdAt = moment(new Date(data.articles[i].created_at)).format('YYYY-MM-DD');
                var link = data.articles[i].view_link;
                if (data.articles[i].files) {
                    var fileUrl = data.articles[i].files[0].url;
                    var fileName = data.articles[i].files[0].title;
                }
                $('#notices-content').append(`<div class="card notice-card" onclick="window.open('` + link + `', '_blank')">
            <h4>`+ title + `</h4>
            <div class="file-box" onclick="window.open('` + fileUrl + `', '_blank')">
            <ion-icon name="document-text-outline"></ion-icon>
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
            $('.timetable-wrap').hide();
            $('#nosetting-timetable').hide();
            $('#vacation-timetable').show();
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

//숫자 카운트 애니메이션 실행 함수
function counter(counter, max) {
    let now = max;

    const handle = setInterval(() => {
        $(counter).html(Math.ceil(max - now));

        // 목표에 도달하면 정지
        if (now < 1) {
            clearInterval(handle);
        }

        // 적용될 수치, 점점 줄어듬
        const step = now / 10;

        now -= step;
    }, 50);
}

var realTimeMealRef;

function displayMeal(data) {
    //급식
    var day = selectedDate.substring(6, 8).replace(/(^0+)/, "");

    if (data.meal[day]) {
        $('#no-meal').hide();
        $('#exist-meal').fadeIn();

        db.collection("meal").doc(selectedDate).onSnapshot(function (doc) {
            if (doc.exists) {
                $('#meal-like-count').html(doc.data().like);
                $('#meal-dislike-count').html(doc.data().dislike);
            } else {
                $('#meal-like-count').html('0');
                $('#meal-dislike-count').html('0');
                var mealRef = db.collection("meal").doc(selectedDate);
                mealRef.set({
                    like: 0,
                    dislike: 0
                })
            }
        });

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
            $('#schedule-content').append('<div class="schedule-item"><span class="day-text">' +
                `<span style="font-size: 20px;font-weight: 500;">${i}</span><span style="
            font-size: 12px;
            margin-top: -7px;
        ">${getDay(moment(moment(selectedDate).format('YYYYMM') + i.toString().padStart(2, '0')).format('d'))}</span></span>` + '<h3 class="schedule-name">' + schedules[i].replaceAll(',', "<br>") + '</h3></div>');
        }
    }
}

// 숫자를 요일로
function getDay(day) {
    var dayList = ['일', '월', '화', '수', '목', '금', '토'];
    return dayList[day];
}


function displayTimetable(data) {
    var day = moment(selectedDate).day();
    var sections = document.querySelectorAll("tbody th");
    for (var i = 0; i < sections.length; i++) {
        var item = sections.item(i);
        $(item).removeClass('active');
        $(item).html('');
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

        var tempElem = document.createElement('textarea');
        tempElem.value = content;
        document.body.appendChild(tempElem);
        tempElem.select();
        document.execCommand("copy");
        document.body.removeChild(tempElem);
        toast('급식 메뉴를 클립보드에도 복사했어요');

        Kakao.Link.sendDefault({
            objectType: 'text',
            text:
                content,
            link: {
                mobileWebUrl: 'https://sungil.me/welcome.html',
                webUrl: 'https://sungil.me/welcome.html',
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


function getWeekNo(v_date_str) {
    var date = new Date();
    if (v_date_str) {
        date = new Date(v_date_str);
    }
    return Math.ceil(date.getDate() / 7);
}



//kakao image search api
function imageSearch(query) {
    $.ajax({
        type: "GET",
        url: 'https://www.googleapis.com/customsearch/v1?key=AIzaSyCSJZaed6FebVZm2mEqbeIeHyspQfHKjwI&cx=35cc76baf4e73d7f8&searchType=image&q=' + query,
        success: function (result) {
            console.log(result.items[0].link)
            var image_result = `<figure itemprop="associatedMedia" itemscope itemtype="http://schema.org/ImageObject">
            <a href="${result.items[0].link}" itemprop="contentUrl"
                data-size="${result.items[0].width}x${result.items[0].height}">
                <img src="${result.items[0].link}" itemprop="thumbnail" onerror="this.src='assets/icons/menu_blank.png'" class="menu-image" style="border-radius:10px;"/>
            </a>
            <figcaption style="display:none;" itemprop="caption description">위 이미지는 실제 메뉴 사진이 아닌 인터넷 검색 결과예요.</figcaption>

        </figure>`
            $('#image_result').html(image_result);
            setTimeout(function () {
                $('.sheet-modal').css('height', $('#menuInfo').height() + 70 + 'px');
            }, 100);
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
    $('#menu-name').html(name);
    imageSearch(name);
    openModal('', 'menuInfo')
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#menuInfo').height() + 70 + 'px');
    }, 100);
}

/* bottom sheet */
$('.pop').on('click', function () {
    openModal('날짜 선택', 'datepicker')
});

$('.sheet-backdrop').on('click', function () {
    closeModal();
});

/* bottom sheet */

///custom modal sheet///
$('.c-modal').each(function () {

    var mc = new Hammer(this);

    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });

    mc.on("swipedown", function (ev) {
        if (!$('#loginForm').is(':visible') && !$('#writePost').is(':visible')) {
            closeModal();
        }
    });


});

$('.page-content').each(function () {
    if (!$('#loginForm').is(':visible')) {
        var mc = new Hammer(this);

        mc.get('swipe').set({
            direction: Hammer.DIRECTION_ALL
        });

        mc.on("swipedown", function (ev) {
            if (!$('#loginForm').is(':visible') && !$('#assessment').is(':visible') && !$('#myClassAssign').is(':visible') && !$('#account').is(':visible') && !$('#writePost').is(':visible')) {
                closeModal();
            }
        });
    }
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


/*
$('.main-nav').hide();
$('#home').hide();
$('#community').show();
$('#assignment').hide();
$('#report').hide();
*/
$('.main-nav').show();
$('#home').fadeIn();
$('#community').hide();
$('#assignment').hide();
$('#report').hide();



$('.bottom-nav a').on('click', function () {
    $('.bottom-nav a').removeClass('active');
    $('.bottom-nav a').removeClass('bounce');
    $(this).addClass('active');
    $(this).addClass('bounce');
    $('html, body').animate({
        scrollTop: 0
    }, 'fast');

    var tab = $(this).attr('data-tab');
    $('.bottom-nav').removeClass("non-border");
    disablePullToRefresh();
    switch (tab) {
        case 'home':
            $('.main-nav').show();
            $('#home').fadeIn();
            $('#community').hide();
            $('#assignment').hide();
            $('#report').hide();
            $('.bottom-nav').addClass("non-border");
            isBigScreen() ? $('.bottom-nav').css('border-radius', '0 0 20px 20px') : $('.bottom-nav').css('border-radius', '0');
            $('#tab1').attr('name', 'planet');
            $('#tab2').attr('name', 'chatbubbles-outline');
            $('#tab3').attr('name', 'file-tray-full-outline');
            break;
        case 'community':
            enablePullToRefresh();
            $('.main-nav').hide();
            $('#home').hide();
            $('#community').fadeIn(500);
            $('#assignment').hide();
            $('#report').hide();
            isBigScreen() ? $('.bottom-nav').css('border-radius', '20px') : $('.bottom-nav').css('border-radius', '20px 20px 0 0');
            $('#tab1').attr('name', 'planet-outline');
            $('#tab2').attr('name', 'chatbubbles');
            $('#tab3').attr('name', 'file-tray-full-outline');
            $('#community-frame').height($(window).height() - $('.bottom-nav').height() - 20);
            break;
        case 'assignment':
            $('.main-nav').hide();
            $('#home').hide();
            $('#community').hide();
            $('#assignment').fadeIn(500);
            $('#report').hide();
            isBigScreen() ? $('.bottom-nav').css('border-radius', '20px') : $('.bottom-nav').css('border-radius', '20px 20px 0 0');
            $('#tab1').attr('name', 'planet-outline');
            $('#tab2').attr('name', 'chatbubbles-outline');
            $('#tab3').attr('name', 'file-tray-full');
            break;
        case 'report':
            $('.main-nav').hide();
            $('#home').hide();
            $('#community').hide();
            $('#assignment').hide();
            $('#report').fadeIn(500);
            isBigScreen() ? $('.bottom-nav').css('border-radius', '20px') : $('.bottom-nav').css('border-radius', '20px 20px 0 0');
            $('#tab1').attr('name', 'planet-outline');
            $('#tab2').attr('name', 'chatbubbles-outline');
            $('#tab3').attr('name', 'file-tray-full-outline');
            $('#tab4').attr('name', 'stats-chart');
            break;
    }

});


function isBigScreen() {
    if (window.matchMedia('(min-width: 769px)').matches) {
        return true;
    } else {
        return false;
    }
}



//toast
function toast(msg) {
    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
        Toastify({
            text: msg,
            duration: 2200,
            newWindow: true,
            close: false,
            gravity: "bottom", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: false, // Prevents dismissing of toast on hover
            style: {
                background: "rgba(0, 0, 0, 0.4)",
                color: "inherit",
                border: "none",
                borderRadius: "10px",
                boxShadow: "none",
                borderTop: "1px solid rgba(70, 70, 70, 0.4)",
            },
            onClick: function () { $('.toastify').fadeOut(); }
        }).showToast();
    } else {
        Toastify({
            text: msg,
            duration: 2200,
            newWindow: true,
            close: false,
            gravity: "bottom", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: false, // Prevents dismissing of toast on hover
            style: {
                background: "rgba(255, 255, 255, 0.4)",
                color: "inherit",
                border: "none",
                borderRadius: "10px",
                boxShadow: "none",
                borderTop: "1px solid rgba(58, 58, 58, 0.2)",
            },
            onClick: function () { $('.toastify').hide(); }
        }).showToast();
    }
}

//confirm
const ui = {
    confirm: async (message) => createConfirm(message)
}

const createConfirm = (message) => {
    return new Promise((complete, failed) => {
        $('#confirmMessage').text(message)

        $('#confirmYes').off('click');
        $('#confirmNo').off('click');

        $('#confirmYes').on('click', () => { $('.confirm').hide(); complete(true); });
        $('#confirmNo').on('click', () => { $('.confirm').hide(); complete(false); });

        $('.confirm').show();
    });
}

//PullToRefresh
var refresher = PullToRefresh.init({
    mainElement: 'main',
    onRefresh: function () {
        loadPostList(currentCategory);
    }
});

function enablePullToRefresh() {
    $('.ptr--ptr').remove();
    refresher = PullToRefresh.init({
        mainElement: 'main',
        onRefresh: function () {
            loadPostList(currentCategory);
        }
    });
}

function disablePullToRefresh() {
    refresher.destroy();
}

setTimeout(function () {
    if (!isTest) {
        var cssRule = "font-size:25px;color:#ff4043;";
        var cssRule2 = "font-size:15px;";
        //console.clear();
        console.log("%c경고!", cssRule);
        console.log("%c이 기능은 개발자용으로 브라우저에서 제공되는 내용입니다.\n누군가 기능을 악의적으로 사용하거나 다른 사람의 계정을 '해킹'하기 위해 여기에 특정 콘텐츠를 복사하여 붙여넣으라고 했다면 사기 행위로 간주하세요.\n해당 경고문을 보고 있는 본인 역시, 개발자도구를 이용해 악의적인 공격을 시도한다면 법적 처벌을 받을 수 있습니다.", cssRule2);
    }
}, 5000);

//prevent f12
document.onkeydown = function (e) {
    if (e.keyCode == 123) {
        toast('보안 상의 이유로 금지된 동작입니다.')
        return false;
    }
}


window.addEventListener('load', () => {
    let matches = document.querySelectorAll("ins.ADSENSE");

    Array.from(matches).forEach((element) => {
        let parentElement = element.parentElement;
        if (window.getComputedStyle(parentElement).getPropertyValue("display") === "none") {
            element.remove();
        } else {
            element.classList.remove("ADSENSE");
            element.classList.add("adsbygoogle");
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    });

});


function shareApp() {
    const content = `성일고를 위한 모든 정보, 한 번에 쏙\n\n급식 메뉴부터 실시간 시간표, 익명 커뮤니티, 수행평가 정리까지 쏙에서 확인해보세요!\n\nhttps://sungil.me`
    var tempElem = document.createElement('textarea');
    tempElem.value = content;
    document.body.appendChild(tempElem);
    tempElem.select();
    document.execCommand("copy");
    document.body.removeChild(tempElem);
    toast('공유 메시지를 클립보드에도 복사했어요');

    Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
            title: '성일고를 위한 모든 정보, 한 번에 쏙',
            description: '급식 메뉴부터 실시간 시간표, 익명 커뮤니티, 수행평가 정리까지 쏙에서 확인해보세요!',
            imageUrl: "https://i.imgur.com/5LqdyDL.png",
            link: {
                mobileWebUrl: 'https://sungil.me/welcome.html',
                webUrl: 'https://sungil.me/welcome.html',
            },
        },
        buttons: [{
            title: '지금 바로 써보기',
            link: {
                mobileWebUrl: 'https://sungil.me/welcome.html',
                webUrl: 'https://sungil.me/welcome.html',
            },
        },],
    })
}


getSelfCheckStatus()

function getSelfCheckStatus() {
    const name = localStorage.getItem('selfcheck-name');
    const birth = localStorage.getItem('selfcheck-birth');
    const pwd = localStorage.getItem('selfcheck-pwd');
    if (name == null || birth == null || pwd == null) {
        $('#selfcheck-status').text('학생 정보를 입력해주세요');
    } else {
        // 복호화
        if (pwd.length > 4) {
            const bytes = window.CryptoJS.AES.decrypt(pwd, ENCRYPT_KEY);
            var decryptPwd = bytes.toString(window.CryptoJS.enc.Utf8);
        } else {
            decryptPwd = pwd;
            // 암호화
            const encrypt = window.CryptoJS.AES.encrypt(pwd, ENCRYPT_KEY).toString();
            localStorage.setItem('selfcheck-pwd', encrypt);
        }
        $.ajax({
            type: "GET",
            url: `https://selfcheck-api.vercel.app/status?name=${name}&birth=${birth}&password=${decryptPwd}`,
            success: function (result) {
                if (result) {
                    if (result[0].registerRequired == true) { //안함
                        $('#selfcheck-status').text('오늘 제출 안 함')
                    } else {
                        $('#selfcheck-status').text(`${moment(result[0].registeredAt).format('HH시 mm분')} ${(result[0].isHealthy) ? '정상으로' : '유증상으로'} 제출`)
                    }

                } else {
                    $('#selfcheck-status').text('불러오기 실패')
                }
            },
            error: function (request, status, error) {
                $('#selfcheck-status').text('불러오기 실패');
                toast('자가진단 정보를 불러오는 데 실패했어요. 정보를 모두 올바르게 입력했는지 확인해주세요.')
            }
        });
    }

}

function openSelfcheckModal() {
    openModal('자가진단 정보 수정', 'selfcheck');
    const name = localStorage.getItem('selfcheck-name') || '';
    const birth = localStorage.getItem('selfcheck-birth') || '';
    const pwd = localStorage.getItem('selfcheck-pwd') || '';

    $('#selfcheck-name').val(name)
    $('#selfcheck-birth').val(birth)

    if (pwd.length > 4) {
        const bytes = window.CryptoJS.AES.decrypt(pwd, ENCRYPT_KEY);
        var decryptPwd = bytes.toString(window.CryptoJS.enc.Utf8);
        $('#selfcheck-pwd').val(decryptPwd)
    } else {
        $('#selfcheck-pwd').val(pwd)
    }


}

function submitSelfCheck() {
    const name = localStorage.getItem('selfcheck-name');
    const birth = localStorage.getItem('selfcheck-birth');
    const pwd = localStorage.getItem('selfcheck-pwd');

    if (name == null || birth == null || pwd == null) {
        openModal('자가진단 정보 수정', 'selfcheck');
    } else {
        // 복호화
        if (pwd.length > 4) {
            const bytes = window.CryptoJS.AES.decrypt(pwd, ENCRYPT_KEY);
            var decryptPwd = bytes.toString(window.CryptoJS.enc.Utf8);
        } else {
            decryptPwd = pwd;
            // 암호화
            const encrypt = window.CryptoJS.AES.encrypt(pwd, ENCRYPT_KEY).toString();
            localStorage.setItem('selfcheck-pwd', encrypt);
        }

        const progressText = ['서버 로딩 중', '제출하고 있어요', '조금만 기다려주세요', '거의 다됐어요'];
        $('#selfcheck-btn').html('서버 로딩 중');
        $('#selfcheck-btn').attr('disabled', true);
        var progressCnt = 1;
        const progress = setInterval(function () {
            $('#selfcheck-btn').html(progressText[progressCnt]);
            if (progressCnt == 3) {
                progressCnt = 0;
            } else {
                progressCnt++;
            }
        }, 3000);

        //1초마다 ...개수 변경
        var dotCnt = 0;
        const dot = setInterval(function () {
            if (dotCnt == 3) {
                dotCnt = 0;
            } else {
                dotCnt++;
            }
            $('#selfcheck-btn').html(progressText[progressCnt] + '.'.repeat(dotCnt));
        }, 500);

        $.ajax({
            type: "GET",
            url: `https://selfcheck-api.vercel.app/api?name=${name}&birth=${birth}&password=${decryptPwd}`,
            success: function (result) {
                clearInterval(progress);
                clearInterval(dot);
                if (result) {
                    if (result.success == true) {
                        toast('자가진단을 제출했어요')
                        $('#selfcheck-status').text(`${moment().format('HH시 mm분')} 제출`)
                        getSelfCheckStatus();
                    } else {
                        toast('자가진단 제출에 실패했어요.')
                    }
                } else {
                    toast('자가진단 제출에 실패했어요.')
                }
                $('#selfcheck-btn').html(`<ion-icon name="checkmark-outline"></ion-icon>자가진단 완료`);
                $('#selfcheck-btn').attr('disabled', false);
                setTimeout(function () {
                    $('#selfcheck-btn').html(`<ion-icon name="flash"></ion-icon>제출하기`);
                }, 3000);

            },
            error: function (request, status, error) {
                clearInterval(progress);
                clearInterval(dot);
                $('#selfcheck-btn').html(`<ion-icon name="warning"></ion-icon>자가진단 실패`);
                setTimeout(function () {
                    $('#selfcheck-btn').html(`<ion-icon name="flash"></ion-icon>제출하기`);
                }, 3000);
                toast('자가진단 제출에 실패했어요. 정보를 올바르게 입력했는지 확인해주세요.')
            }
        });
    }
}

function saveSelfcheckInfo() {
    const name = $('#selfcheck-name').val();
    const birth = $('#selfcheck-birth').val();
    const pwd = $('#selfcheck-pwd').val();

    if (name == '' || birth == '' || pwd == '' || birth.length != 6) {
        toast('모든 정보를 올바르게 입력해주세요')
    } else {
        localStorage.setItem('selfcheck-name', name);
        localStorage.setItem('selfcheck-birth', birth);
        // 암호화
        const encrypt = window.CryptoJS.AES.encrypt(pwd, ENCRYPT_KEY).toString();
        localStorage.setItem('selfcheck-pwd', encrypt);
        toast('저장되었어요');
        $('#selfcheck-status').text('불러오는 중');
        getSelfCheckStatus();
        closeModal();
    }
}


$(window).resize(function () {
    if (!window.matchMedia("screen and (min-width: 769px)").matches) { //모바일 => false
        updateOrder();
    } else {
        $('.meal-wrap').data('index', '0');
        $('.selfcheck-wrap').data('index', '1');
        $('.siganpyo-wrap').data('index', '2');
        $('.schedule-wrap').data('index', '3');
        $('.notice-wrap').data('index', '4');
        orderElements();
    }
});


function openModal(title, id) {
    disablePullToRefresh();
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').html(title);
    $('.content-wrap').hide();
    $('#' + id).show();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    $('#assessment #date_assign').val(moment().format('YYYY-MM-DD'));
    $('#title').val('');
    $('.timetable_selector').html('');
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#' + id).height() + 130 + 'px');
    }, 100);
}

function openFullModal(title, id) {
    disablePullToRefresh();
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').html(title);
    $('.content-wrap').hide();
    $('#' + id).show();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    $('#assessment #date_assign').val(moment().format('YYYY-MM-DD'));
    $('#title').val('');
    $('.timetable_selector').html('');
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    $('.sheet-modal').css('height', '100vh');
}


function closeModal() {
    enablePullToRefresh();
    $('body').css('overflow', 'auto');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('display', 'none');
    }, 100);
    $('.sheet-backdrop').removeClass('backdrop-in');
    $('.sheet-backdrop-nocancel').removeClass('backdrop-in');

}


//onboard 학년 반 설정
var isComplete = false;

$("#grade-list li").on("click", function () {
    grade = $(this).data('grade');
    $("#button-text").text(grade + '학년');
    $('#back-btn').css('opacity', '1');
    $('#back-btn').show();
    $('#save-btn').show();
    $('#grade-list').hide();
    $('#class-list').fadeIn();
});

$("#class-list li").on("click", function () {
    classNum = $(this).data('class');
    $("#button-text").text(grade + '학년 ' + classNum + '반');
    $('#save-btn').css('opacity', '1');
    isComplete = true;
});

function back() {
    $("#button-text").text('다음');
    $('#grade-list').fadeIn();
    $('#class-list').hide();
    $('#back-btn').css('opacity', '0.5');
    $('#save-btn').css('opacity', '0.5');
    isComplete = false;
}

function completeInfoInit() {
    if (isComplete) {
        $('#initialize').hide()
        $('#login').css("display", "flex")
        $('#login').hide()
        $('#login').fadeIn()
    }
}

function startFromOnboard() {
    localStorage.setItem("sungil_grade", grade);
    localStorage.setItem("sungil_classNum", classNum);
    location.reload();
}

function onboardLogin() {
    if (isApp()) {
        location.href = 'https://ssoak-72f93.firebaseapp.com/';
        $('.sheet-backdrop-nocancel2').addClass('backdrop-in');
        $('#login-loader').show();
    } else {
        $('.sheet-backdrop-nocancel2').addClass('backdrop-in');
        $('#login-loader').show();
        loginGoogle().then(function (result) {
            //로그인 완료
            $('#login').hide()
            $('#complete').css("display", "flex")
            $('#complete').hide()
            $('#complete').fadeIn()
        })
    }
}

function skipLogin() {
    $('#login').hide()
    $('#complete').css("display", "flex")
    $('#complete').hide()
    $('#complete').fadeIn()
}

function mealLikeBtn() {if(log) {
    log.split(',');
    if(log.indexOf(selectedDate) > -1) { 
        toast('이미 반응을 표시한 날짜의 급식이에요.');
    } else {
    localStorage.setItem("ssoak_meal_reaction_log", log.push(selectedDate).toString());
    var mealRef = db.collection("meal").doc(selectedDate);
    mealRef.get().then(function (doc) {
        if (doc.exists) {
            mealRef.update({
                dislike: doc.data().dislike + 1
            })
        } else {
            mealRef.set({
                like: 0,
                dislike: 1
            })
        }
      });
    }
} else {
    localStorage.setItem("ssoak_meal_reaction_log", log.push(selectedDate).toString());
    var mealRef = db.collection("meal").doc(selectedDate);
    mealRef.get().then(function (doc) {
        if (doc.exists) {
            mealRef.update({
                dislike: doc.data().dislike + 1
            })
        } else {
            mealRef.set({
                like: 0,
                dislike: 1
            })
        }
      });
    }

}

function mealdislikeBtn() {
var log = localStorage.getItem("ssoak_meal_reaction_log");
    if(log) {
        log.split(',');
        if(log.indexOf(selectedDate) > -1) { 
            toast('이미 반응을 표시한 날짜의 급식이에요.');
        } else {
        localStorage.setItem("ssoak_meal_reaction_log", log.push(selectedDate).toString());
        var mealRef = db.collection("meal").doc(selectedDate);
        mealRef.get().then(function (doc) {
            if (doc.exists) {
                mealRef.update({
                    dislike: doc.data().dislike + 1
                })
            } else {
                mealRef.set({
                    like: 0,
                    dislike: 1
                })
            }
          });
        }
    } else {
        localStorage.setItem("ssoak_meal_reaction_log", log.push(selectedDate).toString());
        var mealRef = db.collection("meal").doc(selectedDate);
        mealRef.get().then(function (doc) {
            if (doc.exists) {
                mealRef.update({
                    dislike: doc.data().dislike + 1
                })
            } else {
                mealRef.set({
                    like: 0,
                    dislike: 1
                })
            }
          });
        }

}


