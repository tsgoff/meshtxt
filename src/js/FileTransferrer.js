import NodeAPI from "./NodeAPI.js";
import GlobalState from "./GlobalState.js";
import FileTransferAPI from "./FileTransferAPI.js";
import Connection from "./Connection.js";

class FileTransferrer {

    static DIRECTION_INCOMING = "incoming";
    static DIRECTION_OUTGOING = "outgoing";

    static STATUS_OFFERING = "offering";
    static STATUS_REJECTED = "rejected";
    static STATUS_CANCELLED = "cancelled";
    static STATUS_COMPLETED = "completed";
    static STATUS_SENDING = "sending";
    static STATUS_RECEIVING = "receiving";

    static MAX_PACKET_ATTEMPTS = 3;

    static log(message) {
        console.log(`[FileTransferrer] ${message}`);
    }

    static async offerFileTransfer(to, file) {

        // generate random file transfer id
        const fileTransferId = NodeAPI.generatePacketId();

        // get file details
        to = parseInt(to);
        const fileName = file.name;
        const fileData = new Uint8Array(await file.arrayBuffer());
        const fileSize = fileData.length;

        const fileTransfer = {
            id: fileTransferId,
            to: to,
            from: GlobalState.myNodeId,
            direction: this.DIRECTION_OUTGOING,
            status: this.STATUS_OFFERING,
            filename: fileName,
            filesize: fileSize,
            progress: 0,
            data: fileData,
        };

        // add to file transfers list
        GlobalState.fileTransfers.push(fileTransfer);

        // send file transfer offer
        for(var attempt = 1; attempt <= this.MAX_PACKET_ATTEMPTS; attempt++){
            try {
                this.log(`offerFileTransfer attempt ${attempt}`);
                await FileTransferAPI.offerFileTransfer(to, fileTransferId, fileName, fileSize);
                this.log(`offerFileTransfer attempt ${attempt} success`);
                return;
            } catch(e) {
                console.log(e);
                if(attempt === this.MAX_PACKET_ATTEMPTS){
                    this.log("offerFileTransfer failed", e);
                    throw e;
                }
            }
        }

    }

    static async acceptFileTransfer(fileTransfer) {

        // create buffer for file data
        fileTransfer.status = this.STATUS_RECEIVING;
        fileTransfer.data = new Uint8Array(0);

        // loop until all bytes received
        var offset = 0;
        var length = 200;
        while(fileTransfer.data.length < fileTransfer.filesize){

            // stop fetching file chunks if the file transfer has been cancelled
            if(fileTransfer.status === FileTransferrer.STATUS_CANCELLED){
                return;
            }

            try {

                // fetch next file chunk
                offset = fileTransfer.data.length;
                const fileChunk = await FileTransferrer.getFileChunk(fileTransfer, offset, length);

                // append received data
                fileTransfer.data = new Uint8Array([
                    ...fileTransfer.data,
                    ...fileChunk.data,
                ]);

                // check if completed
                if(fileTransfer.data.length === fileTransfer.filesize){
                    // todo check integrity of received data (implement a crc or hash)
                    fileTransfer.status = FileTransferrer.STATUS_COMPLETED;
                    fileTransfer.blob = new Blob([fileTransfer.data], {
                        type: "application/octet-stream",
                    });
                    await FileTransferrer.completeFileTransfer(fileTransfer);
                    return;
                }

                // update file transfer progress
                fileTransfer.progress = Math.min(100, Math.ceil((fileChunk.offset + fileChunk.length) / fileTransfer.filesize * 100));

            } catch(e) {
                this.log("failed to get file chunk", e);
            }

        }

    }

    static async rejectFileTransfer(fileTransfer) {

        // remove from ui
        GlobalState.fileTransfers = GlobalState.fileTransfers.filter((existingFileTransfer) => {
            return existingFileTransfer.id !== fileTransfer.id;
        });

        for(var attempt = 1; attempt <= this.MAX_PACKET_ATTEMPTS; attempt++){
            try {
                this.log(`rejectFileTransfer attempt ${attempt}`);
                await FileTransferAPI.rejectFileTransfer(fileTransfer.from, fileTransfer.id);
                fileTransfer.status = this.STATUS_REJECTED;
                return;
            } catch(e) {
                console.log(e);
                if(attempt === this.MAX_PACKET_ATTEMPTS){
                    this.log("rejectFileTransfer failed", e);
                    throw e;
                }
            }
        }

    }

