var today = moment(new Date()).format('YYYYMMDD');
var selectedDate = today;
$('#date').html(moment(selectedDate).format('M월 D일'));
$('#date').addClass('today');

var grade = localStorage.getItem("sungil_grade");
var classNum = localStorage.getItem("sungil_classNum");
var currentMenuRaw = '';

if(grade && classNum) {
   $('#gradeClassLabel').html(grade+'학년 '+classNum+'반');
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

    String.prototype.insertAt = function(index,str){
        return this.slice(0,index) + str + this.slice(index)
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
                currentMenuRaw = data.meal.DDISH_NM.toString();
                var menuArr = currentMenuRaw.replaceAll('`', '').split('<br/>');
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

            //학사일정
            if(data.schedule) {
                $('#schedule-content').html(data.schedule.EVENT_NM);
            } else {
                $('#schedule-content').html('특별한 일정이 없어요');
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
                            document.getElementsByClassName('loading-overlay')[0].classList.toggle('is-active');

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
  });



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
        console.log(allegyString, allegyString.length-2)
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