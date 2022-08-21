var myChart = new Chart(document.getElementById('myChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'],
        datasets: [{
            data: [],
            backgroundColor: 'rgba(76, 99, 187, 0.7)',
            borderColor: 'rgba(76, 99, 187, 0.8)',
            tension: 0.4,
            borderRadius: 20,
        }]
    },
    options: {
        plugins: {
            legend: {
                display: false
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                display: false,
                reverse: true,
            },
            yAxes: [{
                display: false,
                ticks: {
                    beginAtZero: false,
                }
            }]
        }
    }
});;

function drawReportChart(dataArr) {
    myChart.data.datasets[0].data = dataArr;
    myChart.update();
}

//초기 로딩(1학년 1학기)
var data = JSON.parse(localStorage.getItem('ssoak-semesterData')) || {};
const currentTab = $('.semester-subjectList.active');
const currentSemester = $(currentTab).attr('data-semester');
if (data[currentSemester] != undefined) {
    $('.semester-subjectList').html('');
    for (var i = 0; i < data[currentSemester].subjectNames.length; i++) {
        $(currentTab).append(`
            <div class="semester-subject">
                <input id="subjectName" type="text" placeholder="과목명" value="`+ data[currentSemester].subjectNames[i] + `" required>
                <input id="subjectUnit" type="number" placeholder="단위수" value="`+ data[currentSemester].subjectUnits[i] + `" maxLength="1" required>
                <input id="subjectGrade" type="number" placeholder="등급" value="`+ data[currentSemester].subjectGrades[i] + `" maxLength="1" required>
                <button style="width:10%" class="custom-btn sub-btn" onclick="deleteSubject(this);">X
                </button>
            </div>
            `)
    }
    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
        $('.semester-subject input').each(function () {
            $(this).addClass("dark");
        });
    }
    calculateTotalGrade()
}

function openSemester(index, btn) {
    $('.semester-tab').removeClass('active');
    $(btn).addClass('active');
    $('.semester-subjectList').removeClass('active');
    $('.semester-subjectList').hide();
    document.getElementsByClassName('semester-subjectList')[index].classList.add('active');
    $(document.getElementsByClassName('semester-subjectList')[index]).show();

    var data = JSON.parse(localStorage.getItem('ssoak-semesterData')) || {};
    const currentTab = $('.semester-subjectList.active');
    const currentSemester = $(currentTab).attr('data-semester');
    if (data[currentSemester] != undefined) {
        $('.semester-subjectList').html('');
        for (var i = 0; i < data[currentSemester].subjectNames.length; i++) {
            $(currentTab).append(`
            <div class="semester-subject">
                <input id="subjectName" type="text" placeholder="과목명" value="`+ data[currentSemester].subjectNames[i] + `" required>
                <input id="subjectUnit" type="number" placeholder="단위수" value="`+ data[currentSemester].subjectUnits[i] + `" maxLength="1" required>
                <input id="subjectGrade" type="number" placeholder="등급" value="`+ data[currentSemester].subjectGrades[i] + `" maxLength="1" required>
                <button style="width:10%" class="custom-btn sub-btn" onclick="deleteSubject(this);">X
                </button>
            </div>
            `)
        }
    }
    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
        $('.semester-subject input').each(function () {
            $(this).addClass("dark");
        });
    }
}


$('#openCalculator-btn').on('click', function () {
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').html('등급 계산기');
    $('.content-wrap').hide();
    $('#assessment').hide();
    $('#exam').hide();
    $('#calculator').show();
    $('#assign-add-save-btn').show();
    $('#assign-edit-save-btn').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    $('#calculator-result').hide();
    $('#grade-rank').val('');
    $('#grade-tie').val('');
    $('#grade-total').val(localStorage.getItem('ssoak-grade-total') || '');
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#calculator').height() + 130 + 'px');
    }, 100);
});

function calculateGrade() {
    const rank_input = $('#grade-rank').val();
    const total_input = $('#grade-total').val();

    var rank = parseInt(rank_input);
    var total = parseInt(total_input);
    var grade = 0;

    if (rank_input == '' || total_input == '' || rank_input == 0 || total_input == 0) {
        toast('모든 항목을 입력해주세요.');
    } else if (total_input <= 1) {
        toast('이수자 수에는 1보다 큰 수를 입력해주세요.');
    } else {
        if (rank <= Math.floor(total * 4 / 100)) {
            grade = 1;
        } else if (rank <= Math.floor(total * 11 / 100)) {
            grade = 2;
        } else if (rank <= Math.floor(total * 23 / 100)) {
            grade = 3;
        } else if (rank <= Math.floor(total * 40 / 100)) {
            grade = 4;
        } else if (rank <= Math.floor(total * 60 / 100)) {
            grade = 5;
        } else if (rank <= Math.floor(total * 77 / 100)) {
            grade = 6;
        } else if (rank <= Math.floor(total * 89 / 100)) {
            grade = 7;
        } else if (rank <= Math.floor(total * 96 / 100)) {
            grade = 8;
        } else {
            grade = 9
        }
        $('#resultGrade').text(grade);
        $('#calculator-result').show();
        $('.sheet-modal').css('height', $('#calculator').height() + 130 + 'px');
        localStorage.setItem('ssoak-grade-total', total);
    }
}


// #subjectUnit or #subjectGrade maxLength 1
$('.semester-subject input').on('input', function () {
    if (($(this).attr('id') == "subjectUnit" || $(this).attr('id') == "subjectGrade") && $(this).val().length > 1) {
        $(this).val($(this).val().slice(0, 1));
    }
}
);

