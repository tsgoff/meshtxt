import RoutingError from "./exceptions/RoutingError.js";

class DialogUtils {

    static showSettingsSavedAlert() {
        alert("Settings saved. Node might reboot. If it does you will need to reconnect!");
    }

    static showErrorAlert(error) {

        // check for routing error
        if(error instanceof RoutingError){
            alert(error.getRoutingErrorMessage());
            return;
        }

        // standard error message
        alert(error);

    }

}

export default DialogUtils;
