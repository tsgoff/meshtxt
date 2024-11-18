import { reactive } from "vue";

// global state
const globalState = reactive({

    isConnected: false,
    connection: null,
    deviceStatus: null,

    myNodeId: null,
    myNodeUser: null,

    channelsByIndex: {},
    nodesById: {},
    messages: [],
    traceRoutesById: {},

});

export default globalState;
