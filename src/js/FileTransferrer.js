import NodeAPI from "./NodeAPI.js";
import GlobalState from "./GlobalState.js";
import FileTransferAPI from "./FileTransferAPI.js";

class FileTransferrer {

    static DIRECTION_INCOMING = "incoming";
    static DIRECTION_OUTGOING = "outgoing";

    static STATUS_OFFERING = "offering";
    static STATUS_ACCEPTED = "accepted";
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

        // send file transfer request
        for(var attempt = 1; attempt <= this.MAX_PACKET_ATTEMPTS; attempt++){
            try {
                this.log(`offerFileTransfer attempt ${attempt}`);
                await FileTransferAPI.sendFileTransferRequest(to, fileTransferId, fileName, fileSize);
                this.log(`offerFileTransfer attempt ${attempt} success`);
                return;
            } catch(e) {
                console.log(e);
                if(attempt === this.MAX_PACKET_ATTEMPTS){

                    this.log("offerFileTransfer failed", e);

                    // remove file transfer
                    GlobalState.fileTransfers = GlobalState.fileTransfers.filter((fileTransfer) => {
                        return fileTransfer.id !== fileTransferId;
                    });

                    // rethrow exception
                    throw e;

                }
            }
        }

    }

    static async acceptFileTransfer(fileTransfer) {

        for(var attempt = 1; attempt <= this.MAX_PACKET_ATTEMPTS; attempt++){
            try {
                this.log(`acceptFileTransfer attempt ${attempt}`);
                await FileTransferAPI.acceptFileTransfer(fileTransfer.from, fileTransfer.id);
                fileTransfer.status = this.STATUS_ACCEPTED;
                return;
            } catch(e) {
                console.log(e);
                if(attempt === this.MAX_PACKET_ATTEMPTS){
                    this.log("acceptFileTransfer failed", e);
                    throw e;
                }
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
                fileTransfer.status = this.STATUS_ACCEPTED;
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

    static async sendFilePart(fileTransfer, partIndex) {
        try {

            // get data for this part
            const partSize = fileTransfer.max_acceptable_part_size;
            const start = partIndex * partSize;
            const end = start + partSize;
            const partData = fileTransfer.data.slice(start, end);

            // update status
            fileTransfer.status = FileTransferrer.STATUS_SENDING;

            // send part to remote node
            for(var attempt = 1; attempt <= this.MAX_PACKET_ATTEMPTS; attempt++){
                try {
                    this.log(`sendFilePart attempt ${attempt}`);
                    await FileTransferAPI.sendFilePart(fileTransfer.to, fileTransfer.id, partIndex, fileTransfer.total_parts, partData);
                    return;
                } catch(e) {
                    console.log(e);
                    if(attempt === this.MAX_PACKET_ATTEMPTS){
                        this.log("sendFilePart failed", e);
                        throw e;
                    }
                }
            }

        } catch(e) {
            console.log(e);
        }
    }

    static async requestFileParts(fileTransfer, partIndexes) {
        for(var attempt = 1; attempt <= this.MAX_PACKET_ATTEMPTS; attempt++){
            try {
                this.log(`requestFileParts attempt ${attempt}`);
                await FileTransferAPI.requestFileParts(fileTransfer.from, fileTransfer.id, partIndexes);
                return;
            } catch(e) {
                console.log(e);
                if(attempt === this.MAX_PACKET_ATTEMPTS){
                    this.log("requestFileParts failed", e);
                    throw e;
                }
            }
        }
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

}

export default FileTransferrer;
