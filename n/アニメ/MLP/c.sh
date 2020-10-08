for s in $(seq -f "%02g" 1 9)
do
    for e in $(seq -f "%02g" 1 26)
    do
        ffmpeg -i "MLP s${s}e${e}_en.srt" "MLP s${s}e${e}_en.ass" &
    done
done