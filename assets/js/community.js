//로그인
const auth = firebase.auth();
var db = firebase.firestore();

//로그인 여부 확인
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        loadPostList();
        $('#community .no-login').hide();
        $('#community .main-community').show();
        $('#community #account-btn').show();
        $('#community .header').show();
        Android.sendUserIdForFCM(firebase.auth().currentUser.uid)
    } else {
        $('#community .no-login').show();
        $('#community .main-community').hide();
        $('#community #account-btn').hide();
        $('#community .header').hide();
    }
});


function openLogin() {
    if(isApp()) {
        loginGoogle().then(function (result) {
            console.log('구글 로그인 완료', result);
        })
    }
}

//Google 로그인
var tempData = [];
const provider = new firebase.auth.GoogleAuthProvider();
const loginGoogle = () => {
    return firebase.auth().signInWithPopup(provider)
        .then((result) => {
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
                }).catch((err) => {
                    console.log(err);
                })


                $('#login-username').val(result.user.displayName);

                //open bottom sheet
                $('.sheet-modal').css('height', '30%');
                $('#modal-title').html('시작하기');
                $('.content-wrap').hide();
                $('#loginForm').show();
                $('#exam').hide();
                $('#assign-add-save-btn').hide();
                $('#assign-edit-save-btn').hide();
                $('body').css('overflow', 'hidden');
                $('.modal-in').css('display', 'block');
                $('.modal-in').css('bottom', '-1850px');
                setTimeout(function () {
                    $('.modal-in').css('bottom', '0px');
                }, 100);
                $('.sheet-backdrop-nocancel').addClass('backdrop-in');
                $('.sheet-backdrop').removeClass('backdrop-in');
                setTimeout(function () {
                    $('.sheet-modal').css('height', $('#loginForm').height() + 130 + 'px');
                }, 100);
            }
        }).catch((error) => {
            console.log(error);
        });
};

function finishGoogleLogin(res) {
    console.log(res);
    if (res.uid) {
        $('#community #account-btn').show();
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
    $('.no-login').hide();
    console.log('pushWebviewGoogleLoginToken', idTokenFromApp);
    const credential = firebase.auth.GoogleAuthProvider.credential(idTokenFromApp);
    // Sign in with credential from the Google user.
    firebase.auth().signInWithCredential(credential).catch((error) => {
        // Handle Errors here.
        console.log(error);
        const errorCode = error.code;
        const errorMessage = error.message;

        logError(`Error logging in: ${errorCode} ${errorMessage} token: ${idTokenFromApp}`, error);
        Android.sendUserIdForFCM(firebase.auth().currentUser.uid);
    });
}



$('#community #account-btn').on('click', function () {
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').html('계정 설정');
    $('.content-wrap').hide();
    $('#account').show();
    $('#exam').hide();
    $('#assign-add-save-btn').hide();
    $('#assign-edit-save-btn').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    db.collection('users').doc(firebase.auth().currentUser.uid).get().then((doc_user) => {
        var user = doc_user.data();
        $('#account-username').val(user.nickname);
    });
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#account').height() + 130 + 'px');
    }, 100);
});


$('#account #logout-btn').on('click', function () {
    confirmLogout();
});

async function confirmLogout() {
    const confirm = await ui.confirm('정말 로그아웃 하시겠습니까?');
    if (confirm) {
        firebase.auth().signOut().then(function () {
            $('#community #account-btn').hide();
            $('#community .no-login').show();
            closeModal();
            toast('로그아웃 되었습니다.')
        });
    }
}

function edit_saveAccountDb() {
    var nickname = $('#account-username').val();
    //nickname is empty or blank or space
    if (nickname == '' || nickname == ' ' || nickname == null || nickname == undefined || nickname == '  ') {
        toast('닉네임을 입력해주세요.')
    } else {
        $('body').css('overflow', 'auto');
        $('.modal-in').css('bottom', '-1850px');
        setTimeout(function () {
            $('.modal-in').css('display', 'none');
        }, 100);

        $('.sheet-backdrop').removeClass('backdrop-in');

        var data = {
            nickname: $('#account-username').val(),
        }

        db.collection('users').doc(firebase.auth().currentUser.uid).update(data).then((result2) => {
            loadPostList();
        }).catch((err) => {
            toast(err)
            console.log(err);
        })
    }
}