    static async cancelFileTransfer(fileTransfer) {

        fileTransfer.status = this.STATUS_CANCELLED;

        for(var attempt = 1; attempt <= this.MAX_PACKET_ATTEMPTS; attempt++){
            try {
                this.log(`cancelFileTransfer attempt ${attempt}`);
                await FileTransferAPI.cancelFileTransfer(fileTransfer.to, fileTransfer.id);
                return;
            } catch(e) {
                console.log(e);
                if(attempt === this.MAX_PACKET_ATTEMPTS){
                    this.log("cancelFileTransfer failed", e);
                    throw e;
                }
            }
        }

    }

    static removeFileTransfer(fileTransfer) {
        GlobalState.fileTransfers = GlobalState.fileTransfers.filter((existingFileTransfer) => {
            return existingFileTransfer.id !== fileTransfer.id;
        });
    }

    static async requestFileChunk(fileTransfer, offset, length) {
        await FileTransferAPI.requestFileChunk(fileTransfer.from, fileTransfer.id, offset, length);
    }

    static async sendFileChunk(fileTransfer, offset, length) {

        // update status
        fileTransfer.status = FileTransferrer.STATUS_SENDING;

        // get data for this part
        const data = fileTransfer.data.slice(offset, offset + length);

        // send file chunk
        await FileTransferAPI.sendFileChunk(fileTransfer.to, fileTransfer.id, offset, length, data);

    }

    static async completeFileTransfer(fileTransfer) {
        for(var attempt = 1; attempt <= this.MAX_PACKET_ATTEMPTS; attempt++){
            try {
                this.log(`completeFileTransfer attempt ${attempt}`);
                await FileTransferAPI.completeFileTransfer(fileTransfer.from, fileTransfer.id);
                return;
            } catch(e) {
                console.log(e);
                if(attempt === this.MAX_PACKET_ATTEMPTS){
                    this.log("completeFileTransfer failed", e);
                    throw e;
                }
            }
        }
    }

    /**
     * Fetches a file chunk for the provided file transfer
     * @param fileTransfer the file transfer to get a file chunk from
     * @param offset the offset to fetch from
     * @param length the length of data to fetch
     * @param timeoutMillis how long to wait for file chunk before giving up
     * @returns {Promise<unknown>}
     */
    static async getFileChunk(fileTransfer, offset, length, timeoutMillis = 15000) {
        var timeout = null;
        var fileChunkListener = null;
        return new Promise(async (resolve, reject) => {
            try {

                // handle file chunk
                fileChunkListener = (meshPacket, fileChunk) => {

                    // ignore packet if not from expected node
                    if(meshPacket.from !== fileTransfer.from){
                        this.log("ignoring file chunk that isn't from the node that offered this file transfer");
                        return;
                    }

                    // ignore packet if not for requested file transfer id
                    if(fileChunk.fileTransferId !== fileTransfer.id){
                        this.log("ignoring file chunk that isn't for this file transfer");
                        return;
                    }

                    // ignore packet if not for requested offset and length
                    if(fileChunk.offset !== offset || fileChunk.length !== length){
                        this.log("ignoring file chunk that isn't for the offset and length we requested");
                        return;
                    }

                    // we have file chunk, so we no longer want to time out
                    clearTimeout(timeout);

                    // stop listening for file chunks
                    Connection.removeFileChunkListener(fileChunkListener);

                    // resolve promise
                    resolve(fileChunk);

                };

                // timeout after configured delay
                timeout = setTimeout(() => {
                    Connection.removeFileChunkListener(fileChunkListener);
                    reject("timeout");
                }, timeoutMillis);

                // listen for file chunks
                Connection.addFileChunkListener(fileChunkListener);

                // request file chunk
                await this.requestFileChunk(fileTransfer, offset, length);

            } catch(e) {
                clearTimeout(timeout);
                Connection.removeFileChunkListener(fileChunkListener);
                reject(e);
            }
        });
    }

}

export default FileTransferrer;
