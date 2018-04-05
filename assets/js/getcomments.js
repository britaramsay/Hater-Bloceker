/*
    I'm going to try to make the requests with ajax, but it hasn't worked so far
    because the 'gapi.client' variable I used to make requests here is what knows the
    user is authenticated. Haven't figured out how to put that into an ajax request yet
*/

// Client ID from the Developer Console
var CLIENT_ID = '523678269215-iivh2hbarihnbbnnc86leh2nkl78ti6c.apps.googleusercontent.com';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest", "https://language.googleapis.com/$discovery/rest?version=v1"];

// Authorization scopes required by the API. 
var SCOPES = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/cloud-language';

var authorizeButton = document.getElementById('signup-btn');
var signoutButton = document.getElementById('signout-btn');
var dashboardButton = document.getElementById('dashboard-btn');

var deleteComments = 0;
var currVideo;
/*
 *  On load, called to load the auth2 library and API client library.
 */

$(document).ready(handleClientLoad);

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/*
*  Initializes the API client library and sets up sign-in state
*  listeners.
*/

function initClient() {
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        console.log(gapi.auth2.getAuthInstance().currentUser.get());
        
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        if($('body').is('.landing')) {
            authorizeButton.onclick = handleAuthClick;
            // signoutButton.onclick = handleSignoutClick;
            // window.location.href = "dashboard-feed-post.html";
        }
        else if ($('body').is('.dashboard-feed')) {
            getChannel();
        }
        else if ($('body').is('.dashboard-video')) {
            // authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
            // Get current video id from local storage
            currVideo = localStorage.getItem("currVideo");
            // Get current video, call with a greater width
            getVideo(currVideo, 380);
            // Empty comment list div
            $('.comment-list').empty();
            // Get comments on current video
            getComments(currVideo);
           
        }
    });
}
 // If delete comments is clicked
 $('#deleteBadComments').on('click', function (e) {  
    // Prevent page refresh
    e.preventDefault();
    // Set delete comments to true
    deleteComments = 1;
    // Call get comments to delete and show
    getComments(currVideo);

});
/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */

