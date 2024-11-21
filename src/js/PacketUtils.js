class PacketUtils {

    static getPacketHops(packet) {
        const hopStart = packet.hopStart;
        const hopLimit = packet.hopLimit;
        const hopsAway = (hopStart === 0 || hopLimit > hopStart) ? -1 : hopStart - hopLimit;
        return hopsAway;
    }

}

export default PacketUtils;
