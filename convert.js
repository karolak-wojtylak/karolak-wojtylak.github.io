async function getQuality(video_id) {
    console.log("quality");
    link = `https://cors-anywhere.herokuapp.com/https://www.cda.pl/video/${video_id}`;

    response = await fetch(link, {
        "mode": "cors"
    });
    html = await response.text();
    var regex = /\?wersja=(\d+)p/g;
    var myArray;
    q = 0;
    while ((myArray = regex.exec(html)) !== null) {
        document.getElementById("vid").innerHTML += `
    <div class="close_btn" onclick="document.getElementById('vid').remove()">
    ${JSON.stringify(myArray)} </div>`;
    console.log(JSON.stringify(myArray));
        q = Math.max(q, myArray[1]);
        console.log(q);
    }
    //new String(html).matchAll(regex)
    // let matches = [...html.matchAll(regex)];
    // let matches = Array.from(html.matchAll(regex), m => m[0]);
    // document.getElementById("vid").innerHTML = `<div class="close_btn">Getting quality! (regex!)</div>`;
    // q = 0;
    // for (match of matches) {
    //     q = Math.max(q, match[1]);
    // }
    return q;
}

async function getVideo(video_id, quality=null) {
    if (quality == null) {
        quality = await getQuality(video_id);
    }
    link = `https://cors-anywhere.herokuapp.com/https://www.cda.pl/video/${video_id}?wersja=${quality}p`;
    if (quality == 0) {
        link = `https://cors-anywhere.herokuapp.com/https://www.cda.pl/video/${video_id}`;
    }
    response = await fetch(link, {
        "mode": "cors"
    });

    html = await response.text();
    // console.log(html);
    const regex = /\"file\":\"([^\"]*)\"/;
    link = html.match(regex)[1];
    // console.log(link)
    var removal = ["_XDDD", "_CDA", "_ADC", "_CXD", "_QWE", "_Q5"]
    link = unescape(link);
    for (x in removal) {
        link = link.replace(removal[x], '');
    }
    result = ''
    for (const cc of link) {
        c = cc.charCodeAt(0)
        result += String.fromCharCode((c >= 33 && c <= 126) ? (33 + ((c + 14) % 94)) : c);
    } 
    result = result.replace(".cda.mp4", "");
    result = result.replace(".2cda.pl", ".cda.pl");
    result = result.replace(".3cda.pl", ".cda.pl");

    result = `https://${result}.mp4`;

    return result;
}

function popup(id, dir=null, q=null, sub=[]) {
    // console.log("LOAD " + id)
    if (document.getElementById("vid") == null) {
        document.getElementsByTagName("body")[0].innerHTML += `<div id="vid" class="window" onclick="document.getElementById('vid').remove()"></div>`
    }
    document.getElementById("vid").innerHTML = `
<img src="/loader.gif"></img>`;
    getVideo(id, q).then(function (link) {
        sub_html = "";
        def = 'default';
        for (i in sub) {
            sub_html += `<track label="${sub[i]}" kind="subtitles" srclang="${sub[i]}" src="${sub[i]}" ${def}>`
            def = '';
        }
        document.getElementById("vid").innerHTML = `
<div class="content" onclick="document.getElementById('vid').remove()">
    <video id="video"class="video" controls preload="metadata">
        <source id="video_src" src="${link}" type="video/mp4">
        ${sub_html}
    </video>
</div>`;
    document.getElementById("video").onloadeddata = document.getElementById("video").requestFullscreen();
    })
    return false;
}


function popup2(id) {
    // console.log("LOAD " + id)
    if (document.getElementById("vid") == null) {
        document.getElementsByTagName("body")[0].innerHTML += `<div id="vid" class="window" onclick="document.getElementById('vid').remove()"></div>`
    }
    document.getElementById("vid").innerHTML = `
    <img src="/loader.gif"></img><img src="/loader.gif"></img>`;
    getVideo(id, null).then(function (link) {
        sub_html = "";
        document.getElementById("vid").innerHTML = `
<div class="content" onclick="document.getElementById('vid').remove()">
    <video id="video"class="video" controls preload="metadata">
        <source id="video_src" src="${link}" type="video/mp4">
        ${sub_html}
    </video>
    ZAMKNIJ
</div>`;
    document.getElementById("video").onloadeddata = document.getElementById("video").requestFullscreen();
    })
    return false;
}


