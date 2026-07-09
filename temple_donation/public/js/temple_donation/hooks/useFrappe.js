import { useState, useEffect } from "react";
import { message } from "antd";

const getErrorMessage = (err) => {
    if (!err) return "Unknown error";
    if (typeof err === "string") return err;
    if (err.message) return err.message;
    if (err.statusText) return err.statusText;
    return "Request failed";
};

let cachedUserTemples = null;
let fetchingUserTemplesPromise = null;

const getUserTemples = () => {
    if (typeof frappe === "undefined") return Promise.resolve(null);
    
    const currentUser = frappe.session.user;
    if (!currentUser || currentUser === "Administrator") {
        return Promise.resolve(null);
    }

    const userRoles = frappe.user_roles || [];
    const isManager = userRoles.includes("System Manager") || userRoles.includes("Super Admin");
    if (isManager) {
        return Promise.resolve(null);
    }

    if (cachedUserTemples !== null) {
        return Promise.resolve(cachedUserTemples);
    }

    if (fetchingUserTemplesPromise) {
        return fetchingUserTemplesPromise;
    }

    fetchingUserTemplesPromise = new Promise((resolve) => {
        frappe.call({
            method: "frappe.client.get",
            args: { doctype: "User", name: currentUser },
            callback: (r) => {
                const myTemples = r.message?.custom_select_temple?.map(t => t.temple) || [];
                cachedUserTemples = myTemples;
                resolve(myTemples);
            },
            error: (err) => {
                console.error("Error loading user temples:", err);
                resolve([]);
            }
        });
    });

    return fetchingUserTemplesPromise;
};

export const useFrappeGetDocList = (doctype, options = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(!!doctype);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!doctype || typeof frappe === "undefined") {
            setLoading(false);
            return;
        }
        setLoading(true);

        let finalFilters = Array.isArray(options.filters)
            ? [...options.filters]
            : { ...(options.filters || {}) };

        if (doctype === "Temple") {
            try {
                const myTemples = await getUserTemples();
                if (myTemples !== null) {
                    if (myTemples.length > 0) {
                        if (Array.isArray(finalFilters)) {
                            const nameFilterIdx = finalFilters.findIndex(f => Array.isArray(f) && f[0] === "name");
                            if (nameFilterIdx > -1) {
                                const existing = finalFilters[nameFilterIdx];
                                const op = existing[1];
                                const val = existing[2];
                                if (op === "in") {
                                    const allowed = val.filter(t => myTemples.includes(t));
                                    finalFilters[nameFilterIdx] = ["name", "in", allowed.length > 0 ? allowed : ["NO_ACCESS"]];
                                } else if (op === "=" || typeof op === "string") {
                                    if (!myTemples.includes(val)) {
                                        finalFilters[nameFilterIdx] = ["name", "=", "NO_ACCESS"];
                                    }
                                } else {
                                    finalFilters[nameFilterIdx] = ["name", "in", myTemples];
                                }
                            } else {
                                finalFilters.push(["name", "in", myTemples]);
                            }
                        } else {
                            if (finalFilters.name) {
                                const existing = Array.isArray(finalFilters.name) ? finalFilters.name : [finalFilters.name];
                                if (existing[0] === "in") {
                                    const allowed = existing[1].filter(t => myTemples.includes(t));
                                    finalFilters.name = ["in", allowed.length > 0 ? allowed : ["NO_ACCESS"]];
                                } else if (existing[0] === "=" || typeof existing === "string") {
                                    const val = typeof existing === "string" ? existing : existing[1];
                                    if (!myTemples.includes(val)) {
                                        finalFilters.name = "NO_ACCESS";
                                    }
                                } else {
                                    finalFilters.name = ["in", myTemples];
                                }
                            } else {
                                finalFilters.name = ["in", myTemples];
                            }
                        }
                    } else {
                        if (Array.isArray(finalFilters)) {
                            finalFilters.push(["name", "=", "NO_TEMPLE_ASSIGNED"]);
                        } else {
                            finalFilters.name = "NO_TEMPLE_ASSIGNED";
                        }
                    }
                }
            } catch (err) {
                console.error("Error applying temple filters:", err);
            }
        }

        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: doctype,
                fields: options.fields || ["name"],
                filters: finalFilters,
                limit_page_length: options.limit || 50
            },
            callback: (r) => {
                setLoading(false);
                if (r.message) setData(r.message);
            },
            error: (err) => {
                setLoading(false);
                setError(err);
                if (options.showError !== false) {
                    message.error(getErrorMessage(err));
                }
            }
        });
    };

    useEffect(() => {
        fetchData();
    }, [doctype, JSON.stringify(options.filters || {}), JSON.stringify(options.fields || [])]);

    return { data, loading, error, mutate: fetchData };
};