// This will show/hide login/logout buttons
// Login button isn't implemented with the apis yet
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        // authorizeButton.style.display = 'block';
        // signoutButton.style.display = 'block';
    } else {
        // authorizeButton.style.display = 'block';
        // signoutButton.style.display = 'none';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    console.log(gapi.auth2.getAuthInstance());
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function getChannel() {
    // Request channel information
    // Parameter 'mine' : true get the currently authenticated users channel
    var request = gapi.client.request({
        'method': 'GET',
        'path': '/youtube/v3/channels',
        'params': {'part': 'contentDetails', 'mine': 'true'}
    }).then(function(response) {

        var channel = response.result.items[0];
        // Save the id of their uploaded videos playlist
        var playlistId = channel.contentDetails.relatedPlaylists.uploads;
        // Call getPlaylist with the uploads playlist id
        getPlaylist(playlistId);
    });
}


function getPlaylist(playlistId){
    $.ajax({
        url: "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId="+playlistId+"&key=AIzaSyBqEJr9IauQFTzkj79rk0n0RMzDxY_VruE",
        dataType: "jsonp",
        success:
            function (response) { 
                console.log(response); 
                $('.comment-list').empty();
                // Save array of video responses
                var videoIds = response.items;
                console.log(videoIds);
                videoIds.forEach(video => {
                    // For each video in the playlist, save the videoId
                    var videoId = video.snippet.resourceId.videoId;
                    getVideo(videoId, videoIds.length);
                    // getComments(videoId);
                });
            }
    });
}

var numVideos = 0;
var numRows = 1;

// May not need this request
function getVideo(vidId, totVideos){
    $.ajax({
        url: "https://www.googleapis.com/youtube/v3/videos?part=contentDetails%2Cstatistics%2Csnippet%2Cplayer&id=" + vidId + "&key=AIzaSyBqEJr9IauQFTzkj79rk0n0RMzDxY_VruE",
        dataType: "jsonp",

        success: 
        function(response) {
            var videoThumbnail = response.items[0].snippet.thumbnails.high.url;
            numVideos++;
            
            if ($('body').is('.dashboard-feed')) {
                console.log('total: '+totVideos+":::?"+(3*(numRows-1)+numVideos));
                
                // if(numRows*numVideos == num)
                if(numVideos == 1) {
                
                    var newRow = $('<div>');
                        newRow.addClass('row')
                            .attr('id', 'row-'+numRows);
                    var newCol = $('<div>');
                        newCol.addClass('col-sm');
            
                    var newVideo = $('<a>');
                        newVideo.append('<span><img class="video" src=' + videoThumbnail + ' style="width:150px;box-shadow:0px 0px 0px black;"/><p style="color:black;">' + response.items[0].snippet.title + '</p></span>')
                            .append('<br><br>')
                            .addClass('video')       
                            .attr('data-vidId', response.items[0].id)
                            .attr('href', 'comment-dashboard.html');


                        newCol.append(newVideo);

                        $(newRow).append(newCol);

                        $(".videoColum1").append(newRow);

                }
                else if(numVideos > 1 && numVideos < 4) {
                    console.log(numVideos);
                    
                    var newCol = $('<div>');
                        newCol.addClass('col-sm');
            
                    var newVideo = $('<a>');
                        newVideo.append('<span><img class="video" src=' + videoThumbnail + ' style="width:150px;box-shadow:0px 0px 0px black;"/><p style="color:black;">' + response.items[0].snippet.title + '</p></span>')
                            .append('<br><br>')
                            .addClass('video')       
                            .attr('data-vidId', response.items[0].id)
                            .attr('href', 'comment-dashboard.html');

                    newCol.append(newVideo);

                    $('#row-' + numRows).append(newCol);

                    $(".videoColum1").append($('#row-' + numRows));

                    if(numVideos == 3) {
                        numRows++;
                        numVideos = 0;
                    }
                }
                if(totVideos == (3*(numRows-1)+numVideos)) {
                    var divsLeft = 3 - (totVideos%3);
                    for(var i = divsLeft; i > 0; i--) {
                        var newCol = $('<div>');
                            newCol.addClass('col');

                        $('#row-' + numRows).append(newCol);

                        $(".videoColum1").append($('#row-' + numRows));
                    }
                }
            }
            else if($('body').is('.dashboard-video')) {
                var newVideo = $('<a>');
                newVideo.append('<span><img class="video" src=' + videoThumbnail + ' style="width:80%;height:80%;box-shadow:0px 0px 0px black;"/><p style="color:black;">' + response.items[0].snippet.title + '</p></span>')
                    .append('<br><br>')
                    .addClass('video')       
                    .attr('data-vidId', response.items[0].id)
                    .attr('href', 'comment-dashboard.html');

            $('#video-space').prepend(newVideo);
            }
        }
    });
}

$(document).on('click', '.video', function() {

    if($(this).data('vidid') != undefined) {
        // Save video id clicked to get when page changes
        localStorage.setItem("currVideo",$(this).data('vidid'));
    }
})

// Get comments from the video specified in videoId
function getComments(vidId){
    $.ajax({                                  
        url: "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults="+30+"&videoId=" + vidId + "&key=AIzaSyBqEJr9IauQFTzkj79rk0n0RMzDxY_VruE",
        dataType: "jsonp",

        success: 
        function(response) {
            console.log(response);
            var commentIds = response.items;
            // Set number of comments
            $('#numComments').text(commentIds.length);
    
            commentIds.forEach(comment => {
                // Get individial comment for display or deletion
                getComment(comment.id);
            });
        }
    });
}

function getComment(commentId){

    $.ajax({                                  
        url: "https://www.googleapis.com/youtube/v3/comments?part=snippet&commentId=" + commentId + "&key=AIzaSyBqEJr9IauQFTzkj79rk0n0RMzDxY_VruE",
        dataType: "jsonp",

        success: 
        function(response) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': '/youtube/v3/comments',
                'params': {'id':commentId, 'part': 'snippet'},
                
            }).then(function(response) {
                console.log(response);
                // Comment info variables
                var userImg = response.result.items[0].snippet.authorProfileImageUrl;
                var author = response.result.items[0].snippet.authorDisplayName;
                var commentText = response.result.items[0].snippet.textDisplay; 
                // Current number of comments
                var numComments = $('#numComments').text();
                // If delete is true and comment is checked for delete
                if(deleteComments == 1 && $('[comment="'+commentId+'"]').prop('checked')) {
                    
                    // If the comment was displayed, remove it from view
                    if($('#' + commentId).length)
                        $('#' + commentId).remove();
                    // Delete the comment
                    setModerationStatus(commentId);
                    
                    // Update number of comments
                    $('#numComments').text(numComments - 1);
                }
                // If delete is not true or the comment is set to be deleted
                else {
                    // If comment is already displayed, remove it so it does not duplicate
                    var datePosted = moment(response.result.items[0].snippet.publishedAt).format('MMM Do YY, h:mm a');
        
                    if($('#' + commentId).length)
                        $('#' + commentId).remove();
        
                    var listItem = $("<li>");
                        listItem.addClass('media')
                                .attr('id', commentId);
        
                    var commenterImage = $('<div>');
                        commenterImage.addClass('media-left')
                                    .html('<a href=' +  response.result.items[0].snippet.authorChannelUrl + '><img src=' + userImg + ' alt=""></a>');
                    
                    var checkBox = $('<input>');
                        checkBox.addClass('check-box')
                            .attr('type', 'checkbox')
                            .html('<br><span class="checkmark"></span>')
                            .attr('comment', commentId);
        
                        commenterImage.append(checkBox);
                        listItem.append(commenterImage);
        
                    var mediaBody = $('<div>');
                        mediaBody.addClass('media-body')
                                .attr('text', commentText);
        
                    var mediaHeading = $('<div>');
                        mediaHeading.addClass('media-heading')
                                    .append('<a href=' + response.result.items[0].snippet.authorChannelUrl + ' class="text-semibold">' + author + '</a>')
                                    // Use library to get how long ago they posted it
                                    // Order comments by data send
                                    .append('<span class="timestamp"> '+datePosted+'</span>');
                                    
                        mediaBody.append(mediaHeading)
                                .append('<p class="comment-text">' + commentText + '</p>');
                    
                    var commentControls = $('<div>');
                        commentControls.addClass('comment-controls')
                                        .append(response.result.items[0].snippet.likeCount + ' ' + '<span class="glyphicon glyphicon-thumbs-up"></span>');
                        
                        mediaBody.append(commentControls);
        
                        listItem.append(mediaBody);
        
                    $('.comment-list').prepend(listItem);
                    // Call function to score this comments sentiment
                    initGapi(commentText, commentId);
        
                }
            
            });
        }
    });
}
// Sets the moderation status of a comment as rejected
function setModerationStatus(commentId) {
    var request = gapi.client.youtube.comments.setModerationStatus({
        'id' : commentId, 'moderationStatus':'rejected'
    });
    request.execute(function (response) {  
    });
}

var naturalLanguageKey = 'AIzaSyBqEJr9IauQFTzkj79rk0n0RMzDxY_VruE';

function initGapi(content, id) {
    gapi.client.setApiKey(naturalLanguageKey);
    gapi.client.load('language', 'v1', function () {  

    });
    gapi.client.language.documents.analyzeEntitySentiment({
        'document' : {
            type: 'PLAIN_TEXT',
            language: "EN",
            content: content
        },
        'encodingType' : "UTF8"
    }).then(function (r) {  
        var commentScore = JSON.stringify(r.result.entities[0].sentiment.score);
        console.log(content + " Score: " + commentScore);
        // If the current comment has a low sentiment score
        if(commentScore <= -0.6) {
            // Outline comment in red
            $(".media-body:contains(" + content + ")").css('border', '2px solid red');
            // Check this comments checkbox for delete
            $('[comment="'+id+'"]').prop('checked',true);
        }
    }) 
} 
