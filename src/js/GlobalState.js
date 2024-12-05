import { reactive } from "vue";

// global state
const globalState = reactive({

    isConnected: false,
    isConfigComplete: false,
    connection: null,
    deviceStatus: null,

    myNodeId: null,
    myNodeUser: null,
    myNodeDeviceMetrics: null,
    myNodeFiles: [],

    loraConfig: null,
    channelsByIndex: {},
    nodesById: {},

    // cache channels fetched from remote nodes
    remoteNodeChannels: {},

});

export default globalState;
