import GlobalState from "./GlobalState.js";
import { Constants, Protobuf } from "@meshtastic/js";
import NodeUtils from "./NodeUtils.js";
import Connection from "./Connection.js";

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
     * Sends a PRIVATE_APP packet with no data to the provided node id and listens for an ack back from the destination node.
     * Returns how long it took to receive an ack from the destination node, along with how many hops the response took to get to us.
     * @returns {Promise<*>}
     */
    static async ping(nodeId, timeout = 30000) {
        return new Promise(async (resolve, reject) => {

            // remember the packet id and when we started the ping
            var packetId = null;
            var timestampStart = null;

            // listen for packet acks
            const packetIdAcks = [];
            const packetAckListener = (requestId, ackedByNodeId, hopsAway) => {

                // remember ack for request id
                packetIdAcks.push({
                    packet_id: requestId,
                    acked_by_node_id: ackedByNodeId,
                    hops_away: hopsAway,
                });

                // we received an ack, check if it's from the destination node
                checkForAck();

            };

            function checkForAck() {

                // check if we have a packet id yet
                if(!packetId){
                    return;
                }

                // determine how long the ping reply took (without overhead of ack packet lookup)
                const durationMillis = Date.now() - timestampStart;

                // find ack for packet id from destination node
                const packetIdAck = packetIdAcks.find((packetIdAck) => {
                    return packetIdAck.packet_id === packetId && packetIdAck.acked_by_node_id === nodeId;
                });

                // do nothing if ack not found
                if(!packetIdAck){
                    return;
                }

                // got ack from destination node
                Connection.removePacketAckListener(packetAckListener);
                resolve({
                    duration_millis: durationMillis,
                    hops_away: packetIdAck.hops_away,
                });

            }

            // add packet listener
            Connection.addPacketAckListener(packetAckListener);

            // timeout after delay
            setTimeout(() => {
                Connection.removePacketAckListener(packetAckListener);
                reject("timeout");
            }, timeout);

            // send ping packet
            try {

                // create packet data
                const byteData = new Uint8Array([]).buffer;
                const portNum = Protobuf.Portnums.PortNum.PRIVATE_APP;
                const destination = nodeId;
                const channel = NodeUtils.getNodeChannel(nodeId);
                const wantAck = true;
                const wantResponse = false;

                // send packet
                timestampStart = Date.now();
                packetId = await GlobalState.connection.sendPacket(byteData, portNum, destination, channel, wantAck, wantResponse);
                checkForAck();

            } catch(e) {
                Connection.removePacketAckListener(packetAckListener);
                reject(e);
            }

        });
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
