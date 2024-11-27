<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Connect via HTTP" subtitle="Enter connection details"/>

        <!-- list -->
        <div class="flex flex-col h-full w-full overflow-hidden">

            <!-- manually connect -->
            <div class="flex p-1 space-x-1 bg-white border-b border-gray-300">
                <div class="w-full">
                    <input v-model="newHttpConnectionAddress" type="text" autocapitalize="none" placeholder="e.g: https://mesh.example.com" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                </div>
                <div class="flex h-full my-auto">
                    <button @click="connect(newHttpConnectionAddress)" type="button" class="bg-blue-500 text-white px-2 py-1 rounded shadow hover:bg-blue-400">
                        Connect
                    </button>
                </div>
            </div>

            <!-- this device -->
            <div class="bg-gray-200 p-2 font-semibold">This Device</div>
            <div @click="connect(thisDeviceAddress)" class="flex cursor-pointer bg-white p-2 shadow hover:bg-gray-50 min-h-12">
                <div class="my-auto">{{ thisDeviceAddress }}</div>
            </div>

            <!-- connection history -->
            <div v-if="previousHttpConnectionAddresses.length > 0" class="bg-gray-200 p-2 font-semibold">Connection History</div>
            <div @click="connect(address)" v-for="address of previousHttpConnectionAddresses" class="flex cursor-pointer bg-white p-2 shadow hover:bg-gray-50 min-h-12">
                <div class="my-auto mr-auto">{{ address }}</div>
                <div class="my-auto">
                    <IconButton @click.stop="removePreviousHttpConnectionAddress(address)">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </IconButton>
                </div>
            </div>

        </div>

    </Page>
</template>

<script>
import AppBar from "../AppBar.vue";
import Page from "./Page.vue";
import IconButton from "../IconButton.vue";
import DropDownMenu from "../DropDownMenu.vue";
import DropDownMenuItem from "../DropDownMenuItem.vue";
import Connection from "../../js/Connection.js";

export default {
    name: 'ConnectViaHttpPage',
    components: {
        DropDownMenuItem,
        DropDownMenu,
        IconButton,
        Page,
        AppBar,
    },
    data() {
        return {
            newHttpConnectionAddress: "",
            previousHttpConnectionAddresses: [],
        };
    },
    mounted() {
        this.reloadPreviousHttpConnectionAddresses();
    },
    methods: {
        async connect(address) {

            // do nothing if address not provided
            if(!address){
                return;
            }

            // ensure address starts with https:// if user is browsing via https:// already
            // the browser will not allow mixed content, so we won't be able to connect to http://
            if(window.location.protocol === "https:" && !address.startsWith("https://")){
                alert("Address must start with https:// when page is loaded over HTTPS");
                return;
            }

            // ensure address starts with http:// or https://
            // we can allow the user to connect over http:// if they aren't loading the page over https://
            if(!address.startsWith("http://") && !address.startsWith("https://")){
                alert("Address must start with http:// or https://");
                return;
            }

            // add to connection history list
            this.addPreviousHttpConnectionAddress(address);

            // connect
            await Connection.connectViaHttp(address);

            // go to main page
            this.$router.push({
                name: "main",
            });

        },
        reloadPreviousHttpConnectionAddresses() {
            // sort by address asc
            this.previousHttpConnectionAddresses = this.getPreviousHttpConnectionAddresses().sort((addressA, addressB) => {
                return addressA.localeCompare(addressB);
            });
        },
        getPreviousHttpConnectionAddresses() {

            // load from local storage
            try {
                const data = localStorage.getItem("http_connection_addresses");
                if(data){
                    return JSON.parse(data);
                }
            } catch(e){}

            // default data
            return [];

        },
        setPreviousHttpConnectionAddresses(addresses) {

            // update local storage
            try {
                localStorage.setItem("http_connection_addresses", JSON.stringify(addresses));
            } catch(e){}

            // update ui
            this.reloadPreviousHttpConnectionAddresses();

        },
        addPreviousHttpConnectionAddress(address) {

            // add to previous list if not already added
            const previousHttpConnectionAddresses = this.getPreviousHttpConnectionAddresses();
            if(!previousHttpConnectionAddresses.includes(address)){
                previousHttpConnectionAddresses.push(address);
            }

            // save to local storage
            this.setPreviousHttpConnectionAddresses(previousHttpConnectionAddresses);

        },
        removePreviousHttpConnectionAddress(address) {

            // ask user if they want to remove address
            if(!confirm("Are you sure you want to remove this address?")){
                return;
            }

            // remove from previous list if not already added
            const previousHttpConnectionAddresses = this.getPreviousHttpConnectionAddresses().filter((existingAddress) => {
                return existingAddress !== address;
            });

            // save to local storage
            this.setPreviousHttpConnectionAddresses(previousHttpConnectionAddresses);

        },
    },
    computed: {
        thisDeviceAddress() {
            return window.location.origin;
        },
    },
}
</script>