export const useFrappeCreateDoc = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createDoc = (doctype, data) => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            frappe.call({
                method: "frappe.client.insert",
                args: {
                    doc: { doctype, ...data }
                },
                callback: (r) => {
                    setLoading(false);
                    if (r.message) {
                        message.success(`${doctype} created successfully`);
                        resolve(r.message);
                    }
                    else reject(r);
                },
                error: (err) => {
                    setLoading(false);
                    const errMsg = getErrorMessage(err);
                    message.error(errMsg);
                    setError(errMsg);
                    reject(err);
                }
            });
        });
    };

    return { createDoc, loading, error };
};

export const useFrappeUpdateDoc = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateDoc = (doctype, name, data) => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            frappe.call({
                method: "frappe.client.set_value",
                args: {
                    doctype: doctype,
                    name: name,
                    fieldname: data
                },
                callback: (r) => {
                    setLoading(false);
                    if (r.message) {
                        message.success(`${doctype} updated successfully`);
                        resolve(r.message);
                    }
                    else reject(r);
                },
                error: (err) => {
                    setLoading(false);
                    const errMsg = getErrorMessage(err);
                    message.error(errMsg);
                    setError(errMsg);
                    reject(err);
                }
            });
        });
    };

    return { updateDoc, loading, error };
};

export const useFrappeFileUpload = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const upload = (file, args) => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();

            formData.append("file", file);
            formData.append("is_private", args.is_private || 0);
            formData.append("doctype", args.doctype);
            formData.append("docname", args.docname);
            formData.append("fieldname", args.fieldname);

            xhr.open("POST", "/api/method/upload_file", true);
            if (typeof frappe !== "undefined" && frappe.csrf_token) {
                xhr.setRequestHeader("X-Frappe-CSRF-Token", frappe.csrf_token);
            }

            xhr.onload = function () {
                setLoading(false);
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    message.success("File uploaded successfully");
                    resolve(response.message || response);
                } else {
                    message.error("Upload failed");
                    setError("Upload failed.");
                    reject("Upload failed");
                }
            };

            xhr.onerror = () => {
                setLoading(false);
                message.error("Network Error: Upload failed");
                setError("Network Error");
                reject("Network Error");
            };

            xhr.send(formData);
        });
    };

    return { upload, loading, error };
};

export const useFrappeDeleteDoc = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteDoc = (doctype, name) => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            frappe.call({
                method: "frappe.client.delete",
                args: { doctype, name },
                callback: (r) => {
                    setLoading(false);
                    message.success(`${doctype} deleted successfully`);
                    resolve(r.message || true);
                },
                error: (err) => {
                    setLoading(false);
                    const errMsg = getErrorMessage(err);
                    message.error(errMsg);
                    setError(errMsg);
                    reject(err);
                }
            });
        });
    };

    return { deleteDoc, loading, error };
};
export const useFrappeGetDoc = (doctype, name) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = () => {
        if (!name || typeof frappe === "undefined") {
            setLoading(false);
            return;
        }
        setLoading(true);
        frappe.call({
            method: "frappe.client.get",
            args: { doctype, name },
            callback: (r) => {
                setLoading(false);
                if (r.message) setData(r.message);
            },
            error: (err) => {
                setLoading(false);
                setError(err);
                message.error(getErrorMessage(err));
            }
        });
    };

    useEffect(() => {
        fetchData();
    }, [doctype, name]);

    return { data, loading, error, mutate: fetchData };
};

// export const useFrappeGetVersions = (doctype, docname) => {
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (!docname) return;

//         const fetchVersions = async () => {
//             setLoading(true);
//             try {
//                 const res = await fetch(
//                     `/api/resource/Version?filters=${encodeURIComponent(JSON.stringify([
//                         ["ref_doctype", "=", doctype],
//                         ["docname", "=", docname]
//                     ]))}&fields=${encodeURIComponent(JSON.stringify(["*"]))}&order_by=creation desc`
//                 );
//                 const json = await res.json();
//                 setData(json.data || []);
//             } catch (err) {
//                 console.error(err);
//             }
//             setLoading(false);
//         };

//         fetchVersions();
//     }, [doctype, docname]);

//     return { data, loading };
// };

export const useFrappeGetVersions = (doctype, docname) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);

    const fetchVersions = async (reset = false) => {
        if (!docname) return;

        setLoading(true);

        try {
            const res = await fetch(
                `/api/resource/Version?filters=${encodeURIComponent(JSON.stringify([
                    ["ref_doctype", "=", doctype],
                    ["docname", "=", docname]
                ]))}&fields=${encodeURIComponent(JSON.stringify(["*"]))}&order_by=creation desc&limit_start=${reset ? 0 : page * 5}&limit_page_length=5`
            );

            const json = await res.json();

            if (reset) {
                setData(json.data || []);
                setPage(1);
            } else {
                setData(prev => [...prev, ...(json.data || [])]);
                setPage(prev => prev + 1);
            }

        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchVersions(true);
    }, [doctype, docname]);

    return { data, loading, fetchMore: () => fetchVersions(false) };
};