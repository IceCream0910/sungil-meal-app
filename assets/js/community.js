
//로그인
const auth = firebase.auth();
var db = firebase.firestore();

var currentCategory = 'all';

//로그인 여부 확인
firebase.auth().onAuthStateChanged(function (user) {
    loadPostList('all');
    if (user) {
        db.collection('users').doc(firebase.auth().currentUser.uid).get().then((docSnapshot) => {
            if (docSnapshot.exists) { //기존 계정
                $('#header-username').text(docSnapshot.data().nickname);
                if (docSnapshot.data().profileImg) {
                    $('#header-profile-img').attr('src', `assets/icons/profileImg/letter${docSnapshot.data().profileImg + 1}.png`);
                } else {
                    $('#header-profile-img').attr('src', `assets/icons/profileImg/letter1.png`);
                }
                if (docSnapshot.data().grade != localStorage.getItem("sungil_grade") || docSnapshot.data().class != localStorage.getItem("sungil_classNum")) { //유저 학년 반 정보 갱신
                    var data = {
                        grade: localStorage.getItem("sungil_grade"),
                        class: localStorage.getItem("sungil_classNum"),
                    }

                    db.collection('users').doc(firebase.auth().currentUser.uid).update(data).then((result2) => {
                        console.log('유저 학년 반 정보 db 갱신 완료')
                    }).catch((err) => {
                        console.log(err);
                    })
                }
            } else { // 신규 계정
                tempData = [];
                tempData[0] = user.uid;
                tempData[1] = user.email;
                tempData[2] = user.displayName;
                var data = {
                    uid: tempData[0],
                    email: tempData[1],
                    nickname: user.displayName,
                    profileImg: Math.floor(Math.random() * 5),
                    admin: false,
                }
                db.collection('users').doc(tempData[0]).set(data).then((result) => {
                    console.log('계정정보 1차 저장 완료')
                }).catch((err) => {
                    console.log(err);
                })

                $('#login-username').val(docSnapshot.data().displayName);

                openModal('시작하기', 'loginForm')
                $('.sheet-backdrop-nocancel').addClass('backdrop-in');
                $('.sheet-backdrop').removeClass('backdrop-in');
            }
        });

        $('#community .header .header-signed-in').css("display", "flex");
        $('#community .header .header-unsigned').hide();
        $('.writePost-btn').show();
        $('.writeVote-btn').show();

        if (isApp()) {
            Android.sendUserIdForFCM(firebase.auth().currentUser.uid)
        }

    } else {
        $('#community .header .header-signed-in').hide();
        $('#community .header .header-unsigned').show();
        $('.writePost-btn').hide();
        $('.writeVote-btn').hide();
    }
});

function loginWithGoogle() {
    if (isApp()) {
        location.href = 'https://ssoak-72f93.firebaseapp.com/';
        $('.sheet-backdrop-nocancel2').addClass('backdrop-in');
        $('#login-loader').show();
    } else {
        const searchParams = new URLSearchParams('loginProcess=none');
        searchParams.set('loginProcess', 'true');

        $('.sheet-backdrop-nocancel2').addClass('backdrop-in');
        $('#login-loader').show();
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider);
        $('.sheet-backdrop-nocancel2').removeClass('backdrop-in');
        $('#login-loader').hide();
        closeModal();
    }
}

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
        closeModal();
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

/* 페이스북 로그인
function loginWithFacebook() {
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.setCustomParameters({
        'display': 'popup'
    });
    firebase
        .auth()
        .signInWithPopup(provider)
        .then((result) => {
            var credential = result.credential;
            firebase.auth().signInWithCredential(credential).then((resultAuth) => {
                console.log(resultAuth);
            }).catch((error) => {
                console.log(error);
                const errorCode = error.code;
                const errorMessage = error.message;
                logError(`Error logging in: ${errorCode} ${errorMessage} token: ${idTokenFromApp}`, error);
            });
        })
        .catch((error) => {
            console.log("facebook err", error)
        });
}
*/


