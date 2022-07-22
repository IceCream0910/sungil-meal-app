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

//로그인
const auth = firebase.auth();
var db = firebase.firestore();

//confirm
const ui = {
    confirm: async (message) => createConfirm(message)
}

const createConfirm = (message) => {
    return new Promise((complete, failed) => {
        $('#confirmMessage').text(message)

        $('#confirmYes').off('click');
        $('#confirmNo').off('click');

        $('#confirmYes').on('click', () => { $('.confirm').hide(); complete(true); });
        $('#confirmNo').on('click', () => { $('.confirm').hide(); complete(false); });

        $('.confirm').show();
    });
}
//


// url 에서 parameter 추출
function getParam(sname) {
    var params = location.search.substr(location.search.indexOf("?") + 1);
    var sval = "";
    params = params.split("&");
    for (var i = 0; i < params.length; i++) {
        temp = params[i].split("=");
        if ([temp[0]] == sname) { sval = temp[1]; }
    }
    return sval;
}

//로그인 여부 확인
firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
        $('#comment-input').prop('disabled', true);
        $('#comment-edit-input').prop('disabled', true);
    }
});

//글 가져오기
var articleRef = db.collection('board').doc(getParam('id')).get();
var content;
var viewer;
var authorId;
articleRef.then(function (doc) {
    if (doc.data()) {
        if (firebase.auth().currentUser.uid == doc.data().userId) {
            $('#postpage-toolbar').show();
        }
        authorId = doc.data().userId;
        db.collection('users').doc(doc.data().userId).get().then((doc_user) => {
            var user = doc_user.data();
            $('#uname').html(((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname)));
            $('#createdAt').html(timeForToday(doc.data().createdAt.toDate()));
            $('#post-title').html(doc.data().title);
            content = doc.data().content;
            viewer = new toastui.Editor.factory({
                el: document.querySelector('#viewer'),
                viewer: true,
                initialValue: doc.data().content,
            });
            //게시글 삭제 이벤트 등록
            $('#delete-btn').click(function () {
                confirmDeletePost(doc.data());
            });
            //

        });


    } else {
        toast('존재하지 않는 글입니다.');
        window.close();
    }
});

