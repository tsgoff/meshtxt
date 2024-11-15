import GlobalState from "./GlobalState.js";
import { Constants } from "@meshtastic/js";

class NodeAPI {

    static async sendDirectMessageToNode(nodeId, message) {
        // sends a direct text message to a specific node and requests an ack
        return await GlobalState.connection.sendText(message, nodeId, true);
    }

    static async sendBroadcastMessageToChannel(channelIndex, message) {
        // sends a broadcast text message to a specific channel and requests an ack
        return await GlobalState.connection.sendText(message, Constants.broadcastNum, true, channelIndex);
    }

}

export default NodeAPI;
