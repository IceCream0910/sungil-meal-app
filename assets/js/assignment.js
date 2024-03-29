
//수행평가
var database = firebase.database();

//반번호 설정 되어있는지 확인
if (!grade || !classNum) {
    $('#assignments-listview').hide();
    $('#before-setting-assign').show();
    $('.addAssignment-btn').hide();
} else {
    $('#assignments-listview').show();
    $('#before-setting-assign').hide();
    $('.addAssignment-btn').show();
}

var selectedDateAssign = new Date();

var selectedPeriod = null;
var selctedSubject = null;

var assignArr = [];

updateAssignList();

function addAssignment() {
    if (!$('#title').val()) {
        toast('제목을 입력해주세요');
    } else if (!$('#date_assign').val()) {
        toast('날짜를 선택해주세요');
    } else if (selectedDateAssign > new Date()) {
        toast('이미 지난 날짜는 선택할 수 없습니다.');
    } else {  //null 체크 통과
        var id = Math.random().toString(36).substr(2, 9);
        var data = {
            id: id,
            title: $('#title').val(),
            date: $('#date_assign').val(),
            period: selectedPeriod || '',
            subject: selctedSubject || '',
        };
        database.ref('assignments/' + grade + '/' + classNum + '/' + id).set(data);
        closeModal();
        updateAssignList();
    }
}


//날짜 차이 계산
function fromToday(date) {
    var today = new Date();
    var gap = date.getTime() - today.getTime();
    var ddayResult = Math.ceil(gap / (1000 * 60 * 60 * 24));
    console.log(today, date);
    if (ddayResult == 0) {
        ddayResult = "DAY";
    }
    return ddayResult;
}


var debug;
var selectedAssignId;
function openAssignDetails(id) {
    selectedAssignId = id;
    var data = JSON.parse(localStorage.getItem('assignments'));
    var targetItem = data.find(item => item.id == id);
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').html(targetItem.title + '&nbsp;&nbsp;<a onclick="javascript:assignEditMode();"><ion-icon name="create-outline"></ion-icon></a>&nbsp;<a onclick="javascript:assignDelete();"><ion-icon name="trash-outline"></ion-icon></a>');
    $('.content-wrap').hide();
    $('#assignDetails').show();
    $('#calculator').hide();
    $('#selfcheck').hide();
    $('#assignDate').html('<ion-icon name="time-outline"></ion-icon>' + moment(new Date(targetItem.date)).format('YYYY년 MM월 DD일'));
    $('#assignPeriod').text(targetItem.period + '교시 ' + targetItem.subject);
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#assignDetails').height() + 130 + 'px');
    }, 100);
}


// 수행평가 추가 모달 띄우기
$('.addAssignment-btn').on('click', function () {
    openModal('할 일 추가', 'assessment');
    var date = moment(new Date($('#assessment #date_assign').val())).format('YYYYMMDD');
    $(this).addClass('active');
    $('#assign-add-save-btn').show();
    $('#assign-edit-save-btn').hide();
});

function assignEditMode() {
    var data = JSON.parse(localStorage.getItem('assignments'));
    var targetItem = data.find(item => item.id == selectedAssignId);
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').html('할 일 편집');
    $('.content-wrap').hide();
    $('#assessment').show();
    $('#calculator').hide();
    $('#selfcheck').hide();
    $('#assign-add-save-btn').hide();
    $('#assign-edit-save-btn').show();
    $('#title').val(targetItem.title);
    $('#assessment #date_assign').val(moment(targetItem.date).format('YYYY-MM-DD'));
    $('#exam').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    var date = moment(new Date($('#assessment #date_assign').val())).format('YYYYMMDD');
    $(this).addClass('active');
    selectedDateAssign = new Date(targetItem.date);
    selectedPeriod = targetItem.period;
    selctedSubject = targetItem.subject;
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#assessment').height() + 130 + 'px');
    }, 100);
}

