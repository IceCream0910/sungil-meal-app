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

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState == 'visible') {
        console.log('시간표 현재 교시 갱신')
        const currentPeriod = getCurrentPeriod();
        if (currentPeriod == 'null') {
            if (day === 5) {
                // 다음주 월요일로 selectedDate를 변경
                let nextMonday = moment().add(1, 'weeks').startOf('week').add(1, 'days');
                selectedDate = nextMonday.format('YYYYMMDD');
                updateInfo();
                $('#timetable-title').html(`미리보는 월요일 시간표
    <ion-icon name=chevron-forward-outline></ion-icon>`);
                $('#meal-title').html(`월요일에 먹게 될 급식
    <ion-icon name=chevron-forward-outline></ion-icon>`);
                $('#timetable_horz_' + currentPeriod).removeClass('active');
                $('.timetable-horizontal-progress').css({ 'width': 0 })
            } else {
                forwardDate();
                $('#timetable-title').html(`내일 시간표
        <ion-icon name=chevron-forward-outline></ion-icon>`);
                $('#meal-title').html(`내일 먹게 될 급식
        <ion-icon name=chevron-forward-outline></ion-icon>`);
                $('#timetable_horz_' + currentPeriod).removeClass('active');
                $('.timetable-horizontal-progress').css({ 'width': 0 });
            }
        } else {
            if (day === 6) {
                // 다음주 월요일로 selectedDate를 변경
                let nextMonday = moment().add(1, 'weeks').startOf('week').add(1, 'days');
                selectedDate = nextMonday.format('YYYYMMDD');
                updateInfo();
                $('#timetable-title').html(`미리보는 월요일 시간표
    <ion-icon name=chevron-forward-outline></ion-icon>`);
                $('#meal-title').html(`월요일에 먹게 될 급식
    <ion-icon name=chevron-forward-outline></ion-icon>`);
                $('#timetable_horz_' + currentPeriod).removeClass('active');
                $('.timetable-horizontal-progress').css({ 'width': 0 })
            } else if (day === 0) {
                // 다음주 월요일로 selectedDate를 변경
                forwardDate();
                $('#timetable-title').html(`미리보는 월요일 시간표
    <ion-icon name=chevron-forward-outline></ion-icon>`);
                $('#meal-title').html(`월요일에 먹게 될 급식
    <ion-icon name=chevron-forward-outline></ion-icon>`);
                $('#timetable_horz_' + currentPeriod).removeClass('active');
                $('.timetable-horizontal-progress').css({ 'width': 0 })
            } else {
                $('#timetable_horz_' + currentPeriod).addClass('active');
                $('.timetable-horizontal-progress').css({ 'width': `${7.14 * (currentPeriod * 2 - 1)}%` })
            }
            
        }
    }
});

//안드로이드 앱인지 확인
function isApp() {
    var ua = navigator.userAgent;
    if (ua.indexOf('hybridApp') > -1) {
        return true;
    } else {
        return false;
    }
}

if (isApp()) {
    const isActiveMealPush = localStorage.getItem("android-noti") || true;
    if (isActiveMealPush) {
        //Android.setNotiEnable(true);
    } else {
        Android.setNotiEnable(false);
    }
}

var today = moment(new Date()).format('YYYYMMDD');
var day = new Date().getDay();
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


/* 새학기 학년/반 정보 수정 안내
var isChangeNewInfo2023 = localStorage.getItem("sungil_isChangeNewInfo2023") || false;
if (!isChangeNewInfo2023 && grade && classNum) {
    openModal('새학년 정보를 알려주세요', 'gradeClassSettings');
    localStorage.setItem("sungil_isChangeNewInfo2023", true)
}
*/

function updateDday() {
    var todayForDday = new Date();
    var ddayDate = new Date(2023, 7, 21);
    var gap = ddayDate.getTime() - todayForDday.getTime();
    var ddayResult = Math.ceil(gap / (1000 * 60 * 60 * 24));
    if (ddayResult <= 0) {
        $('#dday-startSem').html(`D+${-(ddayResult)}`);
    } else {
        $('#dday-startSem').html(`D-${-(ddayResult * -1)}`);
    }

    var ddayDate_suneung = new Date(2023, 10, 16);
    var gap_suneung = ddayDate_suneung.getTime() - todayForDday.getTime();
    var ddayResult_suneung = Math.ceil(gap_suneung / (1000 * 60 * 60 * 24));
    $('#dday-suneung').html(`D-${-(ddayResult_suneung * -1)}`);
}
updateDday();

