import PropertiesReader from "properties-reader";

const properties = PropertiesReader(`${__dirname}/application.properties`);
for (const key in process.env) {
    const value = process.env[key];
    const name = key.toLowerCase().replace("_", ".");
    properties.set(name, value ? value : "");
}
export default properties;