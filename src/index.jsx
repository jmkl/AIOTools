import React from "react";
import { entrypoints } from "uxp";
import "./sass/main.sass";
import "./sass/aligntool.sass";
import { PanelController } from "./controllers/PanelController";
import { logme } from "./modules/bp";
import { MainPanel } from "./panels/MainPanel";
import { BrushPanel } from "./panels/BrushPanel";

const brushpanelController = new PanelController(() => <BrushPanel />, {
    id: "brushpanel"
})
const mainpanelController = new PanelController(() => <MainPanel />,
    {
        id: "mainpanel",
        menuItems: [
            {
                id: "reload",
                label: "Reload Plugin",
                enable: true,
                checked: false,
                oninvoke: () => location.reload()
            }, {
                id: "reset",
                label: "Reset Settings",
                enable: true,
                checked: false,
                oninvoke: () => {
                    localStorage.clear();
                    location.reload();
                }
            }
        ]
    })
entrypoints.setup({
    plugin: {
        create(plugin) {
            logme("created", plugin)
        },
        destroy() {

        }
    },
    commands: {},
    panels: {
        mainpanel: mainpanelController,
        brushpanel: brushpanelController

    }
})

