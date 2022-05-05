var today = moment(new Date()).format('YYYYMMDD');
var selectedDate = today;
$('#date').html(moment(selectedDate).format('M월 D일'));
$('#date').addClass('today');

var grade = localStorage.getItem("sungil_grade");
var classNum = localStorage.getItem("sungil_classNum");
var currentMenuRaw = '';
var isTest = false;

if(grade && classNum) {
   $('#gradeClassLabel').html(grade+'학년 '+classNum+'반');
}


  $("#datepicker").datepicker({
	onSelect: function (dataTExt) {
        selectedDate = moment(dataTExt).format('YYYYMMDD');
        $('#date').html(moment(selectedDate).format('M월 D일'));
        if ($("#datepickerholder").is(':visible') == false) {
            $("#datepickerholder").show();
        } else {
            $("#datepickerholder").hide();
        }
        updateInfo();
    }
});


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


$(document).ready(function(){
	updateInfo();

    //가정통신문
    $.ajax({
        type: "GET",
        url:  "https://sungil-school-api.vercel.app/notices",
        success: function(result) {
            var articles = JSON.parse(result);
            for(var i=0; i<5; i++) {
                var title = articles.items[i].title;
                var createdAt = moment(new Date(articles.items[i].published)).format('YYYY-MM-DD');
                var link = 'https://sungil-h.goesn.kr/'+articles.items[i].link;
                $('#notices-content').append(`<div class="card notice-card" onclick="window.open('`+link+`', '_blank')">
            <h4>`+title+`</h4>
            <p>`+createdAt+`</p>
        </div>`);
            }

            if(storedTheme=='true' || (storedTheme=='system'&&mql.matches)) {
                var notice_items = document.getElementsByClassName('notice-card');
            
                for(var i=0; i< notice_items.length; i++){
                   notice_items[i].classList.add("dark");
                }
            }
            
        }
     });
});


function backDate() {
let yesterday = moment(selectedDate).add(-1, 'days');
selectedDate = moment(yesterday).format('YYYYMMDD');
$('#date').html(moment(selectedDate).format('M월 D일'));
if(today==selectedDate) {
  $('#date').addClass('today');

} else {
    $('#date').removeClass('today');
}
updateInfo();
}

function forwardDate() {
    let tomorrow  = moment(selectedDate).add(1,'days');
    selectedDate = moment(tomorrow).format('YYYYMMDD');
    $('#date').html(moment(selectedDate).format('M월 D일'));
    if(today==selectedDate) {
        $('#date').addClass('today');
      
      } else {
          $('#date').removeClass('today');
      }
      updateInfo();
    }

    String.prototype.insertAt = function(index,str){
        return this.slice(0,index) + str + this.slice(index)
      }

      var data;
