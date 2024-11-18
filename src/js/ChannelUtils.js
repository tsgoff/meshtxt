import GlobalState from "./GlobalState.js";

class ChannelUtils {

    static getChannelName(channelId) {
        const channel = GlobalState.channelsByIndex[channelId];
        return channel?.settings?.name;
    }

}

export default ChannelUtils;
