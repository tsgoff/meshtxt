import {v4} from 'uuid';
import {addRxPlugin} from 'rxdb';
import {createRxDatabase} from 'rxdb/plugins/core';
import {getRxStorageDexie} from 'rxdb/plugins/storage-dexie';
import {RxDBDevModePlugin} from 'rxdb/plugins/dev-mode';
import {Constants} from "@meshtastic/js";
import GlobalState from "./GlobalState.js";

// enable rxdb dev mode during development
if(process.env.NODE_ENV === 'development'){
    addRxPlugin(RxDBDevModePlugin);
}

var database = null;
async function initDatabase(nodeId) {

    // close any exsiting database connection
    if(database){
        await database.destroy();
    }

    // create a database with a unique name per node
    database = await createRxDatabase({
        name: `meshtxt_db_node_${nodeId}`,
        storage: getRxStorageDexie(),
        allowSlowCount: true, // fixme: figure out why rxdb complains about indexes when they existed during testing...
    });

    // add database schemas
    await database.addCollections({
        messages: {
            schema: {
                version: 0,
                primaryKey: 'id',
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        maxLength: 36,
                    },
                    packet_id: {
                        type: 'integer',
                    },
                    type: {
                        type: 'string',
                    },
                    to: {
                        type: 'integer',
                    },
                    from: {
                        type: 'integer',
                    },
                    // todo channel hash for when a channel changes slots, or is deleted then recreated later
                    channel: {
                        type: 'integer',
                    },
                    data: {
                        type: 'string',
                    },
                    timestamp: {
                        type: 'integer',
                    },
                    rx_timestamp: {
                        type: 'integer',
                    },
                    acked_by_node_id: {
                        type: 'integer',
                    },
                    error: {
                        type: 'string',
                    },
                },
            }
        },
        traceroutes: {
            schema: {
                version: 0,
                primaryKey: 'id',
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        maxLength: 36,
                    },
                    packet_id: {
                        type: 'integer',
                    },
                    to: {
                        type: 'integer',
                    },
                    from: {
                        type: 'integer',
                    },
                    channel: {
                        type: 'integer',
                    },
                    data: {
                        type: 'object',
                    },
                    timestamp: {
                        type: 'integer',
                    },
                    rx_timestamp: {
                        type: 'integer',
                    },
                },
            }
        },
        node_messages_read_state: {
            schema: {
                version: 0,
                primaryKey: 'id',
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        maxLength: 10,
                    },
                    timestamp: {
                        type: 'integer',
                    },
                },
            }
        },
        channel_messages_read_state: {
            schema: {
                version: 0,
                primaryKey: 'id',
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        maxLength: 10,
                    },
                    timestamp: {
                        type: 'integer',
                    },
                },
            }
        },
    });

}

class Message {

    // insert a message into the database
    static async insert(data) {
        return await database.messages.insert({
            id: v4(),
            packet_id: data.id,
            type: data.type,
            to: data.to,
            from: data.from,
            channel: data.channel,
            data: data.data,
            timestamp: Date.now(),
            rx_timestamp: data.rxTime.getTime(),
            acked_by_node_id: null,
            error: null,
        });
    }

    // set the node id that acked a message in the database
    static async setMessageAckedByNodeId(packetId, ackedByNodeId) {

        // find one latest message by packet id
        // this will prevent updating older messages that might have the same packet id
        const latestMessageByPacketId = database.messages.findOne({
            selector: {
                packet_id: {
                    $eq: packetId,
                },
            },
            sort: [
                {
                    timestamp: "desc",
                },
            ],
        });

        // patch the message with the new acked by id
        return await latestMessageByPacketId.patch({
            acked_by_node_id: ackedByNodeId,
        });

    }

    // sets an error for a message by packet id
    static async setMessageErrorByPacketId(packetId, error) {

        // find one latest message with the provided packet id
        const latestMessageByPacketId = database.messages.findOne({
            selector: {
                packet_id: {
                    $eq: packetId,
                },
            },
            sort: [
                {
                    timestamp: "desc",
                },
            ],
        });

        // patch the message with the error
        return await latestMessageByPacketId.patch({
            error: error,
        });

    }

    // sets an error for a message by finding the latest message from us with the provided text
    static async setMessageErrorByLatestMessageText(messageText, errorMessage) {

        // find one latest message sent from us with the exact same message text
        const latestMessageByText = database.messages.findOne({
            selector: {
                from: {
                    $eq: GlobalState.myNodeId,
                },
                data: {
                    $eq: messageText,
                },
            },
            sort: [
                {
                    timestamp: "desc",
                },
            ],
        });

        // patch the message with the error
        return await latestMessageByText.patch({
            error: errorMessage,
        });

    }