function updateInfo() {
    var cachedData = JSON.parse(localStorage.getItem("sungil_api_cache")) || null;
    var cachedData_date = localStorage.getItem("sungil_api_cache_date") || null;
    var requestDate = selectedDate.substring(0, 4)+'-'+selectedDate.substring(4, 6).replace(/(^0+)/, "");

    if(!isTest) {
        var text = ["시간표 물어보는 중", "달력 체크중", "급식실 훔쳐보는 중"];
        var counter = 0;
        var elem = $("#loading-text");
        setInterval(change, 1000);
        function change() {
            elem.fadeOut(function(){
                elem.html(text[counter]);
                counter++;
                if(counter >= text.length) { counter = 0; }
                elem.fadeIn();
            });
        }

        document.getElementsByClassName('loading-overlay')[0].classList.add('is-active');
        $('#schedule-content').html('');

        if(cachedData && cachedData_date == requestDate) {
            displayMeal(cachedData);
            displaySchedule(cachedData);
            document.getElementsByClassName('loading-overlay')[0].classList.remove('is-active');
        } else {
          $.ajax({
            type: "GET",
            url:  "https://sungil-school-api.vercel.app/api/"+selectedDate,
            success: function(result) {
                data = JSON.parse(result);
                localStorage.setItem("sungil_api_cache", JSON.stringify(data));
                localStorage.setItem("sungil_api_cache_date", selectedDate.substring(0, 4)+'-'+selectedDate.substring(4, 6).replace(/(^0+)/, ""));

                  //급식
                  displayMeal(data);
                  document.getElementsByClassName('loading-overlay')[0].classList.remove('is-active');

                  //학사일정
                  if(data.schedule) {
                    displaySchedule(data);
                      //$('#schedule-content').html(data.schedule.EVENT_NM);
                  }
          }
         });
        }   
    }

    //시간표
    if(!grade || !classNum) {
        $('#timetable').html('학년/반 설정을 먼저 진행해주세요.');
        $('.timetable-wrap').hide();
        $('#nosetting-timetable').show();

      } else {
        $('.timetable-wrap').show();
        $('#nosetting-timetable').hide();

        var cachedTimeData = JSON.parse(localStorage.getItem("sungil_timeapi_cache")) || null;
        var cachedTimeData_date = localStorage.getItem("sungil_timeapi_cache_date") || null;
        var requestTimeDate =selectedDate.substring(0, 4)+'-'+selectedDate.substring(4, 6).replace(/(^0+)/, "")+'--'+getWeekNo(moment(selectedDate).format('YYYY-MM-DD'));

        if(cachedTimeData && cachedTimeData_date == requestTimeDate) {
            displayTimetable(cachedTimeData);
        } else {
            if(!$('.loading-overlay').hasClass('is-active')) {
                document.getElementsByClassName('loading-overlay')[0].classList.add('is-active');
            }

            $.ajax({
                type: "GET",
                url:  'https://sungil-school-api.vercel.app/timetable?date='+selectedDate+'&grade='+grade+'&classNum='+classNum, 
                success: function(result_time) {
                    var data = JSON.parse(result_time);
    
                    localStorage.setItem("sungil_timeapi_cache", JSON.stringify(data));
                    localStorage.setItem("sungil_timeapi_cache_date", selectedDate.substring(0, 4)+'-'+selectedDate.substring(4, 6).replace(/(^0+)/, "")+'--'+getWeekNo(moment(selectedDate).format('YYYY-MM-DD')));
    
                    displayTimetable(data);
                    if($('.loading-overlay').hasClass('is-active')) {
                        document.getElementsByClassName('loading-overlay')[0].classList.remove('is-active');
                    }
                }
            });
        }
      }
      //시간표 끝
}


function displayMeal(data) {
    //급식
    var day = selectedDate.substring(6, 8).replace(/(^0+)/, "");
    
    if(data.meal[day]) {
        $('#no-meal').hide();
        $('#exist-meal').fadeIn();
        currentMenuRaw = data.meal[day].toString();
        var menuArr = currentMenuRaw.replaceAll('\'', '').replaceAll('[중식]', '').split('\n');
        var menuInfoTag = '';

        for(var i=0; i<menuArr.length; i++) {
            if(menuArr[i].match(/\d+/)) {
                var allegyIndex = menuArr[i].match(/\d+/).index;
                var alle = menuArr[i].substring(allegyIndex, menuArr[i].length);
            } else {
                var alle = 'none';
            }
            var menuName = menuArr[i].substring(0, allegyIndex);
                menuInfoTag += '<a href="javascript:openMenuBanner(\''+menuName+'\', \''+alle+'\')">'+menuName+'</a><br>';
        }
        $('#meal-menus').html(menuInfoTag);

    } else {
        $('#no-meal').fadeIn();
        $('#exist-meal').hide();
        $('#kcal').html('');
        $('#meal-menus').html('');
    }
}

function displaySchedule(data) {
    var schedules = data.schedule;
    var length = Object.keys(schedules).length-2; //year, month 제외 해당 월 일 수 산출
    for(var i=1; i<=length; i++) {
        if(schedules[i] != '') {
            $('#schedule-content').append('<div class="schedule-item"><span class="day-text">'+i+'</span><h3 class="schedule-name">'+schedules[i]+'</h3></div>');
        }
    }

}

function displayTimetable(data) {
    var day = moment(selectedDate).day();
    switch(day) {
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

    for(var i=0; i<data.mon.length; i++) {
        $('#m'+((i+1).toString())).html(data.mon[i].ITRT_CNTNT);
    }
    for(var i=0; i<data.tue.length; i++) {
        $('#tu'+((i+1).toString())).html(data.tue[i].ITRT_CNTNT);
    }
    for(var i=0; i<data.wed.length; i++) {
        $('#w'+((i+1).toString())).html(data.wed[i].ITRT_CNTNT);
    }
    for(var i=0; i<data.thu.length; i++) {
        $('#th'+((i+1).toString())).html(data.thu[i].ITRT_CNTNT);
    }
    for(var i=0; i<data.fri.length; i++) {
        $('#f'+((i+1).toString())).html(data.fri[i].ITRT_CNTNT);
    }
}

function shareMeal() {
    if($('#meal-menus').html() != '') { //메뉴 있을때
        var content = '<'+moment(selectedDate).format('M월 D일')+' 성일고 급식>\n'+$('#meal-menus').html().toString().replaceAll('<br>', '\n');
        let t = document.createElement('textarea')
        document.body.appendChild(t)
        t.value = content
        t.select()
        document.execCommand('copy')
        document.body.removeChild(t)

        $('#copied').text('복사됨');

        setTimeout(function() {
            $('#copied').text('');
            $('#shareBtn').blur();
          }, 3000);

    } else { //급식 없을 때
        $('#copied').text('공유할 급식 정보가 없어요');

        setTimeout(function() {
            $('#copied').text('');
            $('#shareBtn').blur();
          }, 3000);
    }
}


const isMobile = () => { return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) }