//TODO : https://lanicc.medium.com/%ED%8C%8C%EC%9D%B4%EC%96%B4%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%97%90-%EC%B9%B4%EC%B9%B4%EC%98%A4-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EC%97%B0%EB%8F%99%ED%95%98%EA%B8%B0-1-455e0b5f50c8
function loginWithKakao() {
    toast('아직 열심히 만들고 있어요')
    /*
    Kakao.Auth.login({
        success: function (response) {
            Kakao.API.request({
                url: '/v2/user/me',
                success: function (response) {
                    // 가입 여부 확인
                    const docSnapshot = await db.collection('users').doc(response.id).get();
                    if (docSnapshot.exists) {

                    } else {

                    }

                    var data = {
                        uid: response.id,
                        email: response.kakao_account.email || response.kakao_account.id + '@kakao.com',
                        nickname: response.kakao_account.profile.nickname,
                        admin: false,
                    }

                    db.collection('users').doc(response.id).add(data).then((result) => {
                    }).catch((err) => {
                        console.log(err);
                    })

                    $('#login-username').val(response.kakao_account.profile.nickname);

                    openModal('시작하기', 'loginForm')
                    $('.sheet-backdrop-nocancel').addClass('backdrop-in');
                    $('.sheet-backdrop').removeClass('backdrop-in');
                },
                fail: function (error) {
                    toast('로그인 오류 : ' + error)
                },
            })
        },
        fail: function (error) {
            console.log(error)
            toast('로그인 오류 : ' + error)')
        },
    })
    */
}


$('#community .header-signed-in img, #community .header-signed-in h3').on('click', function () {
    if (firebase.auth().currentUser) {
        window.open('/profile.html?uid=' + firebase.auth().currentUser.uid, '_blank');
    }
});


function saveAccountDb() {
    var nickname = $('#login-username').val();
    var checkedValues = $('#signup-checklist input:checked').map(function () {
        return this.value;
    }).get();
    //nickname is empty or blank or space
    if (nickname == '' || nickname == ' ' || nickname == null || nickname == undefined || nickname == '  ') {
        toast('닉네임을 입력해주세요.')
    } else if (checkedValues.length != 3) {
        toast('모든 항목에 동의해주세요.')
    } else {
        checkNicknameDuplicate($('#login-username').val());
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
});

//글 작성
$('.writePost-btn').on('click', function () {
    $('html').css('overflow', 'hidden');
    if (currentCategory == 'all' || currentCategory == '공지') {
        $('#write-post-popup').show(200);
        $('#post-btn').text('게시');
        $('#post-btn').attr('disabled', false);
        // 첨부 파일 초기화
        currentAttachedImages = [];
        $('.img-thumbs').children('.wrapper-thumb').remove();
        $('#category-select').val("자유");
        uploadedFile = null;
        $('#editor').empty();
    } else {
        $('#write-post-popup').show();
        $('#post-btn').text('게시');
        $('#post-btn').attr('disabled', false);
        // 첨부 파일 초기화
        currentAttachedImages = [];
        $('.img-thumbs').children('.wrapper-thumb').remove();
        //
        $('#category-select').val(currentCategory);
        uploadedFile = null;
        $('#editor').empty();
    }

    //다크모드 에디터 적용
    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
        editor = new toastui.Editor.factory({
            el: document.querySelector('#editor'),
            toolbarItems: [
                ['bold', 'italic', 'strike'],
                ['hr', 'quote', 'ul', 'task'],
            ],
            initialEditType: 'wysiwyg',
            height: 'auto',
            initialValue: '',
            language: 'ko_KR',
            theme: 'dark',
            autofocus: false,
        });
    } else {
        editor = new toastui.Editor.factory({
            el: document.querySelector('#editor'),
            toolbarItems: [
                ['bold', 'italic', 'strike'],
                ['hr', 'quote', 'ul', 'task'],
            ],
            initialEditType: 'wysiwyg',
            initialValue: '',
            height: 'auto',
            language: 'ko_KR',
            autofocus: false,
        });
    }
});