/*

$('#examSchedule').on('click', function () {
    openModal('2학기 2차 지필평가 일정', 'exam');
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
        $('.grade_btn:eq(1)').addClass('active');
        $('.exam1').hide();
        $('.exam2').show();
        $('.exam3').hide();
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
    }
    $('.sheet-modal').css('height', $('#' + id).height() + 150 + 'px');
});
*/

$(document).ready(function () {

    if (grade == null || classNum == null) { //학년반 정보가 없을 경우 온보딩 표시
        startOnBoarding();
    } else {
        $('#gradeClassLabel').html(grade + '학년 ' + classNum + '반');
    }

    updateInfo();
    loadNotices();

    //주말인경우
    if (day === 6) {
        // 다음주 월요일로 selectedDate를 변경
        let nextMonday = moment().add(1, 'weeks').startOf('week').add(1, 'days');
        selectedDate = nextMonday.format('YYYYMMDD');
        updateInfo();
        $('#timetable-title').html(`미리보는 월요일 시간표
    <ion-icon name=chevron-forward-outline></ion-icon>`);
        $('#meal-title').html(`월요일에 먹게 될 급식
    <ion-icon name=chevron-forward-outline></ion-icon>`);
        $('.timetable-horizontal-item').forEach(function (item) {
            $(item).removeClass('active')
        });
        $('.timetable-horizontal-progress').css({ 'width': 0 });
    } else if(day === 0) {
        forwardDate();
        $('#timetable-title').html(`미리보는 월요일 시간표
    <ion-icon name=chevron-forward-outline></ion-icon>`);
        $('#meal-title').html(`월요일에 먹게 될 급식
    <ion-icon name=chevron-forward-outline></ion-icon>`);
        $('.timetable-horizontal-item').forEach(function (item) {
            $(item).removeClass('active')
        });
        $('.timetable-horizontal-progress').css({ 'width': 0 });
    }
    //종례 후
    const currentPeriod = getCurrentPeriod();
    if (currentPeriod == 'null') {
        if (day === 5) {
            // 다음주 월요일로 selectedDate를 변경
            let nextMonday = moment().add(1, 'weeks').startOf('week').add(1, 'days');
            selectedDate = nextMonday.format('YYYYMMDD');
            updateInfo();
            $('#timetable-title').html(`미리보는 월요일 시간표
    <ion-icon name=chevron-forward-outline></ion-icon>`);
            $('#meal-title').html(`월요일에 먹게 될 급식
    <ion-icon name=chevron-forward-outline></ion-icon>`);
            $('#timetable_horz_' + currentPeriod).removeClass('active');
            $('.timetable-horizontal-progress').css({ 'width': 0 })
        } else {
            forwardDate();
            $('#timetable-title').html(`내일 시간표
        <ion-icon name=chevron-forward-outline></ion-icon>`);
            $('#meal-title').html(`내일 먹게 될 급식
        <ion-icon name=chevron-forward-outline></ion-icon>`);
            $('#timetable_horz_' + currentPeriod).removeClass('active');
            $('.timetable-horizontal-progress').css({ 'width': 0 });
        }
    } else {
        $('#timetable_horz_' + currentPeriod).removeClass('active');
        $('#timetable_horz_' + currentPeriod).addClass('active');
        $('.timetable-horizontal-progress').css({ 'width': `${7.14 * (currentPeriod * 2 - 1)}%` })
    }
});




