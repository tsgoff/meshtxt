import { reactive } from "vue";

// global state
const globalState = reactive({

    keepAliveKey: 0,

    isConnected: false,
    isConfigComplete: false,
    connection: null,
    deviceStatus: null,

    myNodeId: null,
    myNodeUser: null,

    loraConfig: null,
    channelsByIndex: {},
    nodesById: {},

});

export default globalState;