function saveAccountDb() {
    var nickname = $('#login-username').val();
    //nickname is empty or blank or space
    if (nickname == '' || nickname == ' ' || nickname == null || nickname == undefined || nickname == '  ') {
        toast('닉네임을 입력해주세요.')
    } else {
        $('body').css('overflow', 'auto');
        $('.modal-in').css('bottom', '-1850px');
        setTimeout(function () {
            $('.modal-in').css('display', 'none');
        }, 100);

        $('.sheet-backdrop-nocancel').removeClass('backdrop-in');


        var data = {
            nickname: $('#login-username').val(),
        }

        db.collection('users').doc(firebase.auth().currentUser.uid).update(data).then((result2) => {
            $('#community #account-btn').show();
        }).catch((err) => {
            toast(err)
            console.log(err);
        })
    }
}


var editor = new toastui.Editor.factory({
    el: document.querySelector('#editor'),
    initialEditType: 'wysiwyg',
    height: '40vh',
    initialValue: '',
    language: 'ko_KR',
    theme: 'default',
    autofocus: false,
});;
//글 작성
$('.writePost-btn').on('click', function () {
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').html('게시글 작성');
    $('.content-wrap').hide();
    $('#writePost').show();
    $('#exam').hide();
    $('#assign-add-save-btn').hide();
    $('#assign-edit-save-btn').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');

    $('#editor').empty();
    //다크모드 에디터 적용
    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
        editor = new toastui.Editor.factory({
            el: document.querySelector('#editor'),
            initialEditType: 'wysiwyg',
            height: '40vh',
            initialValue: '',
            language: 'ko_KR',
            theme: 'dark',
            autofocus: false,
        });
    } else {
        editor = new toastui.Editor.factory({
            el: document.querySelector('#editor'),
            initialEditType: 'wysiwyg',
            initialValue: '',
            height: '40vh',
            language: 'ko_KR',
            autofocus: false,
        });
    }

    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#writePost').height() + 170 + 'px');
    }, 100);

});


function post(target) {
    var title = $('#post-title').val();
    var content = editor.getMarkdown();
    var uid = firebase.auth().currentUser.uid;
    if (content) {
        var timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        $(target).text('업로드 중...');
        var data = {
            title: title,
            userId: uid,
            content: content,
            category: '자유',
            createdAt: timestamp,
        }
        db.collection('board').add(data).then((result) => {
            closeModal();
            $(target).text('등록');
            openPost('board.html?id=' + result._key.path.segments[1]);
        }).catch((err) => {
            console.log(err);
        });
        $('.snackbar').hide();
    } else {
        toast('게시글 내용을 작성해주세요.')
    }
}

var lastVisible;
var isFirstLoad = true;
//게시물 로딩
function loadPostList() {
    db.collection('board').orderBy("createdAt").limitToLast(4)
        .get()
        .then((querySnapshot) => {
            $('.post-listview').html('');
            querySnapshot.forEach((doc) => {
                var data = doc.data();
                console.log(data);
                lastVisible = querySnapshot.docs[3 - (querySnapshot.docs.length - 1)];
                db.collection('users').doc(data.userId).get().then((doc_user) => {
                    var user = doc_user.data();
                    console.log("render", data);
                    $('.post-listview').prepend(
                        `
                        <div class="post-item" onclick="openPost('`+ 'board.html?id=' + doc.id + `');" data-createdAt="` + data.createdAt.toDate().getTime() + `">
                        <div class="post-header">
                            <span id="uname">`+ ((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname)) + `<br>
                                <span style="opacity:0.7">`+ timeForToday(data.createdAt.toDate()) + `</span>
                            </span>
        
                        </div>
        
                        <h3 id="post-title">`+ data.title + `</h3>
        
                        <div class="post-preview" id="viewer-`+ doc.id + `">
                        </div>
    
                        <span style="color:#5272ff;font-size:15px;margin-top:10px;">더보기</span>
                        <br>
        
                        </div>
                        `
                    );

                    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                        const viewer = new toastui.Editor.factory({
                            el: document.querySelector('#viewer-' + doc.id),
                            viewer: true,
                            initialValue: data.content,
                            theme: 'dark'
                        });
                        $('.post-item').addClass("dark");
                    } else {
                        const viewer = new toastui.Editor.factory({
                            el: document.querySelector('#viewer-' + doc.id),
                            viewer: true,
                            initialValue: data.content,
                            theme: 'default'
                        });
                    }
                    $('.post-item').sort(function (a, b) {
                        return $(b).data('createdat') - $(a).data('createdat');
                    }
                    ).appendTo('.post-listview');

                });
                isFirstLoad = false;
            });

        });

}