//투표 만들기 버튼
$('.writeVote-btn').on('click', function () {
    openModal('투표 만들기', 'vote')
    $('#vote-title').val('');
    $('#vote-choice-list').html(`
    <input id="vote-choice" type="text" placeholder="항목 내용을 입력해주세요" style="font-size:16px;" required>
    <input id="vote-choice" type="text" placeholder="항목 내용을 입력해주세요" style="font-size:16px;" required>
    `);
});

function closeWritePopup() {
    $('html').css('overflow', '');
    $('#write-post-popup').hide(100);
}
var imagesArray = [];

function post(target) {
    var title = $('#post-title').val();
    var category = $('#category-select').val();
    var content = editor.getMarkdown();
    var uid = firebase.auth().currentUser.uid;
    if (content && category) {
        $(target).text('업로드 중...');
        $(target).attr('disabled', true);
        if (currentAttachedImages.length != 0) { // 사진 있음
            for (var i = 0; i < currentAttachedImages.length; i++) { //파일 업로드
                var storageRef = firebase.storage().ref();
                var fileRef = storageRef.child(`images/${currentAttachedImages[i].name}`);
                fileRef.put(currentAttachedImages[i]).then(function (snapshot) {
                    fileRef.getDownloadURL().then(function (url) {
                        imagesArray.push(url);
                        if (imagesArray.length == currentAttachedImages.length) { //정상 업로드 확인
                            var timestamp = firebase.firestore.Timestamp.fromDate(new Date());
                            var data = {
                                title: title,
                                userId: uid,
                                content: content,
                                category: category || '자유',
                                createdAt: timestamp,
                                image: imagesArray,
                            }
                            console.log(data)
                            db.collection('board').add(data).then((result) => {
                                closeWritePopup();
                                $(target).text('게시');
                                $(target).attr('disabled', false);
                                openPost('board.html?id=' + result._key.path.segments[1]);
                            }).catch((err) => {
                                console.log(err);
                            });
                            $('.snackbar').hide();
                            loadPostList(currentCategory);
                        } else {
                            toast('업로드 중 오류가 발생했어요. 다시 시도해주세요.')
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
                }).catch(function (error) {
                    console.log(error);
                });
            }


        } else {
            var timestamp = firebase.firestore.Timestamp.fromDate(new Date());
            var data = {
                title: title,
                userId: uid,
                content: content,
                category: category || '자유',
                createdAt: timestamp,
            }
            db.collection('board').add(data).then((result) => {
                closeWritePopup();
                $(target).text('게시');
                $(target).attr('disabled', false);
                openPost('board.html?id=' + result._key.path.segments[1]);
            }).catch((err) => {
                console.log(err);
            });
            $('.snackbar').hide();
            loadPostList(currentCategory);
        }


    } else {
        toast('글 내용과 카테고리를 모두 입력해주세요');
    }
}

var lastVisible;
var isFirstLoad = true;
//게시물 로딩
function loadPostList(category) {
    if (category == 'all') {
        var database = db.collection('board').orderBy("createdAt").limitToLast(4);
    } else {
        var database = db.collection('board').where('category', '==', category).orderBy("createdAt").limitToLast(4);
    }
    database.get()
        .then((querySnapshot) => {
            $('.post-listview').html('');
            querySnapshot.forEach((doc) => {
                var data = doc.data();
                lastVisible = querySnapshot.docs[3 - (querySnapshot.docs.length - 1)];
                db.collection('users').doc(data.userId).get().then((doc_user) => {
                    var user = doc_user.data();
                    $('.post-listview').prepend(
                        `
                        <div class="post-item" onclick="openPost('`+ 'board.html?id=' + doc.id + `', this);" data-createdAt="` + data.createdAt.toDate().getTime() + `">
                        <div class="post-header">
                        <img src="assets/icons/profileImg/letter`+ ((user.profileImg) ? user.profileImg + 1 : 1) + `.png" class="profile-img" />
                            <span id="uname">`+ ((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname || '(어디론가 사라진 사용자)')) + `<br>
                                <span style="opacity:0.7">`+ timeForToday(data.createdAt.toDate()) + `</span>
                            </span>
        
                        </div>
        
                        <h3 id="post-title">`+ data.title + `</h3>
        
                        <div class="post-preview" id="viewer-`+ doc.id + `">
                        </div>
                        
                        <div id="choices-list-`+ doc.id + `" style="width: 100%;"> </div>

                        ${(data.image) ? `<img src="` + data.image[0] + `" class="post-image" />` : ''}
                        <span style="color:#5272ff;font-size:15px;margin-top:10px;">더보기</span>
                        <br>
        
                        </div>
                        `
                    );

                    if (data.category == "투표") {
                        var cnt = 0;
                        data.options.forEach((option) => {
                            $('#choices-list-' + doc.id).append(`<div class="post-vote" style="display:block;width: 100%;"><div class="vote-choice-item" style="padding-top: 15px;" data-index="${cnt}">
                                    <div class="inner" style="margin-bottom: -5px;">
                                    <h3>${option.title}</h3>
                                    </div>
                                </div></div>`);
                            cnt++;
                        });
                        if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                            $('.vote-choice-item').each(function () {
                                $(this).addClass("dark");
                            });
                        }
                    }

                    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                        const viewer = new toastui.Editor.factory({
                            el: document.querySelector('#viewer-' + doc.id),
                            viewer: true,
                            initialValue: data.content.replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, '$1').replace('?vote?', '투표를 확인하려면 클릭하세요.').substring(0, 100),
                            theme: 'dark'
                        });
                        $('.post-item').addClass("dark");
                    } else {
                        const viewer = new toastui.Editor.factory({
                            el: document.querySelector('#viewer-' + doc.id),
                            viewer: true,
                            initialValue: data.content.replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, '$1').replace('?vote?', '투표를 확인하려면 클릭하세요.').substring(0, 100),
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
function loadMore(category) {
    if (lastVisible) {
        if (category == 'all') {
            var nextVisible = db.collection('board').orderBy("createdAt").limitToLast(4).endBefore(lastVisible);
        } else {
            var nextVisible = db.collection('board').where('category', '==', category).orderBy("createdAt").limitToLast(4).endBefore(lastVisible);
        }
        nextVisible.get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    var data = doc.data();
                    lastVisible = querySnapshot.docs[3 - (querySnapshot.docs.length - 1)];
                    db.collection('users').doc(data.userId).get().then((doc_user) => {
                        var user = doc_user.data();
                        $('.post-listview').prepend(
                            `
                            <div class="post-item" onclick="openPost('`+ 'board.html?id=' + doc.id + `', this);" data-createdAt="` + data.createdAt.toDate().getTime() + `">
                            <div class="post-header">
                            <img src="assets/icons/profileImg/letter`+ ((user.profileImg) ? user.profileImg + 1 : 1) + `.png" class="profile-img" />
                                <span id="uname">`+ ((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname || '(어디론가 사라진 사용자)')) + `<br>
                                    <span style="opacity:0.7">`+ timeForToday(data.createdAt.toDate()) + `</span>
                                </span>
            
                            </div>
            
                            <h3 id="post-title">`+ data.title + `</h3>
            
                            <div class="post-preview" id="viewer-`+ doc.id + `">
                            </div>
                            ${(data.image) ? `<img src="` + data.image[0] + `" class="post-image" />` : ''}
                            <span style="color:#5272ff;font-size:15px;margin-top:10px;">더보기</span>
                            <br>
            
                            </div>
                            `
                        );


                        if (data.category == "투표") {
                            var cnt = 0;
                            data.options.forEach((option) => {
                                $('#choices-list-' + doc.id).append(`<div class="post-vote" style="display:block;width: 100%;"><div class="vote-choice-item" style="padding-top: 15px;" data-index="${cnt}">
                                    <div class="inner" style="margin-bottom: -5px;">
                                    <h3>${option.title}</h3>
                                    </div>
                                </div></div>`);
                                cnt++;
                            });
                            if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                                $('.vote-choice-item').each(function () {
                                    $(this).addClass("dark");
                                });
                            }
                        }

                        if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                            const viewer = new toastui.Editor.factory({
                                el: document.querySelector('#viewer-' + doc.id),
                                viewer: true,
                                initialValue: data.content.replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, '$1').replace('?vote?', '투표를 확인하려면 클릭하세요.').substring(0, 100),
                                theme: 'dark'
                            });
                            $('.post-item').addClass("dark");
                        } else {
                            const viewer = new toastui.Editor.factory({
                                el: document.querySelector('#viewer-' + doc.id),
                                viewer: true,
                                initialValue: data.content.replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, '$1').replace('?vote?', '투표를 확인하려면 클릭하세요.').substring(0, 100),
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
        $('.bottom_postList').html('마지막 글입니다.')
    }

}


// 무한 스크로 : 최하단 스크롤 감지
const Element = document.querySelector('.bottom_postList')
const options = {}
// observer: IntersectionObserver instance
const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && $('.post-listview').html().length > 5) {
            loadMore(currentCategory || 'all');
        }
    })
}, options)

io.observe(Element)

function openPost(url, target) {
    //login check
    if (firebase.auth().currentUser) {
        if (isApp()) {
            location.href = url;
        } else {
            window.open(url, '_blank');
        }
    } else { //로그인 안됨
        toast('게시물을 보려면 먼저 로그인 해주세요');
    }

}
//



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
            return `${Math.floor(betweenTimeDay / 30)}달 전`;
        } else {
            return `${betweenTimeDay}일 전`;
        }

    }

    return `${Math.floor(betweenTimeDay / 365)}년 전`;
}


//모바일 키보드 높이 대응
var originalSize = jQuery(window).width() + jQuery(window).height();

// resize #sheet-modal on resize window
$(window).resize(function () {
    if ($('#write-post-popup').is(':visible')) {
        if (jQuery(window).width() + jQuery(window).height() != originalSize) { //모바일에서 키보드 열렸을 때
            $('.write-popup-footer').hide();
        } else {
            $('.write-popup-footer').show();
        }
    }

});

$(document).on('focusout', 'input', function () { //키보드 닫힐 때
    $('.write-popup-footer').show()
});


// 닉네임 중복 체크 후 등록
function checkNicknameDuplicate(nickname) {
    db.collection('users').where('nickname', '==', nickname).get()
        .then(snapshot => {
            if (snapshot.size == 0) {
                closeModal();

                var data = {
                    nickname: nickname,
                }

                db.collection('users').doc(firebase.auth().currentUser.uid).update(data).then((result2) => {
                    $('#community .community-member-header').show();
                    $('#header-username').text(nickname);
                }).catch((err) => {
                    toast(err)
                    console.log(err);
                })
            } else if ($('#header-username').text() == nickname) { //변경 사항 없으면 닫기
                closeModal();
            } else {
                toast('이미 사용중인 닉네임입니다.')
            }
        })
        .catch(err => {
            console.log('Error getting documents', err);
            toast(err)
        });
}


//커뮤니티 카테고리 탭
function changeCommunityCategory(category, btn) {
    currentCategory = category;
    $('.community-tab').removeClass('active');
    $(btn).addClass('active');
    loadPostList(category);
}

function addChoice() {
    $('#vote-choice-list').append(`
    <input id="vote-choice" type="text" placeholder="항목 내용을 입력해주세요" style="font-size:16px;" required>
    `);
    $('.sheet-modal').css('height', $('#vote').height() + 130 + 'px');
    $('#vote-choice-list').animate({
        scrollTop: $('#vote-choice-list')[0].scrollHeight
    }, 0);
}

function postVote(target) {
    var options = [];
    var cnt = 0;
    if ($('#vote-title').val().length >= 2) {
        $(target).text('게시중...');
        $(target).attr('disabled', true);
        $('#vote-choice-list').find('input').each(function () {
            if ($(this).val().length >= 1) {
                options[cnt] = {
                    title: $(this).val(),
                    count: 0
                }
                cnt++;
            }
        });

        var uid = firebase.auth().currentUser.uid;
        var timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        var data = {
            title: $('#vote-title').val(),
            options: options,
            userId: uid,
            category: '투표',
            createdAt: timestamp,
            participants: '',
            content: '?vote?',
        }

        db.collection('board').add(data).then((result) => {
            closeModal();
            $(target).text('게시');
            $(target).attr('disabled', false);
            openPost('board.html?id=' + result._key.path.segments[1]);
        }).catch((err) => {
            toast(err);
            closeModal();
        });
    } else {
        toast('투표 제목을 입력해주세요.')
    }
}

//파일 첨부
var imgUpload = document.getElementById('upload-img')
    , imgPreview = document.getElementById('img-preview')
    , imgUploadForm = document.getElementById('form-upload')
    , totalFiles
    , previewTitle
    , previewTitleText
    , img;

var currentAttachedImages = [];
imgUpload.addEventListener('change', previewImgs, true);

function previewImgs(event) {
    totalFiles = imgUpload.files.length;

    if (!!totalFiles) {
        imgPreview.classList.remove('img-thumbs-hidden');
    }

    if (totalFiles > 3) {
        toast('사진은 최대 3개까지만 추가할 수 있어요.')
    } else {
        for (var i = 0; i < totalFiles; i++) {
            wrapper = document.createElement('div');
            wrapper.classList.add('wrapper-thumb');
            removeBtn = document.createElement("span");
            nodeRemove = document.createTextNode('x');
            removeBtn.classList.add('remove-btn');
            removeBtn.appendChild(nodeRemove);
            img = document.createElement('img');
            img.src = URL.createObjectURL(event.target.files[i]);
            img.classList.add('img-preview-thumb');
            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            $(wrapper).data('file', event.target.files[i]);
            imgPreview.appendChild(wrapper);

            var compressedFile = event.target.files[i];
            new Compressor(event.target.files[i], {
                quality: 0.5,
                convertSize: 5000,
                success(result) {
                    currentAttachedImages.push(result);
                },
                error(err) {
                    console.log(err.message);
                },
            });
        }
    }
}

$('.img-thumbs').on('click', '.remove-btn', function () {
    var index = currentAttachedImages.indexOf($(this).parent().data('file'));
    currentAttachedImages.splice(index, 1);
    console.log($(this).parent().data('file'), index, currentAttachedImages);
    $(this).parent().remove();
});


$('#logout-btn').on('click', function () {
    confirmLogout();
});

$('#search-btn').on('click', function () {
    window.open('search.html', '_blank');
});

async function confirmLogout() {
    const confirm = await ui.confirm('정말 로그아웃 하시겠습니까?');
    if (confirm) {
        firebase.auth().signOut().then(function () {
            closeModal();
            toast('로그아웃 되었습니다.');
            if (isApp()) {
                Android.logoutAndroidApp();
            }
        });
    }
}




function getRandomNickname() {
    const words = {
        "adjective": [
            "귀여운",
            "익명의",
            "용감한",
            "튼튼한",
            "상냥한",
            "마당발",
            "멋쟁이",
            "씩씩한",
            "키다리",
            "웃는",
            "세심한",
            "대범한",
            "똑똑한"
        ],
        "noun": [
            "체리",
            "자두",
            "딸기",
            "오렌지",
            "사과",
            "키위",
            "메론",
            "포도",
            "버찌",
            "야자수",
            "복숭아",
            "레몬",
            "수박",
            "망고",
            "홍시",
            "머루",
            "자몽",
            "살구",
            "리치",
            "참다래",
            "모과",
            "청포도",
            "유자",
            "산딸기",
            "매실",
            "코코넛",
            "바나나",
            "석류",
            "대추",
            "단감",
            "망고스틴",
            "산딸기",
            "아보카도",
            "구아바",
            "무화과",
            "파파야",
            "블루베리",
            "파인애플",
            "한라봉",
            "블림빙",
            "용과",
            "오미자",
            "꿀수박",
            "왕체리",
            "감자",
            "고구마",
            "깻잎",
            "당근",
            "도라지",
            "대파",
            "마늘",
            "토마토",
            "미나리",
            "버섯",
            "배추",
            "부추",
            "케일",
            "브로콜리",
            "생강",
            "시금치",
            "연근",
            "우엉",
            "양파",
            "양배추",
            "호박",
            "깻잎",
            "옥수수",
            "청경채",
            "배추",
            "시금치",
            "부추",
            "가지",
            "실파",
            "대파",
            "미나리",
            "애호박",
            "단호박",
            "오이",
            "당근",
            "감자",
            "고구마",
            "버섯",
            "양송이",
            "단무지",
            "피클",
            "무청",
            "상추",
            "양배추",
            "양상추",
            "바질",
            "마늘",
            "생강",
            "순무",
            "브로콜리",
            "인삼",
            "쑥갓",
            "피망",
            "피자",
            "햄버거",
            "떡볶이",
            "토스트",
            "개발자",
            "고니",
            "공작",
            "거위",
            "기러기",
            "까치",
            "까마귀",
            "두루미",
            "독수리",
            "백조",
            "비둘기",
            "부엉이",
            "오리",
            "앵무새",
            "제비",
            "참새",
            "칠면조",
            "타조",
            "펭귄",
            "개구리",
            "재규어",
            "족제비",
            "치타",
            "청설모",
            "친칠라",
            "침팬지",
            "캥거루",
            "코알라",
            "코요테",
            "코뿔소",
            "카피바라",
            "토끼",
            "판다",
            "표범",
            "퓨마",
            "하마",
            "호랑이",
            "하이에나",
            "박쥐",
            "북극곰",
            "북극여우",
            "바다사자",
            "바다표범",
            "사슴",
            "사자",
            "수달",
            "순록",
            "스컹크",
            "스라소니",
            "양",
            "여우",
            "염소",
            "영양",
            "야크",
            "원숭이",
            "알파카",
            "오소리",
            "얼룩말",
            "바둑이",
            "낙타",
            "노루",
            "노새",
            "늑대",
            "너구리",
            "나무늘보",
            "담비",
            "밤비",
            "듀공",
            "돌고래",
            "다람쥐",
            "두더지",
            "당나귀",
            "라마",
            "래서판다",
            "물개",
            "물범",
            "밍크",
            "도라에몽",
            "미어캣",
            "강아지",
            "곰돌이",
            "가젤",
            "고래",
            "기린",
            "고릴라",
            "고라니",
            "고양이",
            "고슴도치",
            "기니피그",
            "개미핥기",
            "크롱",
            "퉁퉁이",
            "피카츄",
            "파이리",
            "꼬부기",
            "피죤투",
            "또가스",
            "디지몬",
            "마리오",
            "비욘세",
            "참치",
            "연어",
            "초밥",
            "매운탕",
            "쭈꾸미",
            "돌고래",
            "백구",
            "누렁이",
            "흰둥이",
            "된장찌개",
            "김치찌개",
            "루피",
            "파스타",
            "비타민",
            "코카콜라",
            "자일리톨",
            "치즈피자",
            "참치김밥",
            "새우깡",
            "고래밥",
            "치킨버거",
            "닭다리",
            "닭날개",
            "숯불갈비",
            "레몬사탕",
            "뽀로로",
            "치즈",
            "닭갈비",
            "마카롱",
            "도너츠",
            "누룽지",
            "모짜렐라",
            "커피",
            "야옹이",
            "팝스타",
            "파랑새",
            "마그네슘",
            "서포터",
            "만수르",
            "재벌",
            "갑부",
            "후원자"
        ]
    };
    var adjective = words.adjective[Math.floor(Math.random() * words.adjective.length)];
    var noun = words.noun[Math.floor(Math.random() * words.noun.length)];
    var result = adjective + noun;
    $('#account-username').val(result);
    $('#login-username').val(result);
}