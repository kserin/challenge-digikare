import { expect } from "chai";
import properties from "../src/properties";

describe("properties", () => {
    it("should be possible to override properties with environment variables", () => {
        // SERVER_PORT variable is set on test command (see package.json)
        expect(properties.get("server.port")).to.equals(8888);
    });
});
