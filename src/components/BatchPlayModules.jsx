import React, { useEffect, useRef, useState } from "react";
import { TOKEN } from "../modules/Token";
import { delay, executeBPFile, logme } from "../modules/bp";
import Sval from "sval";
const BatchPlayModules = (props) => {
    const { onBPButtonClicked, askForToken, token, sidebarshow, doLoad, listenToMessage, ...rest } = props;
    const elRef = useRef(null);

    const interpreter = new Sval({
        ecmaVer: 9,
        sandBox: false,
    });
    const [bpfile, setBpfile] = useState({ files: [] });
    const [fav, setFav] = useState(localStorage.getItem("BPFAV"));
    const [tokenentry, setTokenentry] = useState(null);
    useEffect(() => {

        if (listenToMessage != null) {
            if (listenToMessage.fromserver && listenToMessage.type === "bp") {

                var _bp = bpfile.files.filter(f => { return `${listenToMessage.data.toLowerCase()}.js` === f.name.toLowerCase() });

                if (_bp.length > 0) {

                    onBPClick(_bp[0]);
                }

            }
        }
    }, [listenToMessage]);

    const handleEvent = (evt) => {
        const propName = `on${evt.type[0].toUpperCase()}${evt.type.substr(1)}`;
        if (rest[propName]) {
            rest[propName].call(evt.target, evt);
        }
    }

    function handleToken() {
        token.getToken(TOKEN.BP).then(
            async (result) => {
                setTokenentry(result);
                await result.getEntries().then(
                    (entry) => {
                        let bp_file;
                        if (fav != null) {
                            bp_file = entry.filter((f) => { return !fav.includes(f.name) && f.isFile && f.name != ".coremodule.js"; });

                        } else
                            bp_file = entry.filter((f) => { return f.isFile && f.name != ".coremodule.js"; });

                        setBpfile({ files: bp_file });
                    }
                )
            }
        ).catch((e) => {
            logme(e);
            askForToken();
        })
    }

    async function assignFav() {
        console.log("assign fave");


        const coremodule = await tokenentry.getEntry(".coremodule.js");
        const coremodule_str = await coremodule.read();
        let favfread = "";
        for (const favfile of fav.split(",")) {

            const getscriptfile = await tokenentry.getEntry(favfile);
            favfread += await getscriptfile.read();
        }
        await executeBPFile(interpreter, coremodule_str + favfread)
        console.log("assign fave");





    }

    async function onBPClick(f) {

        doLoad(true);
        onBPButtonClicked();
        try {


            if (tokenentry) {
                new Promise(async (resolve) => {
                    const coremodule = await tokenentry.getEntry(".coremodule.js");
                    const coremodule_str = await coremodule.read();
                    const getscriptfile = await tokenentry.getEntry(f.name);
                    const readfile = await getscriptfile.read();

                    await executeBPFile(interpreter, fav.length > 0 ? readfile : coremodule_str + readfile).then(() => { resolve("done") })

                }).then(() => {
                    doLoad(false);
                })



            }
        } catch (error) {
            console.error(error);
        }

    }




    useEffect(() => {
        if (tokenentry != null && fav != null) {
            logme("doit");
            try {
                assignFav().catch((e) => logme(e));
            } catch (error) {
                logme("eee", error);
            }
        }


    }, [tokenentry])
    useEffect(() => {

        localStorage.setItem("BPFAV", fav);
    }, [fav])
    useEffect(() => {
        handleToken();

        const el = elRef.current;
        const eventProps = Object.entries(rest).filter(([k, v]) => k.startsWith("on"));
        eventProps.forEach(([k, v]) => el.addEventListener(k.substring(0, 2).toLowerCase(), handleEvent));

        return () => {
            const el = elRef.current;
            const eventProps = Object.entries(rest).filter(([k, v]) => k.startsWith("on"));
            eventProps.forEach(([k, v]) => el.removeEventListener(k.substring(0, 2).toLowerCase(), handleEvent));
        }
    }, []);
    return (

        <div ref={elRef} {...rest} className="sidebar">
            <div className="sidebar-btn-group">
                <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: "100000", color: "#fff", fontSize: "0.5rem", cursor: "pointer" }} onClick={() => {
                    localStorage.removeItem("BPFAV");
                }}>clear fav</div>

                {bpfile.files.filter((e) => { return !e.name.includes("_") }).map((f, i) => {
                    return <div
                        className="bp-button" key={i}
                        onContextMenu={() => {
                            if (fav != null) {
                                const newf = [];
                                newf.push(fav);
                                setFav([...newf, f.name]);
                            }
                            else
                                setFav(f.name);

                        }}
                        onClick={() => onBPClick(f)}>{f.name.replace(/\.[^/.]+$/, "").toUpperCase()}</div>
                })}

            </div>
        </div >

    )

}
export default BatchPlayModules;