//가정통신문
function loadNotices() {
    $.ajax({
        type: "GET",
        url: "https://sungil-school-api.vercel.app/notices",
        success: function (result) {
            var data = JSON.parse(result);
            $('#notices-content').html('<h3 class="card__primary__title__text">가정통신문</h3><br>');
            for (var i = 0; i < 10; i++) {
                var title = data.articles[i].title;
                var createdAt = moment(new Date(data.articles[i].created_at)).format('YYYY-MM-DD');
                if (data.articles[i].files) {
                    var fileUrl = data.articles[i].files.find(function (file) {
                        return file.url.endsWith('.pdf');
                    }).url;
                    var link = `https://docs.google.com/gview?url=${fileUrl}&embedded=true`;
                }
                if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                    //다크모드
                    $('#notices-content').append(`<div class="card notice-card dark" onclick="window.open('` + link + `', '_blank')">
            <h4 style="font-weight:600;">`+ title + `</h4>
            <p style="opacity:0.7;">`+ createdAt + `</p>
        </div>`);
                } else {
                    $('#notices-content').append(`<div class="card notice-card" onclick="window.open('` + link + `', '_blank')">
            <h4 style="font-weight:600;">`+ title + `</h4>
            <p style="opacity:0.7;">`+ createdAt + `</p>
        </div>`);
                }

            }
        }
    });
}


function backDate() {
    let yesterday = moment(selectedDate).add(-1, 'days');
    selectedDate = moment(yesterday).format('YYYYMMDD');
    $("#datepicker").datepicker("setDate", moment(yesterday).format('YYYY-MM-DD'));
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
    $("#datepicker").datepicker("setDate", moment(tomorrow).format('YYYY-MM-DD'));
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

var mealData;
var scheduleData;
var newData;
function updateInfo() {
    var cachedMealData = JSON.parse(localStorage.getItem("sungil_meal_cache")) || null;
    var cachedMealData_date = localStorage.getItem("sungil_meal_cache_date") || null;
    var cachedScheduleData = JSON.parse(localStorage.getItem("sungil_schedule_cache")) || null;
    var cachedScheduleData_date = localStorage.getItem("sungil_schedule_cache_date") || null;
    var requestDate = selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6).replace(/(^0+)/, "");
    $('#meal-loader').show();
    $('#meal-menus').empty();
    if (!isTest) {
        if (cachedMealData && cachedMealData_date == requestDate && cachedMealData.length > 0) {
            displayMeal(cachedMealData);
            $.ajax({
                type: "GET",
                url: "https://sungil-school-api.vercel.app/meal/" + selectedDate,
                success: function (result) {
                    mealData = result;
                    localStorage.setItem("sungil_meal_cache", JSON.stringify(mealData));
                    localStorage.setItem("sungil_meal_cache_date", selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6).replace(/(^0+)/, ""));
                    if (mealData) {
                        displayMeal(mealData);
                    }
                }
            });
        } else {
            $.ajax({
                type: "GET",
                url: "https://sungil-school-api.vercel.app/meal/" + selectedDate,
                success: function (result) {
                    mealData = result;
                    localStorage.setItem("sungil_meal_cache", JSON.stringify(mealData));
                    localStorage.setItem("sungil_meal_cache_date", selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6).replace(/(^0+)/, ""));
                    if (mealData) {
                        displayMeal(mealData);
                    }
                }
            });
        }
        $('#schedule-content').html('');
        if (cachedScheduleData && cachedScheduleData_date == requestDate && cachedScheduleData.length > 0) {
            displaySchedule(cachedScheduleData);
        } else {
            $.ajax({
                type: "GET",
                url: "https://sungil-school-api.vercel.app/schedule/" + selectedDate,
                success: function (result) {
                    scheduleData = JSON.parse(result);
                    localStorage.setItem("sungil_schedule_cache", JSON.stringify(scheduleData));
                    localStorage.setItem("sungil_schedule_cache_date", selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6).replace(/(^0+)/, ""));
                    if (scheduleData) {
                        displaySchedule(scheduleData);
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
            $('.timetable-wrap').show();
            $('#nosetting-timetable').hide();

            var cachedTimeData = JSON.parse(localStorage.getItem("sungil_timeapi_cache")) || null;
            var cachedTimeData_date = localStorage.getItem("sungil_timeapi_cache_date") || null;
            var requestTimeDate = selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6).replace(/(^0+)/, "") + '--' + getWeekNo(moment(selectedDate).format('YYYY-MM-DD'));

            if (cachedTimeData && cachedTimeData_date == requestTimeDate) {
                displayTimetable(cachedTimeData);
                $('#timetable-loader').show();
                $.ajax({
                    type: "GET",
                    url: 'https://sungil-school-api.vercel.app/timetable?date=' + selectedDate + '&grade=' + grade + '&classNum=' + classNum,
                    success: function (result_time) {
                        var data = JSON.parse(result_time);
                        if (JSON.stringify(cachedTimeData) != JSON.stringify(data)) {
                            localStorage.setItem("sungil_timeapi_cache", JSON.stringify(data));
                            localStorage.setItem("sungil_timeapi_cache_date", selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6).replace(/(^0+)/, "") + '--' + getWeekNo(moment(selectedDate).format('YYYY-MM-DD')));
                            displayTimetable(data);
                        }
                        $('#timetable-loader').hide();
                    }
                });

            } else {
                $('.timetable-wrap table').show();
                $('.vacation-wrap').hide();
                $('#timetable-loader').show();
                $.ajax({
                    type: "GET",
                    url: 'https://sungil-school-api.vercel.app/timetable?date=' + selectedDate + '&grade=' + grade + '&classNum=' + classNum,
                    success: function (result_time) {
                        var data = JSON.parse(result_time);

                        localStorage.setItem("sungil_timeapi_cache", JSON.stringify(data));
                        localStorage.setItem("sungil_timeapi_cache_date", selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6).replace(/(^0+)/, "") + '--' + getWeekNo(moment(selectedDate).format('YYYY-MM-DD')));

                        displayTimetable(data);
                    }
                });
            }
        }

        //시간표 끝
    }
}

