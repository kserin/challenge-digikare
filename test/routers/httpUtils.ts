import http from "http";

function request(method: "GET" | "POST" | "PUT" | "DELETE", url: string, body?: any): Promise<[number, any]> {
    return new Promise((resolve, _) => {
        let json = null;
        let headers = {};
        if (body) {
            json = JSON.stringify(body);
            headers = (body) ? {
                "Content-Type": "application/json",
                "Content-Length": json.length,
            } : {};
        }

        const req = http.request(url, {
            method,
            headers,
        }, (res) => {
            let data = "";
            const code = res.statusCode as number;

            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    const object = JSON.parse(data)
                    resolve([code, object]);
                } catch (_) {
                    resolve([code, data]);
                }
            });
        });
        if (json) {
            req.write(json);
        }
        req.end();
    });
}

export function get(url: string): Promise<[number, any]> {
    return request("GET", url);
}

export function post(url: string, data: any): Promise<[number, any]> {
    return request("POST", url, data);
}

export function put(url: string, data: any): Promise<[number, any]> {
    return request("PUT", url, data);
}

export function delete_(url: string): Promise<[number, any]> {
    return request("DELETE", url);
}
