class PacketUtils {

    static getPacketHops(packet) {
        const hopStart = packet.hopStart;
        const hopLimit = packet.hopLimit;
        const hopsAway = (hopStart === 0 || hopLimit > hopStart) ? -1 : hopStart - hopLimit;
        return hopsAway;
    }

    static uInt8ArrayToBase64(uInt8Array) {
        let binary = "";
        for(let i = 0; i < uInt8Array.length; i++){
            binary += String.fromCharCode(uInt8Array[i]);
        }
        return btoa(binary);
    }

    static base64ToUInt8Array(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for(var i = 0; i < binaryString.length; i++){
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

}

export default PacketUtils;
