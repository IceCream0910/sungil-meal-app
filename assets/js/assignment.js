//수행평가
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
var database = firebase.database();

//반번호 설정 되어있는지 확인
if (!grade || !classNum) {
    $('#assignments-listview').hide();
    $('#before-setting-assign').show();
} else {
    $('#assignments-listview').show();
    $('#before-setting-assign').hide();
}

var selectedDateAssign = new Date();
// 시행 날짜 선택
$('#date_assign').on('change', function () {
    var date = moment(new Date($(this).val())).format('YYYYMMDD');
    selectedDateAssign = new Date($(this).val());
    $('.timetable_selector').html('해당 날짜의 시간표를 불러오는 중입니다.');
    $.ajax({
        type: "GET",
        url: 'https://sungil-school-api.vercel.app/dayTimetable?date=' + date + '&grade=' + grade + '&classNum=' + classNum,
        success: function (result) {
            var data = JSON.parse(result);
            console.log(data);
            if (data.timetable) {
                $('.timetable_selector').html('');
                for (var i = 0; i < data.timetable.length; i++) {
                    $('.timetable_selector').append(`
                    <div class="item" data-period="`+ (i + 1) + `">
                    <h6>`+ (i + 1) + `교시</h5>
                    <h5>`+ data.timetable[i].ITRT_CNTNT + `</h3>
                    </div>`);
                }
                //다크모드 적용
                if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                    var items = document.getElementsByClassName('item');
                    for (var i = 0; i < items.length; i++) {
                        items[i].classList.add("dark");
                    }
                }
            } else {
                $('.timetable_selector').html('선택한 날짜에는 수업이 없어요.');
            }
            //bottom sheet 높이 조정
            setTimeout(function () {
                $('.sheet-modal').css('height', $('#assessment').height() + 130 + 'px');
            }, 100);
        }
    });
})


var selectedPeriod = null;
var selctedSubject = null;

// 시간표에서 교시 선택
$('.timetable_selector').on('click', '.item', function () {
    $('.timetable_selector .item').removeClass('active');
    $(this).addClass('active');
    selectedPeriod = $(this).attr('data-period');
    selctedSubject = $(this).find('h3').text();
})


//우리반 수행평가에서 아이템 클릭
$('#myclassAssign-listview').on('click', '.item', function () {
    var id = Math.random().toString(36).substr(2, 9);
    var data = {
        id: id,
        title: $(this).find('h4').text(),
        date: $(this).find('.assign-date').text(),
        period: $(this).find('.time').text().substring(0, 1),
        subject: $(this).find('.time').text().substring(4, $(this).find('.time').text().length),
        grade: grade,
        classNum: classNum
    };
    assignArr.push(data);
    assignArr.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('assignments', JSON.stringify(assignArr));
    closeModal();
    updateAssignList();
});

var assignArr = [];

updateAssignList();

function addAssignment() {
    if (!$('#title').val()) {
        toast('제목을 입력해주세요');
    } else if (!$('#date_assign').val()) {
        toast('시행 날짜를 선택해주세요');
    } else if (!selectedPeriod) {
        toast('시행 날짜를 선택한 후 교시를 선택해주세요');
    } else if (selectedDateAssign < new Date()) {
        toast('이미 지난 날짜는 선택할 수 없습니다.');
    } else {  //null 체크 통과
        var id = Math.random().toString(36).substr(2, 9);
        var data = {
            id: id,
            title: $('#title').val(),
            date: $('#date_assign').val(),
            period: selectedPeriod,
            subject: selctedSubject,
            grade: grade,
            classNum: classNum
        };
        assignArr.push(data);
        writeUserData(id, $('#title').val(), $('#date_assign').val(), selectedPeriod, selctedSubject);
        assignArr.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('assignments', JSON.stringify(assignArr));
        closeModal();
        updateAssignList();
    }
}

function editAssignment() {
    if (!$('#title').val()) {
        toast('제목을 입력해주세요');
    } else if (!$('#date_assign').val()) {
        toast('시행 날짜를 선택해주세요');
    } else if (!selectedPeriod) {
        toast('시행 날짜를 선택한 후 교시를 선택해주세요');
    } else if (selectedDateAssign < new Date()) {
        toast('이미 지난 날짜는 선택할 수 없습니다.');
    } else {  //null 체크 통과
        var data = JSON.parse(localStorage.getItem('assignments')) || [];
        var targetItem = data.find(item => item.id == selectedAssignId);
        targetItem.title = $('#title').val();
        targetItem.date = $('#date_assign').val()
        targetItem.period = selectedPeriod;
        targetItem.subject = selctedSubject;
        targetItem.grade = grade;
        targetItem.classNum = classNum;
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        assignArr = data;
        localStorage.setItem('assignments', JSON.stringify(data));
        closeModal();
        updateAssignList();
    }
}


function closeModal() {
    $('body').css('overflow', 'auto');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('display', 'none');
    }, 100);
    $('.sheet-backdrop').removeClass('backdrop-in');
}

