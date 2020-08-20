async function getQuality(video_id) {
    console.log("quality");
    link = `https://cors-anywhere.herokuapp.com/https://www.cda.pl/video/${video_id}`;
    response = await fetch(link, {
        "mode": "cors"
    });
    html = await response.text();
    const regex = /\?wersja=(\d+)p/g;
    let matches = [...html.matchAll(regex)];
    q = 0;
    for (match of matches) {
        q = Math.max(q, match[1]);
    }
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

function popup(id, dir, q, sub=[]) {
    // console.log("LOAD " + id)
    if (document.getElementById("vid") == null) {
        document.getElementsByTagName("body")[0].innerHTML += `<div id="vid" class="window" onclick="document.getElementById('vid').remove()"></div>`
    }
    if (dir !== null) {
        document.getElementById("vid").innerHTML = `
    <img src="load.gif"></img>`;
    }
    getVideo(id, q).then(function (link) {
        sub_html = "";
        def = 'default';
        for (i in sub) {
            sub_html += `<track label="${sub[i]}" kind="subtitles" srclang="${sub[i]}" src="${dir}${sub[i]}" ${def}>`
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
}
