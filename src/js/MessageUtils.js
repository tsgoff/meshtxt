import GlobalState from "./GlobalState.js";

class MessageUtils {

    static isMessageInbound(message) {
        // inbound messages are not from us
        return message.from !== GlobalState.myNodeId;
    }

    static isMessageOutbound(message) {
        // outbound messages are from us
        return message.from === GlobalState.myNodeId;
    }

    static isMessageAcknowledged(message) {
        // implicit acks for broadcast messages are always acked from our own id
        // acked_by_node_id is saved on the message in the database when we receive an ack for this messages packet id
        return message.acked_by_node_id === GlobalState.myNodeId;
    }

    static isMessageDelivered(message) {
        // message is delivered if it was a direct message and was acked by the recipient
        return message.type === "direct" && message.acked_by_node_id === message.to;
    }

    static isMessageFailed(message) {
        return message.error != null;
    }

}

export default MessageUtils;