function updateAssignList() {
    assignArr = [];
    $('#assignments-listview').html('');
    assignArr = JSON.parse(localStorage.getItem('assignments')) || [];
    var data = JSON.parse(localStorage.getItem('assignments')) || [];
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (data.length == 0 && grade && classNum) {
        $('#assignments-listview').html(
            `<p style="height:100%;display:flex;text-align:center;justify-content: center;align-items: center;flex-direction: column;background:none;">
                    <img class="no-meal-img" src="assets/icons/Empty-BOX.png" alt="수행 평가 없음 일러스트">
                    <span>아직 추가한 수행평가가 없어요</span>
                </p>`
        );
    } else {
        for (var i = 0; i < data.length; i++) {
            if (new Date(data[i].date) < new Date()) { //기한 지남
                var targetItem = data.find(item => item.id == data[i].id);
                data.splice(data.indexOf(targetItem), 1);
                localStorage.setItem('assignments', JSON.stringify(data));
            } else {

                $('#assignments-listview').append(`
            <div class="task-box" onclick="openAssignDetails('`+ data[i].id + `');">
            <div class="assign-date">`+ moment(new Date(data[i].date)).format('MM/DD') + `<br><span style="font-size:15px;opacity:0.6">D-` + fromToday(new Date(data[i].date)) + `</span></div>
            <div class="description-task">
                <div class="time">`+ data[i].period + `교시 ` + data[i].subject + `</div>
                <div class="task-name">`+ data[i].title + `</div>
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


function assignEditMode() {
    var data = JSON.parse(localStorage.getItem('assignments'));
    var targetItem = data.find(item => item.id == selectedAssignId);
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').html('수행평가 추가');
    $('.content-wrap').hide();
    $('#assessment').show();
    $('#assign-add-save-btn').hide();
    $('#assign-edit-save-btn').show();
    $('#title').val(targetItem.title);
    $('#assessment #date_assign').val(moment(targetItem.date).format('YYYY-MM-DD'));
    $('.timetable_selector').html('로딩중...');
    $('#exam').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    var date = moment(new Date($('#assessment #date_assign').val())).format('YYYYMMDD');
    $('.timetable_selector .item').removeClass('active');
    $(this).addClass('active');
    selectedDateAssign = new Date(targetItem.date);
    selectedPeriod = targetItem.period;
    selctedSubject = targetItem.subject;
    $.ajax({
        type: "GET",
        url: 'https://sungil-school-api.vercel.app/dayTimetable?date=' + date + '&grade=' + grade + '&classNum=' + classNum,
        success: function (result) {
            var data = JSON.parse(result);
            console.log(data);
            if (data.timetable) {
                $('.timetable_selector').html('');
                for (var i = 0; i < data.timetable.length; i++) {
                    if (i + 1 == targetItem.period) {
                        $('.timetable_selector').append(`
                        <div class="item active" data-period="`+ (i + 1) + `">
                        <h6>`+ (i + 1) + `교시</h5>
                        <h5>`+ data.timetable[i].ITRT_CNTNT + `</h3>
                        </div>`);
                    } else {
                        $('.timetable_selector').append(`
                            <div class="item" data-period="`+ (i + 1) + `">
                            <h6>`+ (i + 1) + `교시</h5>
                            <h5>`+ data.timetable[i].ITRT_CNTNT + `</h3>
                            </div>`);
                    }

                }
                //다크모드 적용
                if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                    var items = document.getElementsByClassName('item');
                    for (var i = 0; i < items.length; i++) {
                        items[i].classList.add("dark");
                    }
                }
            } else {
                $('.timetable_selector').html('선택한 날짜에는 수업이 없어요.');
            }
            //bottom sheet 높이 조정
            setTimeout(function () {
                $('.sheet-modal').css('height', $('#assessment').height() + 130 + 'px');
            }, 100);
        }
    });
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#assessment').height() + 130 + 'px');
    }, 100);
}

function assignDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) {
        return true;
    } else {
        //삭제
        var data = JSON.parse(localStorage.getItem('assignments'));
        var targetIndex = data.findIndex(item => item.id == selectedAssignId);
        data.splice(targetIndex, 1);
        assignArr = data;
        localStorage.setItem('assignments', JSON.stringify(data));
        closeModal();
        updateAssignList();

    }

}

function writeUserData(idx, title, date, period, subject) {
    database.ref('assignments/' + grade + '/' + classNum + '/' + idx).set({
        id: idx,
        title: title,
        date: date,
        period: period,
        subject: subject
    });
}

//우리반 수행평가 열기
function openClassAssign() {
    var cnt = 0;
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').html('우리 반 수행평가');
    $('.content-wrap').hide();
    $('#myClassAssign').show();
    $('#assign-add-save-btn').hide();
    $('#assign-edit-save-btn').show();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');

    firebase.database().ref('assignments/' + grade + '/' + classNum).once('value').then((snapshot) => {
        console.log(snapshot.val());
        var data = snapshot.val();
        if (data) {
            var keys = Object.keys(data);
            $('#myclassAssign-listview').html('');
            for (var i = 0; i < keys.length; i++) {
                cnt++;
                if (new Date(data[keys[i]].date) < new Date()) {//기한 지남
                    firebase.database().ref('assignments/' + grade + '/' + classNum + '/' + keys[i]).remove();
                } else {
                    $('#myclassAssign-listview').append(`<div class="item" data-id="` + keys[i] + `">
                    <div>
                        <h4>` + data[keys[i]].title + `</h4>
                        <div class="assign-date">` + moment(data[keys[i]].date).format('YYYY-MM-DD') + `</div>
                        <div class="time">` + data[keys[i]].period + `교시 ` + data[keys[i]].subject + `</div>
                    </div>
                    <ion-icon name="add-outline"></ion-icon>
                    </div>`);
                }
            }
        } else {
            $('#myclassAssign-listview').html('친구들이 추가한 수행평가가 아직 없어요');
        }
        setTimeout(function () {
            if (cnt < 5) {
                $('#myclassAssign-listview').css('height', '100%');
                $('.sheet-modal').css('height', $('#myclassAssign-listview').height() + 130 + 'px');
            } else {
                console.log($('#myClassAssign').height())
                $('.sheet-modal').css('height', '60%');
                $('#myclassAssign-listview').css('height', $('.sheet-modal').height() - 130 + 'px');
            }
            $('#myclassAssign-listview').scrollTop(0);
        }, 200);
    });
}
