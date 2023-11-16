import {ipcRenderer, shell} from "electron";

declare global {
    interface Window {
        iconv: any;
        globalArgs: any;
        ipcRenderer: typeof ipcRenderer;
        shell: {
            shell: typeof shell;
        };
        crash: {
            start: () => void;
        };
        electronAPI: {
            toggleFullScreen: () => void;
            sendSearchQuery: (query: string) => void;
            closeSearchWindow: () => void;
            //  TODO event type define here
        };
    }
}
