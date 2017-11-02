import * as dgram from "dgram";
import {Sender} from "../../lib/udp/Sender";

import { assert } from "chai";
import "mocha";

describe("UDP Sender", () => {

    it("should send udp packet", (done) => {
        const server = dgram.createSocket("udp4");
        server.on("listening", () => {
            // When ready
            const sender = new Sender("127.0.0.1", 3334);
            sender.send("test udp content");
        });

        server.on("message", (msgBuffer) => {
            const msg = msgBuffer.toString();
            assert.include(msg, "test udp content");
            done();
        });

        server.bind(3334, "127.0.0.1");
    });

});