    // get broadcast messages for the provided channel id
    static getChannelMessages(channelId) {
        return database.messages.find({
            selector: {
                to: {
                    $eq: Constants.broadcastNum,
                },
                channel: {
                    $eq: channelId,
                },
            },
            sort: [
                {
                    timestamp: "asc",
                },
            ],
        });
    }

    // get direct messages for the provided node id
    static getNodeMessages(nodeId) {
        return database.messages.find({
            selector: {
                $or: [
                    // messages from us to other node
                    {
                        from: {
                            $eq: GlobalState.myNodeId,
                        },
                        to: {
                            $eq: nodeId,
                        },
                    },
                    // messages from other node to us
                    {
                        from: {
                            $eq: nodeId,
                        },
                        to: {
                            $eq: GlobalState.myNodeId,
                        },
                    },
                ]
            },
            sort: [
                {
                    timestamp: "asc",
                },
            ],
        });
    }

    // get unread broadcast messages count for the provided channel id
    static getChannelMessagesUnreadCount(channelId, messagesLastReadTimestamp) {
        return database.messages.count({
            selector: {
                timestamp: {
                    $gt: messagesLastReadTimestamp,
                },
                to: {
                    $eq: Constants.broadcastNum,
                },
                channel: {
                    $eq: channelId,
                },
            },
        });
    }

    // get unread direct messages count for the provided node id
    static getNodeMessagesUnreadCount(nodeId, messagesLastReadTimestamp) {
        return database.messages.count({
            selector: {
                timestamp: {
                    $gt: messagesLastReadTimestamp,
                },
                from: {
                    $eq: nodeId,
                },
                to: {
                    $eq: GlobalState.myNodeId,
                },
            },
        });
    }

    // delete direct messages for the provided node id
    static async deleteNodeMessages(nodeId) {
        await this.getNodeMessages(parseInt(nodeId)).remove();
    }

    // delete broadcast messages for the provided channel id
    static async deleteChannelMessages(channelId) {
        await this.getChannelMessages(parseInt(channelId)).remove();
    }

}

class TraceRoute {

    // insert a traceroute into the database
    static async insert(data) {
        return await database.traceroutes.insert({
            id: v4(),
            packet_id: data.id,
            to: data.to,
            from: data.from,
            channel: data.channel,
            data: data.data,
            timestamp: Date.now(),
            rx_timestamp: data.rxTime.getTime(),
        });
    }

    // get traceroute responses from the provided node id
    static getTraceRoutesByNodeId(nodeId) {
        return database.traceroutes.find({
            selector: {
                to: {
                    $eq: GlobalState.myNodeId,
                },
                from: {
                    $eq: parseInt(nodeId),
                },
            },
            sort: [
                {
                    timestamp: "asc",
                },
            ],
        });
    }

    // find traceroute by id
    static findTraceRouteById(id) {
        return database.traceroutes.findOne({
            selector: {
                id: {
                    $eq: id,
                },
            },
        });
    }

    // find traceroute by packet id
    static findTraceRouteByPacketId(packetId) {
        return database.traceroutes.findOne({
            selector: {
                packet_id: {
                    $eq: packetId,
                },
            },
            sort: [
                {
                    timestamp: "desc",
                },
            ],
        });
    }

}

class NodeMessagesReadState {

    // update the read state of messages for the provided node id
    static async touch(nodeId) {
        return await database.node_messages_read_state.upsert({
            id: nodeId.toString(),
            timestamp: Date.now(),
        });
    }

    // get the read state of messages for the provided node id
    static get(nodeId) {
        return database.node_messages_read_state.findOne({
            selector: {
                id: {
                    $eq: nodeId.toString(),
                },
            },
        });
    }

}

class ChannelMessagesReadState {

    // update the read state of messages for the provided channel id
    static async touch(channelId) {
        return await database.channel_messages_read_state.upsert({
            id: channelId.toString(),
            timestamp: Date.now(),
        });
    }

    // get the read state of messages for all channels
    static getAll() {
        return database.channel_messages_read_state.find();
    }

    // get the read state of messages for the provided channel id
    static get(channelId) {
        return database.channel_messages_read_state.findOne({
            selector: {
                id: {
                    $eq: channelId.toString(),
                },
            },
        });
    }

}

export default {
    initDatabase,
    Message,
    TraceRoute,
    NodeMessagesReadState,
    ChannelMessagesReadState,
};
