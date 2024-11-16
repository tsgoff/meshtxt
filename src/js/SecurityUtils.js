class SecurityUtils {

    static isDefaultPsk(pskAsUInt8Array) {
        // default psk is 1 byte (8 bits) and is equal to 0x1 and is also known as "AQ=="
        return pskAsUInt8Array != null && pskAsUInt8Array.length === 1 && pskAsUInt8Array[0] === 0x1;
    }

}

export default SecurityUtils;