async function confirmDeletePost(data) {
    const confirm = await ui.confirm('게시물을 정말 삭제하시겠습니까?');
    if (confirm) {
        if (firebase.auth().currentUser.uid == data.userId) {
            toast('삭제되었습니다.')
            db.collection("board").doc(getParam('id')).delete().then(() => {
                window.close();
            }).catch((error) => {
                console.error("Error removing file: ", error);
            });
        } else {
            toast('권한이 없습니다');
        }
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


//댓글
db.collection("board").doc(getParam('id')).collection('comments').orderBy("createdAt")
    .onSnapshot((querySnapshot) => {
        var commentCount = querySnapshot.size;
        if (commentCount != 0) {
            $('#comment-list').html('');
            $('#comment-cnt').html('댓글 ' + commentCount + '개');
            querySnapshot.forEach((doc) => {
                var data = doc.data();
                db.collection('users').doc(data.userId).get().then((doc_user) => {
                    var user = doc_user.data();
                    if (firebase.auth().currentUser.uid == data.userId) { //댓글 작성자이면
                        $('#comment-list').append(`
                        <div class="comment-item"  data-createdt="`+ data.createdAt.toDate().getTime() + `">
                         <div class="comment-item-card">
                        <span class="comment-item-name">`+ ((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname)) + `</span>
                        <p class="comment-item-text">`+ data.content + `</p>
                        </div>
                        <div class="comment-item-footer">
                        <p class="comment-item-time">`+ timeForToday(data.createdAt.toDate()) + `</p>
                        <a href="javascript:openEditComment('`+ doc.id + `', '` + data.content + `', '` + data.userId + `');">
                            <ion-icon name="create-outline"></ion-icon>
                        </a>
                        <a href="javascript:deleteComment('`+ doc.id + `', '` + data.userId + `');">
                            <ion-icon name="trash-outline"></ion-icon>
                        </a>
                       </div>
                        </div>
                      `);
                    } else {
                        $('#comment-list').append(`
                        <div class="comment-item" data-createdt="`+ data.createdAt.toDate().getTime() + `">
                         <div class="comment-item-card">
                        <span class="comment-item-name">`+ ((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname)) + `</span>
                        <p class="comment-item-text">`+ data.content + `</p>
                        </div>
                        <div class="comment-item-footer">
                        <p class="comment-item-time">`+ timeForToday(data.createdAt.toDate()) + `</p>
                       </div>
                        </div>
                      `);
                    }
                    //다크테마 적용
                    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                        $('.comment-item').addClass("dark");
                        $('.comment-item-card').addClass("dark");
                    }
                });
            });

        } else { //댓글 0개
            $('#comment-list').html(`<div id="no-comment">
            <ion-icon name="chatbubble-ellipses-outline" style="font-size:50px;"></ion-icon>
            <p>아직 댓글이 없어요.<br>첫 댓글을 남겨볼까요?</p>
        </div>`)

        }
        $('.comment-item').sort(function (a, b) {
            return $(a).data('createdat') - $(b).data('createdat');
        }
        ).prependTo('.comment-list');
    });



function submit_comment() {
    var content = $('#comment-input').val();

    if (!content) {
        toast('댓글을 입력해주세요.');
    } else {
        $('#comment-input').val('');

        var timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        db.collection('board').doc(getParam('id')).collection('comments').add({
            userId: firebase.auth().currentUser.uid,
            content: content,
            createdAt: timestamp,
        })
        
        $('html, body').animate({
            scrollTop: $("#comment-cnt").offset().top
        }, 500);

        //푸시 알림 전송
        db.collection('users').doc(authorId).get().then((doc_user) => {
            var user = doc_user.data();
            if (user.fcmToken) { //token 존재
                $.ajax({
                    type: "GET",
                    url: `https://sungil-school-api.vercel.app/fcm?key=9pcd01YwxIIO3ZVZWFLN&title=내가 쓴 글에 댓글이 달렸습니다.&desc=${content}&token=${user.fcmToken}`,
                    success: function (result) {
                        console.log(result);
                    }
                });
            }
        });
        
    }


}


//댓글 삭제
function deleteComment(comment_id, userId) {
    confirmDeleteComment(comment_id, userId);
}

async function confirmDeleteComment(comment_id, userId) {
    const confirm = await ui.confirm('댓글을 정말 삭제하시겠습니까?');
    if (confirm) {
        if (firebase.auth().currentUser.uid == userId) {
            toast('댓글이 삭제되었습니다.')
            db.collection("board").doc(getParam('id')).collection('comments').doc(comment_id).delete().then(() => {

            }).catch((error) => {
                console.error("Error removing file: ", error);
            });
        } else {
            toast('권한이 없습니다')
        }
    }
}

//댓글 수정
var selectedCommentId;
var selectedCommentUserId;
function openEditComment(comment_id, comment_content, userId) {
    selectedCommentId = comment_id;
    selectedCommentUserId = userId;
    $('#comment-edit-input').val(comment_content);
    $('#comment-editor').show();
}

function editComment() {
    var content = $('#comment-edit-input').val();

    if (!content) {
        toast('댓글을 입력해주세요.');
    } else {
        if (firebase.auth().currentUser.uid == selectedCommentUserId) {
            db.collection('board').doc(getParam('id')).collection('comments').doc(selectedCommentId).update({
                content: content,
            })
            $('#comment-editor').hide();
        } else {
            toast('권한이 없습니다.')
        }

    }
}

var editor;
function openEditPost() {
    $('.sheet-modal').css('height', '30%');
    $('.content-wrap').hide();
    $('#writePost').show();
    $('#exam').hide();
    $('#assign-add-save-btn').hide();
    $('#assign-edit-save-btn').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    $('#post-title-edit').val($('#post-title').text());
    editor = new toastui.Editor.factory({
        el: document.querySelector('#editor'),
        viewer: false,
        initialValue: content,
        initialEditType: 'wysiwyg',
        height: '40vh'
    });
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#writePost').height() + 150 + 'px');
    }, 100);
}