var realTimeMealRef;

function displayMeal(data) {
    try {
        data = JSON.parse(data);
    } catch (error) {
        console.log(error)
    }
    //급식
    var day = selectedDate.substring(6, 8).replace(/(^0+)/, "");
    if (data.meal[day]) {
        $('#exist-meal').fadeIn();
        db.collection("meal").doc(selectedDate).onSnapshot(function (doc) {
            $('.reaction-wrap').fadeIn();
            if (doc.exists) {
                $('#meal-like-count').html(doc.data().like);
                $('#meal-dislike-count').html(doc.data().dislike);
            } else {
                $('#meal-like-count').html('0');
                $('#meal-dislike-count').html('0');
                var mealRef = db.collection("meal").doc(selectedDate);
                mealRef.set({
                    like: 0,
                    dislike: 0,
                    lastupdated: firebase.firestore.FieldValue.serverTimestamp(),
                })
            }
        });

        currentMenuRaw = data.meal[day].toString().replace(':', '');
        var menuArr = currentMenuRaw.replaceAll('\n', '<br/>').replaceAll('\'', '').replaceAll('[중식]', '').replaceAll('``', '').replaceAll(' (', '').replaceAll("**", "").replaceAll("(ㅆ)", "").split('<br/>');
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
                    menuInfoTag += '<a class="mealItem dangerMeal" href="javascript:openMenuBanner(\'' + menuName + '\', \'' + alle + '\')">' + menuName + '</a>';
                } else {
                    var isFavorite = false;
                    $.each(favTagsList, function (index, element) {
                        if ((menuName).includes(element)) {
                            isFavorite = true;
                            return true;
                        }
                    });

                    if (isFavorite) {
                        menuInfoTag += '<a class="mealItem favMenu" href="javascript:openMenuBanner(\'' + menuName + '\', \'' + alle + '\')">' + menuName + '✨</a>, ';
                    } else {
                        menuInfoTag += '<a class="mealItem" href="javascript:openMenuBanner(\'' + menuName + '\', \'' + alle + '\')">' + menuName + '</a>, ';
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
                    menuInfoTag += '<a class="mealItem favMenu" href="javascript:openMenuBanner(\'' + menuName + '\', \'' + alle + '\')">' + menuName + '✨</a>, ';
                } else {
                    menuInfoTag += '<a class="mealItem" href="javascript:openMenuBanner(\'' + menuName + '\', \'' + alle + '\')">' + menuName + '</a>, ';
                }
            }
        }


        $('#meal-menus').html(menuInfoTag.slice(0, -2));
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
        $('#exist-meal').hide();
        $('#kcal').html('');
        $('#meal-menus').html('');
    }
}

