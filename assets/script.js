var today = moment(new Date()).format('YYYYMMDD');
var selectedDate = today;
$('#date').html(moment(selectedDate).format('M월 D일'));
$('#date').addClass('today');

var grade = localStorage.getItem("sungil_grade");
var classNum = localStorage.getItem("sungil_classNum");
/*
if(!grade || !classNum) {
   location.href="init.html"
}
*/

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
  
  $(function () {
    $('.datepicker').datepicker();
  });


  $( "#datepicker" ).datepicker({
	onSelect: function (dataTExt, inst) {
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


updateInfo();

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

function updateInfo() {
    document.getElementsByClassName('loading-overlay')[0].classList.toggle('is-active');
    $.ajax({
        type: "GET",
        url:  "https://sungil-school-api.vercel.app/api/"+selectedDate,
        success: function(result) {
            var data = JSON.parse(result);
            console.log(data.meal, data.schedule);

            //급식
            if(data.meal) {
                $('#no-meal').hide();
                $('#exist-meal').fadeIn();
                $('#kcal').html(data.meal.CAL_INFO);
                var menu = data.meal.DDISH_NM.toString().replaceAll('`', '').replaceAll(/[0-9]/g, "").replaceAll('.', '');
                $('#meal-menus').html(menu);
            } else {
                $('#no-meal').fadeIn();
                $('#exist-meal').hide();
                $('#kcal').html('');
                $('#meal-menus').html('');
            }

            //학사일정
            if(data.schedule) {
                $('#schedule-content').html(data.schedule.EVENT_NM);
            } else {
                $('#schedule-content').html('학사 일정이 없어요');
            }
        
            if(!grade || !classNum) {
                $('#timetable').html('학년/반 설정을 먼저 진행해주세요.');
                document.getElementsByClassName('loading-overlay')[0].classList.toggle('is-active');

            } else {
                //시간표
                $.ajax({
                    type: "GET",
                    url:  'https://sungil-school-api.vercel.app/timetable?date='+selectedDate+'&grade='+grade+'&classNum='+classNum, 
                    success: function(result2) {
                        console.log(result2)
            
                        if(JSON.stringify(result2).indexOf('해당하는 데이터가 없습니다.') > -1) {
                            $('#timetable').html('수업이 없어요😃');
                        } else {
                            var length = result2.hisTimetable[0].head[0].list_total_count;
                            var timetable_result = '';
                            for(var i=0; i<length; i++) {
                                timetable_result+=(i+1)+'교시 : '+result2.hisTimetable[1].row[i].ITRT_CNTNT+'<br>';
                            }
                            $('#timetable').html(timetable_result);
                            document.getElementsByClassName('loading-overlay')[0].classList.toggle('is-active');

                        }
                    }
            });
            }

        }
});
    

        
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
    //
  });
