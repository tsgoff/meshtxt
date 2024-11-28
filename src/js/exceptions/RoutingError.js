import {Protobuf} from "@meshtastic/js";

class RoutingError extends Error {

    constructor(routingErrorNumber) {
        super("Routing Error");
        this.routingErrorNumber = routingErrorNumber;
    }

    getRoutingErrorMessage() {
        switch(this.routingErrorNumber){
            case Protobuf.Mesh.Routing_Error.NONE: return "NONE";
            case Protobuf.Mesh.Routing_Error.NO_ROUTE: return "NO_ROUTE";
            case Protobuf.Mesh.Routing_Error.GOT_NAK: return "GOT_NAK";
            case Protobuf.Mesh.Routing_Error.TIMEOUT: return "TIMEOUT";
            case Protobuf.Mesh.Routing_Error.NO_INTERFACE: return "NO_INTERFACE";
            case Protobuf.Mesh.Routing_Error.MAX_RETRANSMIT: return "MAX_RETRANSMIT";
            case Protobuf.Mesh.Routing_Error.NO_CHANNEL: return "NO_CHANNEL";
            case Protobuf.Mesh.Routing_Error.TOO_LARGE: return "TOO_LARGE";
            case Protobuf.Mesh.Routing_Error.NO_RESPONSE: return "NO_RESPONSE";
            case Protobuf.Mesh.Routing_Error.DUTY_CYCLE_LIMIT: return "DUTY_CYCLE_LIMIT";
            case Protobuf.Mesh.Routing_Error.BAD_REQUEST: return "BAD_REQUEST";
            case Protobuf.Mesh.Routing_Error.NOT_AUTHORIZED: return "NOT_AUTHORIZED";
            case Protobuf.Mesh.Routing_Error.PKI_FAILED: return "PKI_FAILED";
            case Protobuf.Mesh.Routing_Error.PKI_UNKNOWN_PUBKEY: return "PKI_UNKNOWN_PUBKEY";
            case Protobuf.Mesh.Routing_Error.ADMIN_BAD_SESSION_KEY: return "ADMIN_BAD_SESSION_KEY";
            case Protobuf.Mesh.Routing_Error.ADMIN_PUBLIC_KEY_UNAUTHORIZED: return "ADMIN_PUBLIC_KEY_UNAUTHORIZED";
            default: return `${this.routingErrorNumber}`;
        }
    }

}

export default RoutingError;
