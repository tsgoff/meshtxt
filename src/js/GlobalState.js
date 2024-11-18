import { reactive } from "vue";

// global state
const globalState = reactive({

    keepAliveKey: 0,

    isConnected: false,
    connection: null,
    deviceStatus: null,

    myNodeId: null,
    myNodeUser: null,

    channelsByIndex: {},
    nodesById: {},
    traceRoutesById: {},

});

export default globalState;
