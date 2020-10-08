for s in $(seq -f "%02g" 1 9)
do
    for e in $(seq -f "%02g" 1 26)
    do
        wget "https://yp1.yayponies.no/subtitles/subs/${s}x${e}.srt" -O "MLP s${s}e${e}_en.srt" &
    done
done