function showAllMeal() {
    $('#meallist-result').html('');
    var data = JSON.parse(localStorage.getItem("sungil_meal_cache"));
    data = JSON.parse(data);

    if (data.meal) {
        for (var i = 1; i < Object.keys(data.meal).length; i++) {
            console.log(i, data.meal[i])
            if (data.meal[i]) {
                $('#meallist-result').append(`<div class="meal-list-item">
                <h2>${Object.keys(data.meal)[i]-1}일</h2>
                ${(data.meal[i]).replaceAll('[중식]\n', '').replaceAll('\n', '<br>')}</div>`);
            }
        }
        openModal('이번 달 급식', 'mealList');
    }
}


function displaySchedule(data) {
    $('#schedule-content').html('');
    var schedules = data.schedule;
    console.log(schedules)
    var isAllEmpty = true;
    $.each(schedules, function (key, value) {
        if (value != '') {
            isAllEmpty = false;
            return false;
        }
    });
    if (isAllEmpty) {
        $('#schedule-content').html(`
        <div class="vacation-wrap" style="text-align: center;opacity:0.7;">
                        <span style="font-size:70px;">🥱</span>
                        <br>
                        이번 달에는 일정이 없어요
                    </div>
                    `);
    } else {
        var length = Object.keys(schedules).length;
        $.each(schedules, function (key, value) {
            if (value) {
                $('#schedule-content').append('<div class="schedule-item"><span class="day-text">' +
                    `<span style="font-size: 20px;font-weight: 500;">${key}</span><span style="
                    font-size: 12px;
                    margin-top: -7px;
                ">${getDay(moment(moment(selectedDate).format('YYYYMM') + key.toString().padStart(2, '0')).format('d'))}</span></span>` + '<h3 class="schedule-name">' + value.replaceAll(',', "<br>") + '</h3></div>');
            }
        });
    }

}

// 숫자를 요일로
function getDay(day) {
    var dayList = ['일', '월', '화', '수', '목', '금', '토'];
    return dayList[day];
}


// Your object with replacements
function SimplifySubjectName(str) {
    var replacements = {
        "통합과학": "통과",
        "통합사회": "통사",
        "과학탐구실험": "과탐실",
        "일본어": "일",
        "생활과 윤리": "생윤",
        "생활과 과학": "생과",
        "심화 국어": "심국",
        "음악 감상과 비평": "음악",
        "운동과 건강": "운동",
        "정치와 법": "정법",
        "여행지리": "여행",
        "지구과학": "지구",
        "중국어": "중",
        "미술 감상과 비평": "미술",
        "생명과학": "생",
        "언어와 매체": "언매",
        "경제 수학": "경수",
        "확률과 통계": "확통",
        "영어권 문화": "영문",
        "사회문제 탐구": "사문탐",
        "윤리와 사상": "윤사",
        "동아시아사": "동아",
        "한국지리": "한지",
        "세계지리": "세지",
        "심화 수학": "심수",
        "과학과제 연구": "과과연",
        "정보과학": "정보",
        "스포츠 생활": "스포츠",
        "융합과학": "융과",
        "물리학": "물",
        "화학": "화",
        "수학과제 탐구": "수탐",
        "진로활동": "진로",
        "화법과 작문": "화작",
        "영어 독해와 작문": "영독",
        "인공지능 수학": "인수",
        "미적분": "미적",
        "자율활동": "자율",
        "동아리활동": "동아리"
    };

    var re = new RegExp(Object.keys(replacements).join("|"), "gi");
    return str.replace(re, function (matched) {
        return replacements[matched.toLowerCase()];
    });
}