function load(id, dir=null, q=null, sub=[]) {
    // console.log("LOAD " + id)
    document.getElementsByTagName("body")[0].innerHTML = `<div id="vid" class="fullscreen">
<img src="/loader.gif"></img></div>`;
    getVideo(id, q).then(function (link) {
        sub_html = "";
        def = 'default';
        for (i in sub) {
            sub_html += `<track label="${sub[i]}" kind="subtitles" srclang="${sub[i]}" src="${sub[i]}" ${def}>`
            def = '';
        }
        document.getElementsByTagName("body")[0].innerHTML = `
        <div id="vid" class="fullscreen">
    <video id="video"class="video" controls preload="metadata">
        <source id="video_src" src="${link}" type="video/mp4">
        ${sub_html}
    </video></div>`;
    document.getElementById("video").onloadeddata = document.getElementById("video").requestFullscreen();
    })
    return false;
}


function popup_cda(id) {
    // console.log("LOAD " + id)
    if (document.getElementById("vid") == null) {
        document.getElementsByTagName("body")[0].innerHTML += `<div id="vid" class="window" onclick="document.getElementById('vid').remove()"></div>`
    }
        document.getElementById("vid").innerHTML = `
<div class="content" onclick="document.getElementById('vid').remove()">
<iframe src="https://ebd.cda.pl/620x395/${id}" width="620" height="395" style="border:none;" frameBorder="0" scrolling="no" allowfullscreen name="v2"></iframe>
    ZAMKNIJ
</div>`;
    return false;
}



function popup_ass(id) {
    // console.log("LOAD " + id)
    if (document.getElementById("vid") == null) {
        document.getElementsByTagName("body")[0].innerHTML += `<div id="vid" class="window"><div class="close_btn" onclick="document.getElementById('vid').remove()">
        ZAMKNIJ </div></div>`
    }
    document.getElementById("vid").innerHTML = `
    <img src="/loader.gif"></img><img src="/loader.gif"></img> <div class="close_btn" onclick="document.getElementById('vid').remove()">
    ZAMKNIJ </div>`;
    getVideo(id, null).then(function (link) {
        sub_html = "";
        document.getElementById("vid").innerHTML = `
<div class="content">
    <div>
    <video id="video" class="video video-js" controls preload="metadata">
        <source id="video_src" src="${link}" type="video/mp4">
        ${sub_html}
    </video></div>
    <div class="close_btn" onclick="document.getElementById('vid').remove()">
    ZAMKNIJ </div>
</div>`;
    // document.getElementById("video").onloadeddata = document.getElementById("video").requestFullscreen();
    var player = videojs('#video');
    player.ready(function () {
        // This would look more nice as a plugin but is's just as showcase of using with custom players
        var video = this.tech_.el_;
        window.SubtitlesOctopusOnLoad = function () {
            var options = {
                video: video,
                subUrl: '/001.ass',
                fonts: ['/fonts/arial.ttf'],
                //onReady: onReadyFunction,
                debug: false,
                workerUrl: '/js/subtitles-octopus-worker.js'
            };
            window.octopusInstance = new SubtitlesOctopus(options); // You can experiment in console
        };
        if (SubtitlesOctopus) {
            SubtitlesOctopusOnLoad();
        }
    });
    })
    return false;
}


function popup_ass2(id) {
    // console.log("LOAD " + id)
    if (document.getElementById("vid") == null) {
        document.getElementsByTagName("body")[0].innerHTML += `<div id="vid" class="window"><div class="close_btn" onclick="document.getElementById('vid').remove()">
        ZAMKNIJ </div></div>`
    }
    document.getElementById("vid").innerHTML = `
    <img src="/loader.gif"></img><img src="/loader.gif"></img> <div class="close_btn" onclick="document.getElementById('vid').remove()">
    ZAMKNIJ </div>`;
    getVideo(id, null).then(function (link) {
        sub_html = "";
        document.getElementById("vid").innerHTML = `
<div class="content">
    <div>
    <video id="video" class="video video-js" controls preload="metadata">
        <source id="video_src" src="${link}" type="video/mp4">
        ${sub_html}
    </video></div>
    <div class="close_btn" onclick="document.getElementById('vid').remove()">
    ZAMKNIJ </div>
</div>`;
    // document.getElementById("video").onloadeddata = document.getElementById("video").requestFullscreen();
    var player = videojs('#video');
    player.ready(function () {
        fetch('/001.ass')
            .then(res => res.text())
            .then((text) => {
                //document.getElementById("vid").innerHTML += `<div class="close_btn">${text}</div>`;
                const ass = new ASS(text, document.getElementById('video'));
            });
        });
    });
    return false;
}