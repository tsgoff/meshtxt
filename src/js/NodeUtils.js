import GlobalState from "./GlobalState.js";
import { Protobuf } from "@meshtastic/js";
import PacketUtils from "./PacketUtils.js";

class NodeUtils {

    static hasPublicKey(nodeId) {
        const publicKey = GlobalState.nodesById[nodeId]?.user?.publicKey;
        return publicKey != null && publicKey.length > 0;
    }

    static getNodeHexId(nodeId) {
        return "!" + parseInt(nodeId).toString(16);
    }

    static getNodeColour(nodeId) {
        // convert node id to a hex colour
        return "#" + (nodeId & 0x00FFFFFF).toString(16).padStart(6, '0');
    }

    static getNodeTextColour(nodeId) {

        // extract rgb components
        const r = (nodeId & 0xFF0000) >> 16;
        const g = (nodeId & 0x00FF00) >> 8;
        const b = nodeId & 0x0000FF;

        // calculate brightness
        const brightness = ((r * 0.299) + (g * 0.587) + (b * 0.114)) / 255;

        // determine text color based on brightness
        return brightness > 0.5 ? "#000000" : "#FFFFFF";

    }

    static getNodeShortName(nodeId) {
        return GlobalState.nodesById[nodeId]?.user?.shortName?.substring(0, 4) ?? "?";
    }

    static getNodeLongName(nodeId) {
        return GlobalState.nodesById[nodeId]?.user?.longName ?? NodeUtils.getNodeHexId(nodeId);
    }

    static getRoleName(roleId) {
        return Protobuf.Config.Config_DeviceConfig_Role[roleId];
    }

    static getHardwareName(hardwareId) {
        return Protobuf.Mesh.HardwareModel[hardwareId];
    }

    static getNodeChannel(nodeId) {
        // get the channel we should use to send packets to this node
        // otherwise we will just fallback to the primary channel
        return GlobalState.nodesById[nodeId]?.channel ?? 0;
    }

    static convertPublicKeyToBase64(publicKey) {
        return PacketUtils.uInt8ArrayToBase64(publicKey);
    }

    /**
     * Converts latitudeI or longitudeI to an actual lat/long value
     * e.g: -38123456 -> -38.123456
     * @param latLongInteger
     * @returns {number}
     */
    static latLongIntegerToLatLong(latLongInteger) {
        return latLongInteger / 10000000;
    }

}

export default NodeUtils;
