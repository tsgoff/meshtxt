<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Transfer Files" :subtitle="subtitle">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node-id="node.num" class="mr-3"/>
            </template>
            <template v-slot:trailing>
                <div v-if="node" class="my-auto mr-1">
                    <div v-if="hasPublicKey(node.num)" @click="onPublicKeyInfoClick">
                        <div class="cursor-pointer flex space-x-1 bg-green-50 rounded-md px-2 py-1 text-xs text-green-700 border border-green-700 font-medium">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
                                    <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="hidden sm:block">Secure Key</div>
                        </div>
                    </div>
                    <div v-else @click="onChannelKeyInfoClick">
                        <div class="cursor-pointer flex space-x-1 bg-gray-50 rounded-md px-2 py-1 text-xs text-gray-700 border border-gray-700 font-medium">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
                                    <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="hidden sm:block">Channel Key</div>
                        </div>
                    </div>
                </div>
                <NodeDropDownMenu
                    v-if="node"
                    :node="node"
                    :show-delete-message-history-button="true"
                    @node-deleted="onNodeDeleted"/>
            </template>
        </AppBar>

        <!-- list -->
        <div class="flex h-full w-full overflow-hidden">
            <div v-if="node != null" class="w-full">

                <div class="flex bg-white p-2 items-center border-b">
                    <div>
                        <input ref="file-input" type="file"/>
                    </div>
                    <div class="ml-auto">
                        <TextButton @click="offerFileTransfer" type="button" class="bg-blue-500 hover:bg-blue-400">
                            Send File
                        </TextButton>
                    </div>
                </div>

                <div class="divide-y">
                    <div v-for="fileTransfer of fileTransfers" class="bg-white p-2">

                        <div class="flex items-center">

                            <!-- icon -->
                            <div class="mr-2">

                                <!-- incoming icon -->
                                <div v-if="fileTransfer.direction === 'incoming'" class="bg-gray-200 text-black rounded-full p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                </div>

                                <!-- outgoing icon -->
                                <div v-else class="bg-gray-200 text-black rounded-full p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                    </svg>
                                </div>

                            </div>

                            <!-- file info -->
                            <div class="mr-auto">
                                <div class="font-semibold">{{ fileTransfer.filename }}</div>
                                <div class="text-sm text-gray-500">{{ fileTransfer.filesize }} bytes</div>
                                <div v-if="fileTransfer.direction === 'incoming'" class="text-sm text-gray-500">From: [{{ getNodeShortName(fileTransfer.from) }}] {{ getNodeLongName(fileTransfer.from) }}</div>
                                <div v-else class="text-sm text-gray-500">To: [{{ getNodeShortName(fileTransfer.to) }}] {{ getNodeLongName(fileTransfer.to) }}</div>
                                <div class="text-sm text-gray-500">Status: {{ fileTransfer.status }}</div>
                            </div>

                            <!-- save button -->
                            <div v-if="fileTransfer.direction === 'incoming' && fileTransfer.status === 'complete'">
                                <SaveButton @click="downloadBlob(fileTransfer.filename, fileTransfer.blob)"/>
                            </div>

                            <!-- incoming file transfer offer -->
                            <div v-if="fileTransfer.direction === 'incoming' && fileTransfer.status === 'offering'" class="space-x-1">
                                <TextButton @click="acceptFileTransfer(fileTransfer)" class="bg-green-500 hover:bg-green-400">Accept</TextButton>
                                <TextButton @click="rejectFileTransfer(fileTransfer)" class="bg-red-500 hover:bg-red-400">Reject</TextButton>
                            </div>

                        </div>

                        <!-- progress bar -->
                        <div v-if="fileTransfer.status === 'accepted' || fileTransfer.status === 'sending' || fileTransfer.status === 'receiving'" class="mt-2">
                            <div class="overflow-hidden rounded-full bg-gray-200">
                                <div class="h-2 rounded-full bg-blue-500" :style="{ width: `${fileTransfer.progress}%` }"></div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>

    </Page>
</template>

