package main

import (
    "fmt"
    "io/ioutil"
	"log"
	"os"
	"encoding/json"
	"strconv"
	"strings"
)

type Cfg struct {
    Id   string `json:"id"`
    Sub  []string `json:"sub"`
    Q    int    `json:"q"`
}

func main() {
    files, err := ioutil.ReadDir("film")
    if err != nil {
        log.Fatal(err)
    }

	fmt.Println(`<meta charset="UTF-8">
<html>
<head>
	<link rel="stylesheet" type="text/css" href="style.css">
	<script type="text/javascript" src="convert.js"></script>
</head>
<body>`);
    for _, f := range files {
		if (f.IsDir()) {
			jsonF, err := os.Open("film/" + f.Name() + "/cfg")
			if err != nil {
				log.Fatal(err)
			}
			byteValue, _ := ioutil.ReadAll(jsonF)
			var cfg Cfg
			json.Unmarshal(byteValue, &cfg)
			files, err := ioutil.ReadDir("film/" + f.Name() + "/")
			subs := ""
			if err != nil {
				log.Fatal(err)
			}
			for _, ff := range files {
				if (strings.HasSuffix(ff.Name(), ".vtt")) {
					if (subs == "") {
						subs = "'"+ff.Name()+"'"
					} else {
						subs += ", " + "'"+ff.Name()+"'"
					}
				}
			}
			fmt.Println(
`	<img src="film/`+f.Name()+`/poster.jpg" onclick="popup('`+cfg.Id+`', 'film/`+f.Name()+`/', `+strconv.Itoa(cfg.Q)+`, [`+subs+`])">`)
		}
    }
	fmt.Println(`
</body>
</html>`);
}