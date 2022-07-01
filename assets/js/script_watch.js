// Implemetion reference: https://juejin.im/post/5aeef41cf265da0ba0630de0
// Background image from free image website: https://pixabay.com/

const helper = {
    getDelta(event) {
        if (event.wheelDelta) {
            return event.wheelDelta;
        } else {
            return -event.detail;
        }
    },
    throttle(method, delay, context) {
        let inThrottle = false;
        return function () {
            if (!inThrottle) {
                inThrottle = true;
                method.apply(context, arguments);
                setTimeout(() => {
                    inThrottle = false;
                }, delay);
            }
        }
    },
    debounce(method, delay, context) {
        let inDebounce;
        return function () {
            clearTimeout(method.inDebounce);
            inDebounce = setTimeout(() => {
                method.apply(context, arguments);
            }, delay);
        }
    }
}
class ScrollPages {
    constructor(currentPageNumber, totalPageNumber, pages) {
        this.currentPageNumber = currentPageNumber;
        this.totalPageNumber = totalPageNumber;
        this.pages = pages;
        this.viewHeight = document.documentElement.clientHeight;
    }
    mouseScroll(event) {
        let delta = helper.getDelta(event);
        if (delta < 0) {
            this.scrollDown();
        } else {
            this.scrollUp();
        }
    }
    scrollDown() {
        if (this.currentPageNumber !== this.totalPageNumber) {
            this.pages.style.top = (-this.viewHeight * this.currentPageNumber) + 'px';
            this.currentPageNumber++;
            this.updateNav();
            this.textFadeInOut();
        }
    }
    scrollUp() {
        if (this.currentPageNumber !== 1) {
            this.pages.style.top = (-this.viewHeight * (this.currentPageNumber - 2)) + 'px';
            this.currentPageNumber--;
            this.updateNav();
            this.textFadeInOut();
        }
    }
    scrollTo(targetPageNumber) {
        while (this.currentPageNumber !== targetPageNumber) {
            if (this.currentPageNumber > targetPageNumber) {
                this.scrollUp();
            } else {
                this.scrollDown();
            }
        }
    }
    createNav() {
        const pageNav = document.createElement('div');
        pageNav.className = 'nav-dot-container';
        this.pages.appendChild(pageNav);
        for (let i = 0; i < this.totalPageNumber; i++) {
            pageNav.innerHTML += '<p class="nav-dot"><span></span></p>';
        }
        const navDots = document.getElementsByClassName('nav-dot');
        this.navDots = Array.prototype.slice.call(navDots);
        this.navDots[0].classList.add('dot-active');
        this.navDots.forEach((e, index) => {
            e.addEventListener('click', event => {
                this.scrollTo(index + 1);
                this.navDots.forEach(e => {
                    e.classList.remove('dot-active');
                });
                e.classList.add('dot-active');
            });
        });
    }
    updateNav() {
        this.navDots.forEach(e => {
            e.classList.remove('dot-active');
        });
        this.navDots[this.currentPageNumber - 1].classList.add('dot-active');
    }
    resize() {
        this.viewHeight = document.documentElement.clientHeight;
        this.pages.style.height = this.viewHeight + 'px';
        this.pages.style.top = -this.viewHeight * (this.currentPageNumber - 1) + 'px';
    }
    textFadeInOut() {
        const containersDom = document.getElementsByClassName('text-container');
        let textContainers = Array.prototype.slice.call(containersDom);
        textContainers.forEach((e) => {
            e.classList.remove('in-sight');
        });
        let textContainerInSight = textContainers[this.currentPageNumber - 1];
        textContainerInSight.classList.add('in-sight')
    }
    init() {
        let handleMouseWheel = helper.throttle(this.mouseScroll, 500, this);
        let handleResize = helper.debounce(this.resize, 500, this);
        this.pages.style.height = this.viewHeight + 'px';
        this.createNav();
        this.textFadeInOut();
        if (navigator.userAgent.toLowerCase().indexOf('firefox') === -1) {
            document.addEventListener('wheel', handleMouseWheel);
        } else {
            document.addEventListener('DOMMouseScroll', handleMouseWheel);
        }
        document.addEventListener('touchstart', (event) => {
            this.startY = event.touches[0].pageY;
        });
        document.addEventListener('touchend', (event) => {
            let endY = event.changedTouches[0].pageY;
            if (this.startY - endY < -50) {
                this.scrollUp();
            }
            if (this.startY - endY > 50) {
                this.scrollDown();
            }
        });
        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
        });
        window.addEventListener('resize', handleResize);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var s = new ScrollPages(1, 3, document.getElementById('all-pages'));
    s.init();
})




