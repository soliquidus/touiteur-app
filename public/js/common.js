/**
 * Reply and post area management with modal behaviour
 */
$('#postTextarea , #replyTextarea').keyup((event) => {
    let textBox = $(event.target);
    let value = textBox.val().trim();

    let isModal = textBox.parents('.modal').length === 1;

    let submitButton = isModal ? $('#submitReplyButton') : $('#submitPostButton');

    if (submitButton.length === 0) return alert('no submit button found');

    if (value === '') {
        submitButton.prop('disabled', true);
        return;
    }
    submitButton.prop('disabled', false);
});

/**
 * Submit button for post and reply with modal behaviour
 */
$('#submitPostButton, #submitReplyButton').click(() => {
    let button = $(event.target);

    let isModal = button.parents('.modal').length === 1;
    let textBox = isModal ? $('#replyTextarea') : $('#postTextarea');

    let data = {
        content: textBox.val(),
    };

    if (isModal) {
        let id = button.data().id;
        if (id === null) return alert('Button id is not defined.');
        data.replyTo = id;
    }

    $.post('/api/posts', data, (postData) => {
        if (postData.replyTo) {
            location.reload();
        } else {
            let html = createPostHtml(postData);
            $('.postsContainer').prepend(html);
            textBox.val('');
            button.prop('disabled', true);
        }
    });
});

/**
 * Modal getting the correct id to continue process
 */
$('#replyModal').on('show.bs.modal', (event) => {
    let button = $(event.relatedTarget);
    let postId = getPostIdFromElement(button);

    $('#submitReplyButton').data('id', postId);

    $.get('/api/posts/' + postId, (results) => {
        outputPosts(results.postData, $('#originalPostContainer'));
    });
});

/**
 * Modal removal process
 */
$('#deleteModal').on('show.bs.modal', (event) => {
    let button = $(event.relatedTarget);
    let postId = getPostIdFromElement(button);
    $('#submitDeleteButton').data('id', postId);
});

/**
 * Delete button process
 */
$('#submitDeleteButton').click((e) => {
    let id = $(e.target).data('id');

    $.ajax({
        url: `/api/posts/${id}`,
        type: 'DELETE',
        success: (data, status, xhr) => {
            if (xhr.status !== 202) {
                alert('not delete yet');
            }
            location.reload();
        },
    });
});

function getPostIdFromElement(element) {
    let isRoot = element.hasClass('post');
    let rootElement = isRoot === true ? element : element.closest('.post');
    let postId = rootElement.data().id;
    if (postId === undefined) return alert('postId undefined');
    return postId;
}

/**
 * Post form behaviour
 * @param postData
 * @param largeFont
 * @returns {string|void}
 */
function createPostHtml(postData, largeFont = false) {
    if (postData == null) return alert('post object is null');
    let isRetweet = postData.retweetData !== undefined;
    let retweetedBy = isRetweet ? postData.postedBy.username : null;
    let retweetedTime = isRetweet ? timeDifference(new Date(), new Date(postData.retweetData.updatedAt)) : null;

    postData = isRetweet ? postData.retweetData : postData;
    let postedBy = postData.postedBy;
    if (!postedBy._id) {
        return console.log('User Object not populate');
    }
    let displayName = `${postedBy.firstName} ${postedBy.lastName}`;
    let dateStamp = postData.createdAt;
    let timestamp = timeDifference(new Date(), new Date(dateStamp));
    let likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? 'active' : '';
    let retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? 'active' : '';

    let largeFontClass = largeFont ? 'largeFont' : '';
    let retweetText = '';
    if (isRetweet) {
        retweetText = `<span>Retweet By  <a href='/profile/${retweetedBy}'>@${retweetedBy}</a> ${retweetedTime} </span>`;
    }

    let replyFlag = "";

    if (postData.replyTo && postData.replyTo._id) {
        if (!postData.replyTo._id) {
            return alert("Reply to is not populated");
        } else if (!postData.replyTo.postedBy._id) {
            return alert("Reply to is not populated id");
        }

        let replyToUsername = postData.replyTo.postedBy.username;

        replyFlag = `<div class="replyFlag">
      Replying to  <a href='/profile/${replyToUsername}'>${replyToUsername}</a> 
    </div>`;
    }

    let buttons = "";
    if (postData.postedBy._id === userLoggedIn._id) {
        buttons = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deleteModal">
                <i class='fas fa-times'></i>
              </button>`;
    }
    return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class="postActionContainer">
                  ${retweetText} 
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'  alt="">
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}'>${displayName}</a>
                            <span class="username">@${postedBy.username}</span>
                            <span class="date">${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle="modal" data-target="#replyModal">
                                    <i class="far fa-comment"></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class="fas fa-retweet"></i>
                                    <span>
                                    ${postData.retweetUsers.length || ""}
                                    </span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class="far fa-heart"></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

/**
 * Posts Time Stamp handling
 * @param current
 * @param previous
 * @returns {string}
 */
function timeDifference(current, previous) {
    let msPerMinute = 60 * 1000;
    let msPerHour = msPerMinute * 60;
    let msPerDay = msPerHour * 24;
    let msPerMonth = msPerDay * 30;
    let msPerYear = msPerDay * 365;

    let elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 30) return 'A l\'instant';
        return Math.round(elapsed / 1000) + ' secondes';
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes';
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' heures';
    } else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' jours';
    } else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' mois';
    } else {
        return Math.round(elapsed / msPerYear) + ' années';
    }
}

function outputPosts(results, container) {
    container.html("");

    if (!Array.isArray(results)) {
        results = [results];
    }

    results.forEach((result) => {
        let html = createPostHtml(result);
        container.append(html);
    });

    if (results.length === 0) {
        container.append("<span class='noResults'>NotThing to show.</span>");
    }
}

function outputPostsWithReplies(results, container) {
    container.html("");

    if (results.replyTo !== undefined && results.replyTo._id === undefined) {
        let html = createPostHtml(results.replyTo);
        container.append(html);
    }

    let mainPostHtml = createPostHtml(results.postData);
    container.append(mainPostHtml);

    results.replies.forEach((result) => {
        let html = createPostHtml(result, true);
        container.append(html);
    });
}