// Detects if device is on iOS 
const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test( userAgent );
  }
  
  // Detects if device is in standalone mode
  const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);
  
  // Checks if should display install popup notification:
  if (isIos() && !isInStandaloneMode()) {
    // offer app installation here
    //
    $('.pwaBanner').show();
    if(!isMobile()) {
        $('#desktop').show();
    } else {
        if(isIos()) {
            $('#ios').show();
        } else {
            $('#android').show();
        }
    }
    //
  }



//pwa 설치 안내 팝업
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    //
    $('.pwaBanner').show();
    if(!isMobile()) {
        $('#desktop').show();
    } else {
        if(isIos()) {
            $('#ios').show();
        } else {
            $('#android').show();
        }
    }
  });

  function getWeekNo(v_date_str) {
    var date = new Date();
    if(v_date_str){
     date = new Date(v_date_str);
    }
    return Math.ceil(date.getDate() / 7);
   }

  //kakao image search api
  function search(query) {
    $.ajax({
        type: "GET",
        url:  'https://dapi.kakao.com/v2/search/image?query='+query, 
        headers: {
            'Authorization': 'KakaoAK a1cb5ad868a6adb4d8d59d2454d4b2bc'
        },
        success: function(result) {
            var data = result;
            i=0;
            var image_result='<img class="menu-image" src="'+data.documents[i].thumbnail_url+'" class="img-thumbnail" onclick="selectImage(\''+data.documents[i].image_url+'\')">';

            $('#image_result').html(image_result);
        }
    });
}



function openMenuBanner(name, allegy) {
    if(allegy == 'none') {
        $('#allergy-info').html('알레르기 정보 없음');
    } else {
        var allegyString = allegy.replace('10', '돼지고기').replace('11', '복숭아').replace('12', '토마토').replace('13', '아황산염').replace('14', '호두').replace('15', '닭고기').replace('16', '쇠고기').replace('17', '오징어').replace('18', '조개류(굴, 전복, 홍합 포함)').replace('19', '잣').replace('1', '난류').replace('2', '우유').replace('3', '메밀').replace('4', '땅콩').replace('5', '대두').replace('6', '밀').replace('7', '고등어').replace('8', '게').replace('9', '새우').replaceAll('.', ', ');
        $('#allergy-info').html(allegyString.substring(0, allegyString.length-2));
    }
    
    search(name);
    $('#menu-name').html(name);
    $('.menuBanner').show("slide", { direction: "down" }, 100);;

}

//메뉴 상세정보 팝업 이외 클릭 시 닫기
document.addEventListener('click',function(e){
    if($('.menuBanner').is(':visible')) { 
        if(!$(e.target).hasClass("menuBanner")) {
            $('.menuBanner').hide("slide", { direction: "down" }, 100);;
        }

    }
});

//pwa 팝업 이외 클릭 시 닫기
document.addEventListener('click',function(e){
    if($('.pwaBanner').is(':visible')) { 
        if(!$(e.target).hasClass("pwaBanner")) {
            $('.pwaBanner').hide("slide", { direction: "down" }, 100);;
        }

    }
});

/* bottom sheet */
$('.idcard-btn').on('click', function() {
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function() {
        $('.modal-in').css('bottom', '55px');
    }, 100);
  $('.sheet-backdrop').addClass('backdrop-in');
});

$('.sheet-backdrop').on('click', function() {
    $('body').css('overflow', 'auto');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function() {
        $('.modal-in').css('display', 'none');
    }, 100);
    $('.sheet-backdrop').removeClass('backdrop-in');
  });

///custom modal sheet///
$('.c-modal').each(function() {
  var mc = new Hammer(this);

  mc.get('swipe').set({
    direction: Hammer.DIRECTION_ALL
  });

  mc.on("swipedown", function(ev) {
    $('body').css('overflow', 'auto');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function() {
        $('.modal-in').css('display', 'none');
    }, 100);
    
    $('.sheet-backdrop').removeClass('backdrop-in');
  });
});