/* main */
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

        var text = moment(selectedDate).lang("ko").format('M월 D일 dddd요일') + ' 급식 메뉴는 ' + menuInfoTag + '입니다.';
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
//var today = moment('20220513').format('YYYYMMDD');

var selectedDate = today;
$('#date').html(moment(selectedDate).lang("ko").format('M월 D일 (dddd)'));
$('#date').addClass('today');

var grade = localStorage.getItem("sungil_grade");
var classNum = localStorage.getItem("sungil_classNum");
var currentMenuRaw = '';
var timetableRaw = '';
var isTest = false;

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
            var articles = JSON.parse(result);
            for (var i = 0; i < 5; i++) {
                var title = articles.items[i].title;
                var createdAt = moment(new Date(articles.items[i].published)).format('YYYY-MM-DD');
                var link = 'https://sungil-h.goesn.kr/' + articles.items[i].link;
                $('#notices-content').append(`<div class="card notice-card" onclick="window.open('` + link + `', '_blank')">
            <h4>`+ title + `</h4>
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

function refreshNewData() {
    console.log(newData)
    displayTimetable(newData);
    $('.snackbar').fadeOut(250);
}


function displayMeal(data) {
    //급식
    var day = selectedDate.substring(6, 8).replace(/(^0+)/, "");

    if (data.meal[day]) {
        $('#meal-text').html('');

        currentMenuRaw = data.meal[day].toString();
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
            menuInfoTag += '<a href="javascript:openMenuBanner(\'' + menuName + '\', \'' + alle + '\')">' + menuName + '</a><br>';
        }
        $('#meal-text').html(menuInfoTag);

    } else {
        currentMenuRaw = '';
        $('#meal-text').html('오늘은 급식이 없어요.');
    }
}

function displaySchedule(data) {
    $('.mandatory').html('');
    var schedules = data.schedule;
    var length = Object.keys(schedules).length - 2; //year, month 제외 해당 월 일 수 산출
    for (var i = 1; i <= length; i++) {
        if (schedules[i] != '') {
            $('.mandatory').append('<div class="card"> <div class="schedule-item"><span class="day-text">' + i + '</span><h3 class="schedule-name">' + schedules[i] + '</h3> </div></div>');
        }
    }

}

function displayTimetable(data) {
    var day = moment(selectedDate).day();
    timetableRaw = data;
    $('#timetable-text').html('');
    switch (day) {
        case 1:
            for (var i = 0; i < data.mon.length; i++) {
                $('#timetable-text').append((i + 1) + '교시 : ' + data.mon[i].ITRT_CNTNT + '<br>');
            }
            break;
        case 2:
            for (var i = 0; i < data.tue.length; i++) {
                $('#timetable-text').append((i + 1) + '교시 : ' + data.tue[i].ITRT_CNTNT + '<br>');
            }
            break;
        case 3:
            for (var i = 0; i < data.wed.length; i++) {
                $('#timetable-text').append((i + 1) + '교시 : ' + data.wed[i].ITRT_CNTNT + '<br>');
            }
            break;
        case 4:
            for (var i = 0; i < data.thu.length; i++) {
                $('#timetable-text').append((i + 1) + '교시 : ' + data.thu[i].ITRT_CNTNT + '<br>');
            }
            break;
        case 5:
            for (var i = 0; i < data.fri.length; i++) {
                $('#timetable-text').append((i + 1) + '교시 : ' + data.fri[i].ITRT_CNTNT + '<br>');
            }
            break;
        default:
            $('#timetable-text').html('오늘은 수업이 없어요.');
            break;

    }



}




function getWeekNo(v_date_str) {
    var date = new Date()
    if (v_date_str) {
        date = new Date(v_date_str);
    }
    return Math.ceil(date.getDate() / 7);
}

function openMenuBanner(name, allegy) {
    return false;
}