//수정
function post() {
    var title = $('#post-title-edit').val();
    var content = editor.getMarkdown();
    var uid = firebase.auth().currentUser.uid;
    if (content) {
        $(this).text('업로드 중...');
        var data = {
            title: title,
            userId: uid,
            content: content,
            category: '자유',
        }
        db.collection('board').doc(getParam('id')).update(data).then((result) => {
            location.reload();
        }).catch((err) => {
            console.log(err);
        });
    } else {
        toast('게시글 내용을 작성해주세요.')
    }
}



//bottom sheet

///custom modal sheet///
$('.c-modal').each(function () {

    var mc = new Hammer(this);

    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });

    mc.on("swipedown", function (ev) {
        if (!$('#loginForm').is(':visible')) {
            console.log(ev)
            $('body').css('overflow', 'auto');
            $('.modal-in').css('bottom', '-1850px');
            setTimeout(function () {
                $('.modal-in').css('display', 'none');
            }, 100);

            $('.sheet-backdrop').removeClass('backdrop-in');
        }
    });

});

$('.page-content').each(function () {
    if (!$('#loginForm').is(':visible')) {
        var mc = new Hammer(this);

        mc.get('swipe').set({
            direction: Hammer.DIRECTION_ALL
        });

        mc.on("swipedown", function (ev) {
            if (!$('#loginForm').is(':visible')) {
                console.log(ev)
                $('body').css('overflow', 'auto');
                $('.modal-in').css('bottom', '-1850px');
                setTimeout(function () {
                    $('.modal-in').css('display', 'none');
                }, 100);

                $('.sheet-backdrop').removeClass('backdrop-in');
            }
        });
    }
});


$('.sheet-backdrop').on('click', function () {
    $('body').css('overflow', 'auto');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('display', 'none');
    }, 100);
    $('.sheet-backdrop').removeClass('backdrop-in');
});



//theme
const storedTheme = localStorage.getItem("darkTheme") || "system";

const mql = window.matchMedia("(prefers-color-scheme: dark)");


mql.addEventListener("change", () => {
    if (storedTheme == "system" || !storedTheme) {
        if (mql.matches) {
            onDark();
        } else {
            offDark();
        }
    }
});


if (storedTheme !== null) {
    if (storedTheme === "true") {
        onDark();
    } else if (storedTheme === "system") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            onDark();
        }
    }
}



function onDark() {
    $('html').addClass("dark");
    $('body').addClass("dark");
    $('.sheet-modal').addClass("dark");
    $('.swipe-handler').addClass("dark");
    $('.skeleton').addClass("dark");
    $('.comment-input-wrap input').each(function () {
        $(this).addClass("dark");
    });
    $('.custom-btn').addClass("dark");
    viewer = new toastui.Editor.factory({
        el: document.querySelector('#viewer'),
        viewer: true,
        theme: 'dark',
    });

    $('.postpage-header').addClass("dark");
    $('.comment-input-wrap').addClass("dark");
    $('#main-confirm').addClass("dark");

}

function offDark() {
    $('html').removeClass("dark");
    $('body').removeClass("dark");
    viewer = new toastui.Editor.factory({
        el: document.querySelector('#viewer'),
        viewer: true,
        theme: 'default',
    });
    $('#main-confirm').removeClass("dark");
}
//toast
function toast(msg) {
    Toastify({
        text: msg,
        duration: 2200,
        newWindow: true,
        close: false,
        gravity: "bottom", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            boxShadow: "none"
        }
    }).showToast();
}