//firebase infinite scroll
function loadMore() {
    if (lastVisible) {
        var nextVisible = db.collection('board').orderBy("createdAt").limitToLast(4).endBefore(lastVisible);
        nextVisible.get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    var data = doc.data();
                    console.log(data);
                    lastVisible = querySnapshot.docs[3 - (querySnapshot.docs.length = 1)];
                    db.collection('users').doc(data.userId).get().then((doc_user) => {
                        var user = doc_user.data();
                        console.log("render", data);
                        $('.post-listview').prepend(
                            `
                            <div class="post-item" onclick="openPost('`+ 'board.html?id=' + doc.id + `');" data-createdAt="` + data.createdAt.toDate().getTime() + `">
                            <div class="post-header">
                                <span id="uname">`+ ((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname)) + `<br>
                                    <span style="opacity:0.7">`+ timeForToday(data.createdAt.toDate()) + `</span>
                                </span>
            
                            </div>
            
                            <h3 id="post-title">`+ data.title + `</h3>
            
                            <div class="post-preview" id="viewer-`+ doc.id + `">
                            </div>
        
                            <span style="color:#5272ff;font-size:15px;margin-top:10px;">더보기</span>
                            <br>
            
                            </div>
                            `
                        );

                        if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                            const viewer = new toastui.Editor.factory({
                                el: document.querySelector('#viewer-' + doc.id),
                                viewer: true,
                                initialValue: data.content,
                                theme: 'dark'
                            });
                            $('.post-item').addClass("dark");
                        } else {
                            const viewer = new toastui.Editor.factory({
                                el: document.querySelector('#viewer-' + doc.id),
                                viewer: true,
                                initialValue: data.content,
                                theme: 'default'
                            });
                        }
                        $('.post-item').sort(function (a, b) {
                            return $(b).data('createdat') - $(a).data('createdat');
                        }
                        ).appendTo('.post-listview');

                    });
                });
            });

        $('.bottom_postList').html('')
    } else { //마지막 페이지
        console.log('마지막 페이지');
        $('.bottom_postList').html('마지막 글입니다.')
    }

}


const Element = document.querySelector('.bottom_postList')
const options = {}
// observer: IntersectionObserver instance
const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {


        if (entry.isIntersecting && $('.post-listview').html().length > 5) {
            loadMore();
        }
    })
}, options)

io.observe(Element)

function openPost(url) {
    if(isApp()) {
        location.href = url;
    } else {
        window.open(url, '_blank');
    }
}

// 날짜 -> {n일/분/시간 전}  형식으로 변환
function timeForToday(value) {
    const today = new Date();
    const timeValue = new Date(value);

    const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);
    if (betweenTime < 1) return '방금 전';
    if (betweenTime < 60) {
        return `${betweenTime}분 전`;
    }

    const betweenTimeHour = Math.floor(betweenTime / 60);
    if (betweenTimeHour < 24) {
        return `${betweenTimeHour}시간 전`;
    }


    const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
    if (betweenTimeDay < 365) {
        if (betweenTimeDay > 30) {
            return `${Math.floor(betweenTimeDay / 30)}개월 전`;
        } else {
            return `${betweenTimeDay}일 전`;
        }

    }

    return `${Math.floor(betweenTimeDay / 365)}년 전`;
}