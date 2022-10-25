
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
const auth = firebase.auth();
var db = firebase.firestore();

//onboard 학년 반 설정
var isComplete = false;
$('#hello').css("display", "flex");
setTimeout(function () {
    $('#hello').hide()
    $('#initialize').fadeIn()
}, 2000);


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
    completeInfoInit();
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
    location.href = 'index.html';
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


function isApp() {
    var ua = navigator.userAgent;
    if (ua.indexOf('hybridApp') > -1) {
        return true;
    } else {
        return false;
    }
}


//Google 로그인
var tempData = [];
const provider = new firebase.auth.GoogleAuthProvider();
const loginGoogle = () => {
    var is_iPad = navigator.userAgent.match(/iPad/i) != null;
    if (is_iPad) { //아이패드인 경우 리다이렉트 방식
        return firebase.auth().signInWithRedirect(provider)
            .then((result) => {
                $('.sheet-backdrop-nocancel2').removeClass('backdrop-in');
                $('#login-loader').hide();

                if (result.additionalUserInfo.isNewUser) {
                    /** @type {firebase.auth.OAuthCredential} */
                    //회원가입 성공 => DB에 사용자 정보 저장
                    tempData = [];
                    tempData[0] = result.user.uid;
                    tempData[1] = result.user.email;
                    tempData[2] = result.user.displayName;
                    var data = {
                        uid: tempData[0],
                        email: tempData[1],
                        nickname: result.user.displayName,
                        profileImg: Math.floor(Math.random() * 5),
                        admin: false,
                    }

                    db.collection('users').doc(tempData[0]).set(data).then((result) => {
                        console.log('계정정보 1차 저장 완료')
                        //로그인 완료
                        $('#login').hide()
                        $('#complete').css("display", "flex")
                        $('#complete').hide()
                        $('#complete').fadeIn()
                    }).catch((err) => {
                        console.log(err);
                    })


                    $('#login-username').val(result.user.displayName);

                    openModal('시작하기', 'loginForm')
                    $('.sheet-backdrop-nocancel').addClass('backdrop-in');
                    $('.sheet-backdrop').removeClass('backdrop-in');
                }
            }).catch((error) => {
                $('.sheet-backdrop-nocancel2').removeClass('backdrop-in');
                $('#login-loader').hide();
                console.log(error.message);
                if (error.message == "The popup has been closed by the user before finalizing the operation.") {
                    toast('로그인이 취소되었습니다.');
                } else if (error.message == "The user has cancelled authentication.") {
                    toast('로그인이 취소되었습니다.');
                } else {
                    toast('로그인 에러 : ' + error.message);
                }
            });
    } else { //기본은 팝업 로그인
        return firebase.auth().signInWithPopup(provider)
            .then((result) => {
                $('.sheet-backdrop-nocancel2').removeClass('backdrop-in');
                $('#login-loader').hide();

                if (result.additionalUserInfo.isNewUser) {
                    /** @type {firebase.auth.OAuthCredential} */
                    //회원가입 성공 => DB에 사용자 정보 저장
                    tempData = [];
                    tempData[0] = result.user.uid;
                    tempData[1] = result.user.email;
                    tempData[2] = result.user.displayName;
                    var data = {
                        uid: tempData[0],
                        email: tempData[1],
                        nickname: result.user.displayName,
                        profileImg: Math.floor(Math.random() * 5),
                        admin: false,
                    }

                    db.collection('users').doc(tempData[0]).set(data).then((result) => {
                        console.log('계정정보 1차 저장 완료')

                        //로그인 완료
                        $('#login').hide()
                        $('#complete').css("display", "flex")
                        $('#complete').hide()
                        $('#complete').fadeIn()
                    }).catch((err) => {
                        console.log(err);
                    })


                    $('#login-username').val(result.user.displayName);

                    openModal('시작하기', 'loginForm')
                    $('.sheet-backdrop-nocancel').addClass('backdrop-in');
                    $('.sheet-backdrop').removeClass('backdrop-in');
                }
            }).catch((error) => {
                $('.sheet-backdrop-nocancel2').removeClass('backdrop-in');
                $('#login-loader').hide();
                console.log(error.message);
                if (error.message == "The popup has been closed by the user before finalizing the operation.") {
                    toast('로그인이 취소되었습니다.');
                } else if (error.message == "The user has cancelled authentication.") {
                    toast('로그인이 취소되었습니다.');
                } else {
                    toast('로그인 에러 : ' + error.message);
                }
            });
    }

};

function finishGoogleLogin(res) {
    if (res.uid) {
        $('#community .community-member-header').show();
    } else {
        Swal.fire({
            icon: 'error',
            title: '오류',
            text: '계정이 정상적으로 생성되지 않았습니다. 다시 시도해주세요.',
        })
    }
}


//android webview google login
function pushWebviewGoogleLoginToken(idTokenFromApp) {
    const credential = firebase.auth.GoogleAuthProvider.credential(idTokenFromApp);
    // Sign in with credential from the Google user.
    firebase.auth().signInWithCredential(credential).then((result) => {
        $('.sheet-backdrop-nocancel2').removeClass('backdrop-in');
        $('#login-loader').hide();
        $('#login').hide()
        $('#complete').css("display", "flex")
        $('#complete').hide()
        $('#complete').fadeIn()
        if (result.additionalUserInfo.isNewUser) {
            /** @type {firebase.auth.OAuthCredential} */
            //회원가입 성공 => DB에 사용자 정보 저장
            tempData = [];
            tempData[0] = result.user.uid;
            tempData[1] = result.user.email;
            tempData[2] = result.user.displayName;
            var data = {
                uid: tempData[0],
                email: tempData[1],
                nickname: result.user.displayName,
                admin: false,
            }

            db.collection('users').doc(tempData[0]).set(data).then((result) => {
                console.log('계정정보 1차 저장 완료')
                //로그인 완료
                $('#login').hide()
                $('#complete').css("display", "flex")
                $('#complete').hide()
                $('#complete').fadeIn()
            }).catch((err) => {
                console.log(err);
            })

            $('#login-username').val(result.user.displayName);

            //open bottom sheet
            openModal('시작하기', 'loginForm')
            $('.sheet-backdrop-nocancel').addClass('backdrop-in');
            $('.sheet-backdrop').removeClass('backdrop-in');
        }
    }).catch((error) => {
        console.log(error);
        const errorCode = error.code;
        const errorMessage = error.message;
        logError(`Error logging in: ${errorCode} ${errorMessage} token: ${idTokenFromApp}`, error);
    });
}


function openModal(title, id) {
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
                background: "rgba(0, 0, 0, 0.3)",
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