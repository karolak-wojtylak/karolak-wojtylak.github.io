package main

import (
    "golang.org/x/net/html"
    "fmt"
	"io" 
    "net/http"
    "strings"
    "strconv"
    "os"
)

type Link struct {
    Id string
    Name string
}

func MakeLink(id string, name string) Link {
    link := new(Link)
    link.Id = id;
    link.Name = name;
    return *link;
}

type Folder struct {
    Name string
    Dir string
    Subdirs []string
    Links []Link
}

func MakeFolder(name string, dir string) Folder {
    folder := new(Folder)
    folder.Name = name;
    folder.Dir = dir;
    return *folder;
}

type State struct {
    Dir []string
    Stack []Folder
    Folders []Folder
}

// DownloadFile will download a url to a local file. It's efficient because it will
// write as it downloads and not load the whole file into memory.
func Get(url string) (io.Reader, error) {

	// Get the data
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
    }
    return resp.Body, err;
}

func getAttr(node *html.Node, attrName string) string {
    for _, attr := range node.Attr {
        if (attr.Key == attrName) {
            return attr.Val
        }
    }
    return "";
}

func hasClass(node *html.Node, class string) bool {
    classVal := getAttr(node, "class");
    if (classVal != "") {
        for _, cls := range strings.Split(classVal, " ") {
            if (cls == class) {
                return true;
            }
        }
    }
    return false;
}

func Crawl(client *http.Client, auth string, url string, page int, indent string, state *State) {
    // if (page > 20) { return; }
    Data := strings.NewReader("")
    req, err := http.NewRequest("GET", url+"/"+strconv.Itoa(page), Data);
    req.Header.Set("Cookie", auth)
    r, err := client.Do(req)
    if (err != nil) {
        fmt.Fprintln(os.Stderr, err);
        return;
    }
    doc, err := html.Parse(r.Body)
    if err != nil {
        fmt.Fprintln(os.Stderr, err);
        return;
    }

    if (len(state.Stack) == 0) {
        state.Stack = append(state.Stack, MakeFolder("Folder główny", "/"));
    }

    var GetFolderName func(*html.Node) string
    GetFolderName = func(n *html.Node) string {
        if n.Type == html.ElementNode && n.Data == "span" && hasClass(n, "name-folder") {
            return n.FirstChild.Data;
        } else {
            for c := n.FirstChild; c != nil; c = c.NextSibling {
                name := GetFolderName(c)
                if (name != "") {
                    return strings.TrimSpace(name);
                }
            }
        }
        return ""
    }
    var empty bool = true;
    var f func(*html.Node)
    f = func(n *html.Node) {
        if page == 1 && n.Type == html.ElementNode && n.Data == "a" && hasClass(n, "object-folder") {
            subdir := GetFolderName(n);
            top := &state.Stack[len(state.Stack)-1];
            top.Subdirs = append(top.Subdirs, subdir);
            state.Stack = append(state.Stack, MakeFolder(subdir, top.Dir+subdir+"/"));
            fmt.Fprintln(os.Stderr, indent, subdir)
            Crawl(client, auth, "https://www.cda.pl/xardasmat/folder/" + getAttr(n, "data-foldery_id"), 1, indent + "*", state);
        } else if n.Type == html.ElementNode && n.Data == "a" && hasClass(n, "link-title-visit") {
            // fmt.Fprintln(os.Stderr, indent, strings.Split(getAttr(n, "href"),"/")[2], n.FirstChild.Data);
            top := &state.Stack[len(state.Stack)-1];
            top.Links = append(top.Links, MakeLink(strings.Split(getAttr(n, "href"),"/")[2], n.FirstChild.Data));
            empty = false;
        } else {
            for c := n.FirstChild; c != nil; c = c.NextSibling {
                f(c)
            }
        }
    }
    f(doc)

    if (!empty) {
        Crawl(client, auth, url, page+1, indent, state);
    } else {
        state.Folders = append(state.Folders, state.Stack[len(state.Stack)-1]);
        state.Stack = state.Stack[:len(state.Stack)-1];
    }
}

func main() {
    state := State{}
    client := &http.Client{}
    Crawl(client, os.Args[1], "https://www.cda.pl/xardasmat/folder-glowny", 1, "", &state);
    for _, folder := range state.Folders {
        _ = os.MkdirAll("."+folder.Dir, 0777);
        f, _ := os.Create("."+folder.Dir+"index.html");
        defer f.Close()
        pattern_file, _ := os.Open("pattern.html");
        buf := new(strings.Builder)
        io.Copy(buf, pattern_file)
        // check errors
        pattern := buf.String()

        pattern = strings.ReplaceAll(pattern, "{%NAME%}", html.EscapeString(folder.Name));


        var subdirs strings.Builder
        for _, subdir := range folder.Subdirs {
            fmt.Fprintf(&subdirs, "<a href=\"%s/\">%s</a><BR>\n", html.EscapeString(subdir), html.EscapeString(subdir));
        }
        pattern = strings.ReplaceAll(pattern, "{%DIRS%}", subdirs.String());

        var links strings.Builder
        for _, link := range folder.Links {
            fmt.Fprintf(&links, "<a onclick=\"return popup(`%s`, null, null, []);\">%s</a> / <a onclick=\"return popup_cda(`%s`);\">CDA</a> / <a onclick=\"return popup_ass(`%s`);\">player.js</a><BR>\n", html.EscapeString(link.Id), html.EscapeString(link.Name), html.EscapeString(link.Id), html.EscapeString(link.Id));
        }

        pattern = strings.ReplaceAll(pattern, "{%LINKS%}", links.String());

        fmt.Fprintf(f, pattern);
    }
}
