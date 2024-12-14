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
                    <div class="overflow-hidden">
                        <input ref="file-input" type="file"/>
                    </div>
                    <div class="ml-auto">
                        <TextButton @click="offerFileTransfer" type="button" class="bg-blue-500 hover:bg-blue-400 whitespace-nowrap">
                            Send File
                        </TextButton>
                    </div>
                </div>

                <div class="divide-y">
                    <div v-for="fileTransfer of fileTransfers" class="bg-white p-2">

                        <div class="flex items-center pr-2">

                            <!-- file info -->
                            <div class="mr-auto overflow-hidden">
                                <div class="font-semibold break-words">{{ fileTransfer.filename }}</div>
                                <div class="text-sm text-gray-500">{{ fileTransfer.filesize }} bytes</div>
                                <div class="text-sm text-gray-500 space-x-1">
                                    <span>Status: {{ fileTransfer.status }}</span>
                                    <span v-if="fileTransfer.status === 'sending' || fileTransfer.status === 'receiving'">{{ fileTransfer.progress }}%</span>
                                </div>
                            </div>

                            <!-- incoming file transfer offer -->
                            <div v-if="fileTransfer.direction === 'incoming' && fileTransfer.status === 'offering'" class="flex space-x-1">
                                <TextButton @click="acceptFileTransfer(fileTransfer)" class="bg-green-500 hover:bg-green-400">Accept</TextButton>
                                <TextButton @click="rejectFileTransfer(fileTransfer)" class="bg-red-500 hover:bg-red-400">Reject</TextButton>
                            </div>

                            <!-- action buttons -->
                            <div v-else class="ml-2 flex items-center space-x-1">
                                <TextButton v-if="fileTransfer.direction === 'incoming' && fileTransfer.status === 'completed'" @click="downloadBlob(fileTransfer.filename, fileTransfer.blob)" class="bg-gray-500 hover:bg-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                </TextButton>
                                <TextButton v-if="fileTransfer.status === 'completed' || fileTransfer.status === 'cancelled' || fileTransfer.status === 'rejected'" @click="removeFileTransfer(fileTransfer)" class="bg-gray-500 hover:bg-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </TextButton>
                                <TextButton v-else @click="cancelFileTransfer(fileTransfer)" class="bg-gray-500 hover:bg-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </TextButton>
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
import TextButton from "../TextButton.vue";
import DialogUtils from "../../js/DialogUtils.js";
import SaveButton from "../SaveButton.vue";
import FileTransferAPI from "../../js/FileTransferAPI.js";
import IconButton from "../IconButton.vue";
import FileTransferrer from "../../js/FileTransferrer.js";

export default {
    name: 'NodeFilesPage',
    components: {
        IconButton,
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

            // offer file
            try {
                await FileTransferrer.offerFileTransfer(this.nodeId, file);
            } catch(e) {
                DialogUtils.showErrorAlert(e);
            }

        },
        async acceptFileTransfer(fileTransfer) {
            try {
                await FileTransferrer.acceptFileTransfer(fileTransfer);
            } catch(e) {
                DialogUtils.showErrorAlert(e);
            }
        },
        async rejectFileTransfer(fileTransfer) {
            try {
                await FileTransferrer.rejectFileTransfer(fileTransfer);
            } catch(e) {
                console.log(e);
            }
        },
        async cancelFileTransfer(fileTransfer) {

            // ask user to confirm
            if(!confirm("Are you sure you want to cancel this file transfer?")){
                return;
            }

            try {
                await FileTransferAPI.cancelFileTransfer(fileTransfer.to, fileTransfer.id);
            } catch(e) {
                console.log(e);
            }

        },
        removeFileTransfer(fileTransfer) {

            // ask user to confirm
            if(!confirm("Are you sure you want to remove this file transfer?")){
                return;
            }

            FileTransferrer.removeFileTransfer(fileTransfer);

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