async function deleteAssignment(id) {
    if (confirm('잘못된 내용인 경우 삭제해주세요. 수행평가를 삭제하면 우리 반 친구들 모두에게 반영됩니다.')) {
        firebase.database().ref('assignments/' + grade + '/' + classNum + '/' + id).remove();
        updateAssignList();
    }
}

// 수행평가 목록 로딩
function updateAssignList() {
    firebase.database().ref('assignments/' + grade + '/' + classNum).once('value').then((snapshot) => {
        var data = snapshot.val();
        if (data) {
            console.log(data)
            var keys = Object.keys(data);
            $('#assignments-listview').html('');
            for (var i = 0; i < keys.length; i++) {
                if (new Date(data[keys[i]].date) < new Date()) {//기한 지난 수행평가는 삭제
                    firebase.database().ref('assignments/' + grade + '/' + classNum + '/' + keys[i]).remove();
                } else {
                    console.log(data[keys[i]]);
                    //5일 이내면 시간표에 표시
                    if (new Date(data[keys[i]].date) - new Date() < 432000000) {
                        const dayName = ['', 'm', 'tu', 'w', 'th', 'f', ''];
                        var day = dayName[new Date(data[keys[i]].date).getDay()];
                        var period = data[keys[i]].period;
                        if (day != '' && period != '') {
                            $(`#${day}${period}`).addClass('hasAssign');
                        }
                    }
                    // 목록에 추가
                    if (data[keys[i]].period) { //교시 지정됨
                        $('#assignments-listview').append(`
                        <div class="task-box" onclick="deleteAssignment('`+ keys[i] + `');">
                        <div class="assign-date">`+ moment(new Date(data[keys[i]].date)).format('MM/DD') + `<br><span style="font-size:15px;opacity:0.6">D-` + fromToday(new Date(data[keys[i]].date)) + `</span></div>
                        <div class="description-task">
                            <div class="time">`+ data[keys[i]].period + `교시 ` + data[keys[i]].subject + `</div>
                            <div class="task-name">`+ data[keys[i]].title + `</div>
                        </div>
                        </div>`);
                    } else { //교시 지정 안됨
                        $('#assignments-listview').append(`
                     <div class="task-box" onclick="deleteAssignment('`+ keys[i] + `');">
                     <div class="assign-date">`+ moment(new Date(data[keys[i]].date)).format('MM/DD') + `<br><span style="font-size:15px;opacity:0.6">D-` + fromToday(new Date(data[keys[i]].date)) + `</span></div>
                     <div class="description-task">
                         <div class="time">하루 종일</div>
                         <div class="task-name">`+ data[keys[i]].title + `</div>
                     </div>
                     </div>`);
                    }

                }
            }
            //다크모드 적용
            if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                var items = document.getElementsByClassName('task-box');
                for (var i = 0; i < items.length; i++) {
                    items[i].classList.add("dark");
                }
            }
        } else {
            $('#assignments-listview').html(`
                <picture>
                 <source srcset="assets/icons/webp/Empty-BOX.webp" class="no-assign-img" type="image/webp" width="50%" />
                 <img loading="lazy" class="no-assign-img" src="assets/icons/Empty-BOX.png" width="50%">
                </picture><br>
                <span>아직 우리 반 할 일이 없어요</span>`);
        }
    });

}


//시간표에서 하이라이팅 과목 누름련 수행평가 탭으로 이동
$(document).on('click', '.hasAssign', function () {
    $('.bottom-nav a').removeClass('active');
    $('.bottom-nav a').removeClass('bounce');
    $('#assignment-btn').addClass('active');
    $('#assignment-btn').addClass('bounce');
    $('html, body').animate({
        scrollTop: 0
    }, 'fast');

    $('.main-nav').hide();
    $('#home').hide();
    $('#community').hide();
    $('#assignment').fadeIn(500);
    $('#report').hide();
    isBigScreen() ? $('.bottom-nav').css('border-radius', '20px') : $('.bottom-nav').css('border-radius', '20px 20px 0 0');
    $('#tab1').attr('name', 'planet-outline');
    $('#tab2').attr('name', 'chatbubbles-outline');
    $('#tab3').attr('name', 'file-tray-full');
});