function getCurrentPeriod() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const intervals = [
        { start: 0, end: 580, period: 1 }, // 8:30 - 9:40
        { start: 580, end: 640, period: 2 }, // 9:40 - 10:40
        { start: 640, end: 700, period: 3 }, // 10:40 - 11:40
        { start: 700, end: 810, period: 4 }, // 11:40 - 13:30
        { start: 810, end: 870, period: 5 }, // 13:30 - 14:30
        { start: 870, end: 930, period: 6 }, // 14:30 - 15:30
        { start: 930, end: 990, period: 7 }  // 15:30 - 16:30
    ];

    for (let i = 0; i < intervals.length; i++) {
        if (intervals[i].start <= currentTime && currentTime <= intervals[i].end) {
            return intervals[i].period;
        }
    }

    return 'null';
}


function displayTimetable(data) {
    $('#timetable-loader').hide();
    var day = moment(selectedDate).day();
    var sections = document.querySelectorAll("tbody th");
    for (var i = 0; i < sections.length; i++) {
        if (sections[i].parentNode.parentNode.parentNode.parentNode.classList.contains('timetable-wrap')) {
            var item = sections.item(i);
            $(item).removeClass('active');
            $(item).html('');
        }
    }

    $('#timetable-horizontal-wrap').show();
    switch (day) {
        case 1:
            for (var i = 0; i < data.mon.length; i++) {
                $('#timetable_horz_name' + ((i + 1).toString())).html(SimplifySubjectName(data.mon[i].ITRT_CNTNT));
            }
            $('#m1').addClass('active');
            $('#m2').addClass('active');
            $('#m3').addClass('active');
            $('#m4').addClass('active');
            $('#m5').addClass('active');
            $('#m6').addClass('active');
            $('#m7').addClass('active');
            break;
        case 2:
            for (var i = 0; i < data.tue.length; i++) {
                $('#timetable_horz_name' + ((i + 1).toString())).html(SimplifySubjectName(data.tue[i].ITRT_CNTNT));
            }
            $('#tu1').addClass('active');
            $('#tu2').addClass('active');
            $('#tu3').addClass('active');
            $('#tu4').addClass('active');
            $('#tu5').addClass('active');
            $('#tu6').addClass('active');
            $('#tu7').addClass('active');
            break;
        case 3:
            for (var i = 0; i < data.wed.length; i++) {
                $('#timetable_horz_name' + ((i + 1).toString())).html(SimplifySubjectName(data.wed[i].ITRT_CNTNT));
            }
            $('#w1').addClass('active');
            $('#w2').addClass('active');
            $('#w3').addClass('active');
            $('#w4').addClass('active');
            $('#w5').addClass('active');
            $('#w6').addClass('active');
            $('#w7').addClass('active');
            break;
        case 4:
            for (var i = 0; i < data.thu.length; i++) {
                $('#timetable_horz_name' + ((i + 1).toString())).html(SimplifySubjectName(data.thu[i].ITRT_CNTNT));
            }
            $('#th1').addClass('active');
            $('#th2').addClass('active');
            $('#th3').addClass('active');
            $('#th4').addClass('active');
            $('#th5').addClass('active');
            $('#th6').addClass('active');
            $('#th7').addClass('active');
            break;
        case 5:
            for (var i = 0; i < data.fri.length; i++) {
                $('#timetable_horz_name' + ((i + 1).toString())).html(SimplifySubjectName(data.fri[i].ITRT_CNTNT));
            }
            $('#f1').addClass('active');
            $('#f2').addClass('active');
            $('#f3').addClass('active');
            $('#f4').addClass('active');
            $('#f5').addClass('active');
            $('#f6').addClass('active');
            $('#f7').addClass('active');
            break;
        default:
            $('#timetable-horizontal-wrap').hide();
            break;

    }
    timetableRaw = data;

    // 시간표 모든 요일 없음
    if (Object.keys(data.mon).length == 0 && Object.keys(data.tue).length == 0 && Object.keys(data.wed).length == 0 && Object.keys(data.thu).length == 0 && Object.keys(data.fri).length == 0) {
        $('.timetable-wrap table').hide();
        $('.timetable-horizontal-wrap').hide();
        return false;
    } else {
        $('.timetable-wrap table').show();
        $('.timetable-horizontal-wrap').show();
    }


    if (data.mon) {
        for (var i = 0; i < data.mon.length; i++) {
            $('#m' + ((i + 1).toString())).html(data.mon[i].ITRT_CNTNT);
        }
    }
    if (data.tue) {
        for (var i = 0; i < data.tue.length; i++) {
            $('#tu' + ((i + 1).toString())).html(data.tue[i].ITRT_CNTNT);
        }
    }
    if (data.wed) {
        for (var i = 0; i < data.wed.length; i++) {
            $('#w' + ((i + 1).toString())).html(data.wed[i].ITRT_CNTNT);
        }
    }
    if (data.thu) {
        for (var i = 0; i < data.thu.length; i++) {
            $('#th' + ((i + 1).toString())).html(data.thu[i].ITRT_CNTNT);
        }
    }
    if (data.fri) {
        for (var i = 0; i < data.fri.length; i++) {
            $('#f' + ((i + 1).toString())).html(data.fri[i].ITRT_CNTNT);
        }
    }
}


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
                mobileWebUrl: 'https://sungil.me/',
                webUrl: 'https://sungil.me/',
            },
        })
    } else {
        toast('공유할 급식이 없어요');
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


//modal
$('.sheet-backdrop').on('click', function () {
    closeModal();
});

$('.c-modal').each(function () {

    var mc = new Hammer(this);

    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });

    mc.on("swipedown", function (ev) {
        if (!$('#loginForm').is(':visible') && !$('#writePost').is(':visible') && !$('#onboarding').is(':visible')) {
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
            if (!$('#loginForm').is(':visible') && !$('#assessment').is(':visible') && !$('#myClassAssign').is(':visible') && !$('#account').is(':visible') && !$('#writePost').is(':visible') && !$('#onboarding').is(':visible')) {
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



$('#home').show();
$('#community').hide();
$('#assignment').hide();
$('#tools').hide();


$('.bottom-nav a').on('click', function () {
    if ($(this).parent().attr('class') == 'header-btn-wrap') return;
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
            $('#home').fadeIn();
            $('#community').hide();
            $('#assignment').hide();
            $('#tools').hide();
            if (!isBigScreen()) $('.bottom-nav').css('border-radius', '20px 20px 0 0');
            $('.bottom-nav').addClass("non-border");
            $('#tab1').attr('name', 'planet');
            $('#tab2').attr('name', 'chatbubbles-outline');
            $('#tab3').attr('name', 'file-tray-full-outline');
            $('#tab4').attr('name', 'settings-outline');
            break;
        case 'community':
            enablePullToRefresh();
            $('#home').hide();
            $('#community').fadeIn(100);
            $('#assignment').hide();
            $('#tools').hide();
            if (!isBigScreen()) $('.bottom-nav').css('border-radius', '20px 20px 0 0');
            $('#tab1').attr('name', 'planet-outline');
            $('#tab2').attr('name', 'chatbubbles');
            $('#tab3').attr('name', 'file-tray-full-outline');
            $('#tab4').attr('name', 'settings-outline');
            $('#community-frame').height($(window).height() - $('.bottom-nav').height() - 20);
            break;
        case 'assignment':
            $('#home').hide();
            $('#community').hide();
            $('#assignment').fadeIn(100);
            $('#tools').hide();
            if (!isBigScreen()) $('.bottom-nav').css('border-radius', '20px 20px 0 0');
            $('#tab1').attr('name', 'planet-outline');
            $('#tab2').attr('name', 'chatbubbles-outline');
            $('#tab3').attr('name', 'file-tray-full');
            $('#tab4').attr('name', 'settings-outline');
            break;
        case 'report':
            $('#home').hide();
            $('#community').hide();
            $('#assignment').hide();
            $('#tools').fadeIn(100);
            if (!isBigScreen()) $('.bottom-nav').css('border-radius', '20px 20px 0 0');
            $('#tab1').attr('name', 'planet-outline');
            $('#tab2').attr('name', 'chatbubbles-outline');
            $('#tab3').attr('name', 'file-tray-full-outline');
            $('#tab4').attr('name', 'settings');
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
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: false, // Prevents dismissing of toast on hover
            style: {
                borderRadius: "30px",
            },
        }).showToast();
    } else {
        Toastify({
            text: msg,
            duration: 2200,
            newWindow: true,
            close: false,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: false, // Prevents dismissing of toast on hover
            style: {
                borderRadius: "30px",
            },
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
    Kakao.init('c2c4f841a560ad18bfed29d190dfac19');
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
                mobileWebUrl: 'https://hello.sungil.me/',
                webUrl: 'https://hello.sungil.me/',
            },
        },
        buttons: [{
            title: '지금 바로 써보기',
            link: {
                mobileWebUrl: 'https://hello.sungil.me/',
                webUrl: 'https://hello.sungil.me/',
            },
        },],
    })
}


function openModal(title, id) {
    if (refresher) disablePullToRefresh();
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

function openUnclosableModal(title, id) {
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
    $('.sheet-backdrop-nocancel').addClass('backdrop-in');
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

function mealLikeBtn() {
    var reactionHistory = localStorage.getItem("ssoak_meal_reaction_history") || [];
    reactionHistory = reactionHistory.toString().split(',');

    if (reactionHistory.indexOf(selectedDate) > -1) {
        toast('이미 반응을 표시한 날짜의 급식이에요');
    } else {
        var mealRef = db.collection("meal").doc(selectedDate);
        mealRef.get().then(function (doc) {
            if (doc.exists) {
                mealRef.update({
                    like: doc.data().like + 1,
                    lastupdated: firebase.firestore.FieldValue.serverTimestamp(),
                });
                reactionHistory.push(selectedDate)
                localStorage.setItem("ssoak_meal_reaction_history", reactionHistory);
            } else {
                mealRef.set({
                    like: 1,
                    dislike: 0,
                    lastupdated: firebase.firestore.FieldValue.serverTimestamp(),
                })
            }
        });
    }

}

function mealdislikeBtn() {
    var reactionHistory = localStorage.getItem("ssoak_meal_reaction_history") || [];
    reactionHistory = reactionHistory.toString().split(',');
    if (reactionHistory.indexOf(selectedDate) > -1) {
        toast('이미 반응을 표시한 날짜의 급식이에요');
    } else {
        var mealRef = db.collection("meal").doc(selectedDate);
        mealRef.get().then(function (doc) {
            if (doc.exists) {
                mealRef.update({
                    dislike: doc.data().dislike + 1,
                    lastupdated: firebase.firestore.FieldValue.serverTimestamp(),
                });
                reactionHistory.push(selectedDate)
                localStorage.setItem("ssoak_meal_reaction_history", reactionHistory);
            } else {
                mealRef.set({
                    like: 0,
                    dislike: 1,
                    lastupdated: firebase.firestore.FieldValue.serverTimestamp(),
                })
            }
        });
    }
}


var onBoardingProcess = 0;
function startOnBoarding() {
    openUnclosableModal(`반가워요&nbsp;<picture>
    <source srcset="assets/icons/webp/hello.webp" type="image/webp" width="25px" />
    <img src="assets/icons/hello.gif" width="25px">
</picture>`, 'onboarding');
}


function onBoardingNext() {
    switch (onBoardingProcess) {
        case 0:
            $('#modal-title').text('학년/반을 알려주세요');
            $('#onBoardingNextBtn').text('완료')
            $('#onboarding #page1').hide();
            $('#onboarding #page2').show();
            break;
        case 1:
            grade = $("#grade-select-onboarding").val();
            classNum = $("#class-select-onboarding").val();
            localStorage.setItem("sungil_grade", grade);
            localStorage.setItem("sungil_classNum", classNum);
            if (grade !== null && classNum !== null) {
                $('#profile-text').html('성일고&nbsp;<span style="color:#5272ff">' + grade + '</span>학년&nbsp; <span style="color:#5272ff">' + classNum + '</span>반');
            } else {
                $('#profile-text').html('학년과 반을 알려주세요.');
            }
            $('#assignments-listview').show();
            $('#before-setting-assign').hide();
            $('.addAssignment-btn').show();
            updateAssignList();
            closeModal();
            $('#gradeClassLabel').html(grade + '학년 ' + classNum + '반');
            updateInfo();
            setTimeout(function () {
                openModal('로그인', 'login');
            }, 500);

            break;
    }
    onBoardingProcess++;
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#onboarding').height() + 130 + 'px');
    }, 100);
}
