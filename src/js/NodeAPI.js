import GlobalState from "./GlobalState.js";
import { Constants, Protobuf } from "@meshtastic/js";
import NodeUtils from "./NodeUtils.js";
import Connection from "./Connection.js";
import ChannelUtils from "./ChannelUtils.js";
import PacketUtils from "./PacketUtils.js";
import RoutingError from "./exceptions/RoutingError.js";

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

    static async getOwnerRequest() {

        // create admin message packet
        const adminMessage = Protobuf.Admin.AdminMessage.fromJson({
            getOwnerRequest: true,
        });

        // create packet data
        const byteData = adminMessage.toBinary().buffer;
        const portNum = Protobuf.Portnums.PortNum.ADMIN_APP;
        const destination = GlobalState.myNodeId;
        const channel = 0;
        const wantAck = true;
        const wantResponse = true;

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

    static generatePacketId() {
        return GlobalState.connection.generateRandId();
    }

    /**
     * this function exists because @meshtastic/js sendPacket function doesn't expose a way to provide our own packet id
     * we want to get the packet id before the packet is sent to allow us to listen for responses and errors
     * @param id an optional custom packet id to use
     * @param data payload data to send
     * @param portNum meshtastic portnum we are sending to
     * @param destination id of the destination node to send to
     * @param channel id of the channel to send to
     * @param wantAck if we want an ack from the destination
     * @param wantResponse if we want the destination to send us a response
     * @param pkiEncrypted if this packet should be pki encrypted
     * @param publicKey the public key to use for pki encryption
     * @returns {Promise<*>}
     */
    static async sendPacket(id, data, portNum, destination, channel, wantAck, wantResponse, pkiEncrypted, publicKey) {

        // use provided packet id, otherwise generate one
        const packetId = id ?? this.generatePacketId();

        // create to radio message
        const toRadioMessage = Protobuf.Mesh.ToRadio.fromJson({
            packet: {
                id: packetId,
                to: destination,
                from: GlobalState.myNodeId,
                channel: channel,
                wantAck: wantAck,
                priority: Protobuf.Mesh.MeshPacket_Priority.RELIABLE,
                pkiEncrypted: pkiEncrypted,
                publicKey: PacketUtils.uInt8ArrayToBase64(publicKey),
                decoded: {
                    portnum: portNum,
                    payload: PacketUtils.uInt8ArrayToBase64(data),
                    wantResponse: wantResponse,
                },
            },
        });

        return await GlobalState.connection.sendRaw(toRadioMessage.toBinary(), packetId);

    }

    /**
     * Sends an AdminMessage to the provided node id, and waits for a response, or timeouts out after the provided delay
     * @param nodeId the node id to send the admin message to
     * @param adminMessage the AdminMessage to send
     * @param wantResponse if we want the destination to send us a response
     * @param timeoutMillis how long to wait before timing out
     * @returns {Promise<unknown>}
     */
    static async sendAdminPacketAndWaitForResponse(nodeId, adminMessage, wantResponse = true, timeoutMillis = 15000) {
        var timeout = null;
        var responseMeshPacketListener = null;
        return new Promise(async (resolve, reject) => {
            try {

                // create packet data
                const id = this.generatePacketId();
                const byteData = adminMessage.toBinary();
                const portNum = Protobuf.Portnums.PortNum.ADMIN_APP;
                const destination = parseInt(nodeId);
                const channel = ChannelUtils.getAdminChannelIndex(nodeId);
                const wantAck = true; // always want ack, otherwise node doesn't send the packet on lora
                const pkiEncrypted = channel === ChannelUtils.PKC_CHANNEL_INDEX;
                const publicKey = channel === ChannelUtils.PKC_CHANNEL_INDEX ? NodeUtils.getPublicKey(nodeId) : new Uint8Array([]);

                // handle response packet
                responseMeshPacketListener = (meshPacket) => {

                    // ignore packet if not decoded
                    if(meshPacket.payloadVariant.case !== "decoded"){
                        return;
                    }

                    // ignore packet if it's not for our request
                    const requestId = meshPacket.payloadVariant.value.requestId;
                    if(requestId !== id){
                        return;
                    }

                    // ignore packet if it's not from the destination node
                    const from = meshPacket.from;
                    if(from !== destination){
                        return;
                    }

                    // check if we got a response from the destination indicating an error
                    const portnum = meshPacket.payloadVariant.value.portnum;
                    if(portnum === Protobuf.Portnums.PortNum.ROUTING_APP){

                        // parse routing message
                        const routing = Protobuf.Mesh.Routing.fromBinary(meshPacket.payloadVariant.value.payload);

                        // reject promise if an error was received
                        if(routing.variant.case === "errorReason"){
                            if(routing.variant.value !== Protobuf.Mesh.Routing_Error.NONE){
                                clearTimeout(timeout);
                                Connection.removeMeshPacketListener(responseMeshPacketListener);
                                reject(new RoutingError(routing.variant.value));
                                return;
                            }
                        }

                    }

                    // we have response, so we no longer want to time out
                    clearTimeout(timeout);

                    // stop listening for mesh packets
                    Connection.removeMeshPacketListener(responseMeshPacketListener);

                    // parse admin response message
                    const adminResponseMessage = Protobuf.Admin.AdminMessage.fromBinary(meshPacket.payloadVariant.value.payload);

                    // resolve promise
                    resolve(adminResponseMessage);

                };

                // timeout after configured delay
                timeout = setTimeout(() => {
                    Connection.removeMeshPacketListener(responseMeshPacketListener);
                    reject("timeout");
                }, timeoutMillis);

                // listen for response packets
                Connection.addMeshPacketListener(responseMeshPacketListener);

                // send packet
                await this.sendPacket(id, byteData, portNum, destination, channel, wantAck, wantResponse, pkiEncrypted, publicKey);

            } catch(e) {
                clearTimeout(timeout);
                Connection.removeMeshPacketListener(responseMeshPacketListener);
                reject(e);
            }
        });
    }

    /**
     * Sends an admin request to get the owner of the provided node id
     * @param nodeId
     * @param timeoutMillis
     * @returns {Promise<*>}
     */
    static async remoteAdminGetOwner(nodeId, timeoutMillis) {

        // create admin message packet
        const adminMessageRequest = Protobuf.Admin.AdminMessage.fromJson({
            getOwnerRequest: true,
        });

        // send packet and wait for response
        const adminMessageResponse = await this.sendAdminPacketAndWaitForResponse(nodeId, adminMessageRequest, true, timeoutMillis);

        // return user from admin response
        return adminMessageResponse.payloadVariant.value;

    }

    /**
     * Sends an admin request to set the owner of the provided node id
     * @param nodeId
     * @param user
     * @param timeoutMillis
     * @returns {Promise<void>}
     */
    static async remoteAdminSetOwner(nodeId, user, timeoutMillis) {

        // create admin message packet
        const adminMessageRequest = Protobuf.Admin.AdminMessage.fromJson({
            setOwner: user.toJson(),
        });

        // send packet and wait for response
        await this.sendAdminPacketAndWaitForResponse(nodeId, adminMessageRequest, false, timeoutMillis);

    }

}

export default NodeAPI;