<script>
import GlobalState from "../../js/GlobalState.js";
import AppBar from "../AppBar.vue";
import NodeIcon from "../nodes/NodeIcon.vue";
import Page from "./Page.vue";
import NodeUtils from "../../js/NodeUtils.js";
import NodeDropDownMenu from "../nodes/NodeDropDownMenu.vue";
import NodeAPI from "../../js/NodeAPI.js";
import TextButton from "../TextButton.vue";
import DialogUtils from "../../js/DialogUtils.js";
import SaveButton from "../SaveButton.vue";
import FileTransferAPI from "../../js/FileTransferAPI.js";

export default {
    name: 'NodeFilesPage',
    components: {
        SaveButton,
        TextButton,
        NodeDropDownMenu,
        Page,
        NodeIcon,
        AppBar,
    },
    props: {
        nodeId: String | Number,
    },
    mounted() {

        // redirect to main page if node not found
        if(!this.node){
            this.$router.push({
                name: "main",
            });
            return;
        }

    },
    methods: {
        hasPublicKey: (nodeId) => NodeUtils.hasPublicKey(nodeId),
        getNodeShortName: (nodeId) => NodeUtils.getNodeShortName(nodeId),
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        onNodeDeleted() {

            // go back to main page
            this.$router.push({
                name: "main",
            });

        },
        onPublicKeyInfoClick() {
            alert("Files sent to this node are encrypted with this nodes public encryption key and can only be decrypted and read by this node.");
        },
        onChannelKeyInfoClick() {
            alert("Files sent to this node are encrypted with the shared channel key and could be read by anyone else that knows the shared channel key.");
        },
        downloadBlob(filename, blob) {

            // create object url for blob
            const objectUrl = URL.createObjectURL(blob);

            // create link element to download blob
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = filename;
            link.style.display = "none";
            document.body.append(link);

            // click link to download file in browser
            link.click();

            // link element is no longer needed
            link.remove();

            // revoke object url to clear memory
            setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);

        },
        async offerFileTransfer() {

            // do nothing if file is not selected
            const file = this.$refs["file-input"].files[0];
            if(!file){
                alert("You haven't selected a file!");
                return;
            }

            // generate random file transfer id
            const fileTransferId = NodeAPI.generatePacketId();

            // get file details
            const to = parseInt(this.nodeId);
            const fileName = file.name;
            const fileData = new Uint8Array(await file.arrayBuffer());
            const fileSize = fileData.length;

            try {

                // add to file transfers list
                GlobalState.fileTransfers.push({
                    id: fileTransferId,
                    to: to,
                    from: GlobalState.myNodeId,
                    direction: "outgoing",
                    status: "offering",
                    filename: fileName,
                    filesize: fileSize,
                    progress: 0,
                    data: fileData,
                });

                // send data
                await FileTransferAPI.sendFileTransferRequest(to, fileTransferId, fileName, fileSize);

            } catch(e) {
                DialogUtils.showErrorAlert(e);
            }
        },
        async acceptFileTransfer(fileTransfer) {
            try {

                // mark as accepted
                fileTransfer.status = "accepted";

                // tell remote node we rejected file transfer
                await FileTransferAPI.acceptFileTransfer(fileTransfer.from, fileTransfer.id);

            } catch(e) {
                console.log(e);
            }
        },
        async rejectFileTransfer(fileTransfer) {
            try {

                // remove from ui
                GlobalState.fileTransfers = GlobalState.fileTransfers.filter((existingFileTransfer) => {
                    return existingFileTransfer.id !== fileTransfer.id;
                });

                // tell remote node we rejected file transfer
                await FileTransferAPI.rejectFileTransfer(fileTransfer.from, fileTransfer.id);

            } catch(e) {
                console.log(e);
            }
        },
    },
    computed: {
        GlobalState() {
            return GlobalState;
        },
        node() {
            return GlobalState.nodesById[this.nodeId];
        },
        subtitle() {
            return this.node ? this.getNodeLongName(this.node.num) : "Unknown Node";
        },
        fileTransfers() {
            // only show file transfers between this node and our node
            return GlobalState.fileTransfers.filter((fileTransfer) => {
                const isFromThisNodeToMe = fileTransfer.from === this.node?.num && fileTransfer.to === GlobalState.myNodeId;
                const isFromMeToThisNode = fileTransfer.from === GlobalState.myNodeId && fileTransfer.to === this.node?.num;
                return isFromThisNodeToMe || isFromMeToThisNode;
            });
        },
    },
}
</script>
