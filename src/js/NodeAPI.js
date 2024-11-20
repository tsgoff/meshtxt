import GlobalState from "./GlobalState.js";
import { Constants, Protobuf } from "@meshtastic/js";
import NodeUtils from "./NodeUtils.js";

class NodeAPI {

    static async sendDirectMessageToNode(nodeId, message) {
        // sends a direct text message to a specific node and requests an ack
        return await GlobalState.connection.sendText(message, nodeId, true);
    }

    static async sendBroadcastMessageToChannel(channelIndex, message) {
        // sends a broadcast text message to a specific channel and requests an ack
        return await GlobalState.connection.sendText(message, Constants.broadcastNum, true, channelIndex);
    }

    /**
     * Sends our NodeInfo to, and requests the NodeInfo from the provided nodeId
     * Meshtastic devices will only send a response if they haven't already sent their NodeInfo in the last 5 minutes
     * https://github.com/meshtastic/firmware/blob/9545a10361203a6e1c24c3512b6f28a7e136802a/src/modules/NodeInfoModule.cpp#L72
     * @param nodeId the node id to exchange NodeInfo with
     * @returns {Promise<*>}
     */
    static async requestNodeInfo(nodeId) {

        // create packet data
        const byteData = GlobalState.myNodeUser.toBinary().buffer;
        const portNum = Protobuf.Portnums.PortNum.NODEINFO_APP;
        const destination = nodeId;
        const channel = NodeUtils.getNodeChannel(nodeId);
        const wantAck = true;
        const wantResponse = true;

        // send packet
        return await GlobalState.connection.sendPacket(byteData, portNum, destination, channel, wantAck, wantResponse);

    }

    /**
     * Sets, or unsets the node as a favourite on the meshtastic device.
     * @param nodeId the node id to set or unset as a favourite
     * @param isFavourite whether the node should be a favourite or not
     * @returns {Promise<*>}
     */
    static async setNodeAsFavourite(nodeId, isFavourite) {

        // create admin message packet
        var adminMessage = null;
        if(isFavourite){
            adminMessage = Protobuf.Admin.AdminMessage.fromJson({
                setFavoriteNode: nodeId,
            });
        } else {
            adminMessage = Protobuf.Admin.AdminMessage.fromJson({
                removeFavoriteNode: nodeId,
            });
        }

        // create packet data
        const byteData = adminMessage.toBinary().buffer;
        const portNum = Protobuf.Portnums.PortNum.ADMIN_APP;
        const destination = GlobalState.myNodeId;
        const channel = 0;
        const wantAck = true;
        const wantResponse = false;

        // send packet
        return await GlobalState.connection.sendPacket(byteData, portNum, destination, channel, wantAck, wantResponse);

    }

    /**
     * Sets the provided timestamp as the current time on the meshtastic device.
     * @param timestamp the timestamp in seconds to set as the current time
     * @returns {Promise<*>}
     */
    static async setTime(timestamp) {

        // create admin message packet
        var adminMessage = Protobuf.Admin.AdminMessage.fromJson({
            setTimeOnly: timestamp,
        });

        // create packet data
        const byteData = adminMessage.toBinary().buffer;
        const portNum = Protobuf.Portnums.PortNum.ADMIN_APP;
        const destination = GlobalState.myNodeId;
        const channel = 0;
        const wantAck = true;
        const wantResponse = false;

        // send packet
        return await GlobalState.connection.sendPacket(byteData, portNum, destination, channel, wantAck, wantResponse);

    }

    /**
     * Removes the node from global state, and also tells the meshtastic device to remove the node.
     * @param nodeId the node id to remove
     * @returns {Promise<*>}
     */
    static async removeNodeByNum(nodeId) {
        delete GlobalState.nodesById[nodeId];
        return await GlobalState.connection.removeNodeByNum(nodeId);
    }

    static async traceRoute(nodeId) {
        return await GlobalState.connection.traceRoute(nodeId);
    }

}

export default NodeAPI;
