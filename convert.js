var loader = {};
async function getVideo(video_id) {
    link = `https://cors-anywhere.herokuapp.com/https://www.cda.pl/video/${video_id}?wersja=1080p`;
    response = await fetch(link, {
        "mode": "cors"
    });

    html = await response.text();
    console.log(html);
    const regex = /\"file\":\"([^\"]*)\"/;
    link = html.match(regex)[1];
    console.log(link)
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
loader.load = function load(id) {
    return function () {
        console.log("LOAD " + id)
        document.getElementById("vid").innerHTML = `
    <img src="poster.jpg"></img>`;
        getVideo(id).then(function (link) {
            document.getElementById("vid").innerHTML = `
    <video id="video" width="800px" controls preload="metadata">
        <source id="video_src" src="${link}" type="video/mp4">
        <track label="English" kind="subtitles" srclang="en" src="en.vtt" default>
    </video>`
        })
    }
}