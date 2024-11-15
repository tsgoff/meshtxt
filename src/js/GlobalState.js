import { reactive } from "vue";

// global state
const globalState = reactive({

    isConnected: false,
    connection: null,

    myNodeId: null,
    myNodeUser: null,

    channelsByIndex: {},
    nodesById: {},
    messages: [],

});

export default globalState;