function addSubject() {
    const currentTab = $('.semester-subjectList.active');
    $(currentTab).append(`
    <div class="semester-subject">
                <input id="subjectName" type="text" placeholder="과목명" required>
                <input id="subjectUnit" type="number" placeholder="단위수" maxLength="1" required>
                <input id="subjectGrade" type="number" placeholder="등급" maxLength="1" required>
                <button style="width:10%" class="custom-btn sub-btn" onclick="deleteSubject(this);">X
                </button>
            </div>
    `);
    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
        $('.semester-subject input').each(function () {
            $(this).addClass("dark");
        });
    }
}

function saveSemester() {
    const currentTab = $('.semester-subjectList.active');
    const currentSemester = $(currentTab).attr('data-semester');
    var subjectNames = [];
    var subjectUnits = [];
    var subjectGrades = [];
    var cnt = 0;
    $(currentTab).find('.semester-subject').each(function () {
        subjectNames[cnt] = $(this).find('#subjectName').val();
        subjectUnits[cnt] = $(this).find('#subjectUnit').val();
        subjectGrades[cnt] = $(this).find('#subjectGrade').val();
        cnt++;
    });

    var semesterData = JSON.parse(localStorage.getItem('ssoak-semesterData')) || {};
    semesterData[currentSemester] = {
        "subjectNames": subjectNames,
        "subjectUnits": subjectUnits,
        "subjectGrades": subjectGrades
    }
    localStorage.setItem('ssoak-semesterData', JSON.stringify(semesterData));
    console.log(localStorage.getItem('ssoak-semesterData'));
    calculateTotalGrade();
    toast('저장되었습니다.');
    $('html, body').animate({
        scrollTop: 0
    }, 100);
}

function deleteSubject(target) {
    console.log(target)
    $(target).parent().remove();
}


function calculateTotalGrade() {
    var totalGrade = []; //학기별 종합 성적 저장하는 배열

    var currentData = JSON.parse(localStorage.getItem('ssoak-semesterData'));
    //1학년 1학기
    var tempSum = 0;
    var unitSum = 0;
    if (currentData['1_1']) {
        for (var i = 0; i < currentData['1_1'].subjectNames.length; i++) {
            if (currentData['1_1'].subjectUnits[i] != '') {
                tempSum += parseInt(currentData['1_1'].subjectUnits[i] * currentData['1_1'].subjectGrades[i]);
                unitSum += parseInt(currentData['1_1'].subjectUnits[i]);
            }
        }
        totalGrade[0] = tempSum / unitSum;
    }

    //1학년 2학기
    var tempSum = 0;
    var unitSum = 0;
    if (currentData['1_2']) {
        for (var i = 0; i < currentData['1_2'].subjectNames.length; i++) {
            if (currentData['1_2'].subjectUnits[i] != '') {
                tempSum += parseInt(currentData['1_2'].subjectUnits[i] * currentData['1_2'].subjectGrades[i]);
                unitSum += parseInt(currentData['1_2'].subjectUnits[i]);
            }
        }
        totalGrade[1] = tempSum / unitSum;
    }

    //12학년 1학기
    var tempSum = 0;
    var unitSum = 0;
    if (currentData['2_1']) {
        for (var i = 0; i < currentData['2_1'].subjectNames.length; i++) {
            if (currentData['2_1'].subjectUnits[i] != '') {
                tempSum += parseInt(currentData['2_1'].subjectUnits[i] * currentData['2_1'].subjectGrades[i]);
                unitSum += parseInt(currentData['2_1'].subjectUnits[i]);
            }
        }
        totalGrade[2] = tempSum / unitSum;
    }

    //2학년 2학기
    var tempSum = 0;
    var unitSum = 0;
    if (currentData['2_2']) {
        for (var i = 0; i < currentData['2_2'].subjectNames.length; i++) {
            if (currentData['2_2'].subjectUnits[i] != '') {
                tempSum += parseInt(currentData['2_2'].subjectUnits[i] * currentData['2_2'].subjectGrades[i]);
                unitSum += parseInt(currentData['2_2'].subjectUnits[i]);
            }
        }
        totalGrade[3] = tempSum / unitSum;
    }

    //3학년 1학기
    var tempSum = 0;
    var unitSum = 0;
    if (currentData['3_1']) {
        for (var i = 0; i < currentData['3_1'].subjectNames.length; i++) {
            if (currentData['3_1'].subjectUnits[i] != '') {
                tempSum += parseInt(currentData['3_1'].subjectUnits[i] * currentData['3_1'].subjectGrades[i]);
                unitSum += parseInt(currentData['3_1'].subjectUnits[i]);
            }
        }
        totalGrade[4] = tempSum / unitSum;
    }

    //3학년 2학기
    var tempSum = 0;
    var unitSum = 0;
    if (currentData['3_2']) {
        for (var i = 0; i < currentData['3_2'].subjectNames.length; i++) {
            if (currentData['3_2'].subjectGrades[i] != '') {
                tempSum += parseInt(currentData['3_2'].subjectUnits[i] * currentData['3_2'].subjectGrades[i]);
                unitSum += parseInt(currentData['3_2'].subjectUnits[i]);
            }
        }
        totalGrade[5] = tempSum / unitSum;
    }

    console.log(totalGrade);
    drawReportChart(totalGrade);

    var totalGradeExceptZero = []; //0 제외
    var totalSumExceptZero = 0;
    for (var i = 0; i < totalGrade.length; i++) {
        if (totalGrade[i] != 0 && totalGrade[i] != undefined && totalGrade[i] != '' && totalGrade[i] != null && isNaN(totalGrade[i]) == false) {
            totalGradeExceptZero.push(totalGrade[i]);
            totalSumExceptZero = totalSumExceptZero + totalGrade[i];
        }
    }

    //0제외한 전학년 등급 산출
    $('#totalGrade').text((totalSumExceptZero / totalGradeExceptZero.length).toFixed(2));
}