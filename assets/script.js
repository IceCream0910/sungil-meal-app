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

            }
        
            document.getElementsByClassName('loading-overlay')[0].classList.toggle('is-active');
        }
});

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