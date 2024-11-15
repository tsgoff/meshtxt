import path from "path";
import vue from '@vitejs/plugin-vue';

export default {

    // vite app is loaded from /src
    root: path.join(__dirname, "src"),

    // add plugins
    plugins: [
        vue(),
    ],

}
