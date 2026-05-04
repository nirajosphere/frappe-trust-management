import { useState, useEffect } from "react";

export const useFrappeGetDocList = (doctype, options = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = () => {
        if (typeof frappe === "undefined") {
            setLoading(false);
            return;
        }
        setLoading(true);
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: doctype,
                fields: options.fields || ["name"],
                filters: options.filters || {},
                limit_page_length: options.limit || 50
            },
            callback: (r) => {
                setLoading(false);
                if (r.message) setData(r.message);
            },
            error: (err) => {
                setLoading(false);
                setError(err);
            }
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

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
                    if (r.message) resolve(r.message);
                    else reject(r);
                },
                error: (err) => {
                    setLoading(false);
                    setError(err.message || "Failed to create document.");
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
                    if (r.message) resolve(r.message);
                    else reject(r);
                },
                error: (err) => {
                    setLoading(false);
                    setError(err.message || "Failed to update.");
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
                    resolve(response.message || response);
                } else {
                    setError("Upload failed.");
                    reject("Upload failed");
                }
            };

            xhr.onerror = () => {
                setLoading(false);
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
                    resolve(r.message || true);
                },
                error: (err) => {
                    setLoading(false);
                    setError(err.message || "Failed to delete.");
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