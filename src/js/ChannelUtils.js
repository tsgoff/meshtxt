import GlobalState from "./GlobalState.js";
import {Protobuf} from "@meshtastic/js";

class ChannelUtils {

    // https://github.com/meshtastic/firmware/blob/2b0113ae82f2dc5cde82e5c00921d41d10ac141d/src/mesh/Channels.cpp#L294
    static getChannelName(channelId) {

        // get channel name from channel settings
        const channel = GlobalState.channelsByIndex[channelId];
        var channelName = channel?.settings?.name;

        // if channel name is empty, determine what the name should be based on modem preset
        if(channelName === ""){
            if(GlobalState.loraConfig?.usePreset === true){
                channelName = this.getModemPresetDisplayName(GlobalState.loraConfig.modemPreset);
            } else {
                channelName = "Custom";
            }
        }

        return channelName;

    }

    static getModemPresetDisplayName(modemPreset) {
        switch(modemPreset){
            case Protobuf.Config.Config_LoRaConfig_ModemPreset.SHORT_TURBO: return "ShortTurbo";
            case Protobuf.Config.Config_LoRaConfig_ModemPreset.SHORT_SLOW: return "ShortSlow";
            case Protobuf.Config.Config_LoRaConfig_ModemPreset.SHORT_FAST: return "ShortFast";
            case Protobuf.Config.Config_LoRaConfig_ModemPreset.MEDIUM_SLOW: return "MediumSlow";
            case Protobuf.Config.Config_LoRaConfig_ModemPreset.MEDIUM_FAST: return "MediumFast";
            case Protobuf.Config.Config_LoRaConfig_ModemPreset.LONG_SLOW: return "LongSlow";
            case Protobuf.Config.Config_LoRaConfig_ModemPreset.LONG_FAST: return "LongFast";
            case Protobuf.Config.Config_LoRaConfig_ModemPreset.LONG_MODERATE: return "LongMod";
            case Protobuf.Config.Config_LoRaConfig_ModemPreset.VERY_LONG_SLOW: return "VLongSlow";
            default: return "Invalid";
        }
    }

    // https://github.com/meshtastic/firmware/blob/2b0113ae82f2dc5cde82e5c00921d41d10ac141d/src/mesh/Channels.cpp#L312
    static isDefaultChannel(channelId) {

        // find channel by id
        const channel = GlobalState.channelsByIndex[channelId];
        if(!channel){
            return false;
        }

        // check if channel has default key
        const hasDefaultPsk = channel.settings.psk.length === 1 && channel.settings.psk[0] === 1;

        // check if channel has default display name
        const channelName = this.getChannelName(channelId);
        const modemPresetDisplayName = this.getModemPresetDisplayName(GlobalState.loraConfig?.modemPreset);
        const hasDefaultDisplayName = channelName === modemPresetDisplayName;

        // channel is a default channel if it is using the default key and default display name
        return hasDefaultPsk && hasDefaultDisplayName;

    }

}

export default ChannelUtils;
