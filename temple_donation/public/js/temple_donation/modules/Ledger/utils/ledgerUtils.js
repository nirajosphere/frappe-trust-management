export const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    } catch (e) {
        return dateStr;
    }
};

// Helper to apply client-side text searches
export const applyClientSideSearch = (items, searchText, fieldsToSearch) => {
    if (!searchText) return items;
    const query = searchText.toLowerCase();
    return items.filter(item => {
        return fieldsToSearch.some(field => {
            let val = item[field];
            if (field === "custom_select_temple" && Array.isArray(val)) {
                val = val.map(t => t.temple_name || t.temple || "").join(", ");
            }
            return String(val || "").toLowerCase().includes(query);
        });
    });
};

// Helper to apply client-side filters
export const applyClientSideFilters = (items, filterRules) => {
    if (!filterRules || filterRules.length === 0) return items;
    return items.filter(item => {
        return filterRules.every(rule => {
            const { field, operator, value } = rule;
            if (!field || !operator) return true;

            let itemVal = item[field];
            if (itemVal === undefined || itemVal === null) {
                itemVal = "";
            }

            if (field === "custom_select_temple" && Array.isArray(itemVal)) {
                itemVal = itemVal.map(t => t.temple_name || t.temple || "").join(", ");
            }

            const itemStr = String(itemVal).toLowerCase();
            const filterStr = String(value).toLowerCase();

            const itemNum = Number(itemVal);
            const filterNum = Number(value);
            const isNumericCompare = !isNaN(itemNum) && !isNaN(filterNum) && typeof itemVal !== 'string';

            switch (operator) {
                case "=":
                    if (isNumericCompare) return itemNum === filterNum;
                    return itemStr === filterStr;
                case "!=":
                    if (isNumericCompare) return itemNum !== filterNum;
                    return itemStr !== filterStr;
                case "like":
                    return itemStr.includes(filterStr);
                case "not like":
                    return !itemStr.includes(filterStr);
                case ">":
                    if (isNumericCompare) return itemNum > filterNum;
                    return itemStr > filterStr;
                case "<":
                    if (isNumericCompare) return itemNum < filterNum;
                    return itemStr < filterStr;
                case ">=":
                    if (isNumericCompare) return itemNum >= filterNum;
                    return itemStr >= filterStr;
                case "<=":
                    if (isNumericCompare) return itemNum <= filterNum;
                    return itemStr <= filterStr;
                case "in":
                    const inList = Array.isArray(value) ? value : String(value).split(",").map(s => s.trim().toLowerCase());
                    return inList.includes(itemStr);
                case "not in":
                    const notInList = Array.isArray(value) ? value : String(value).split(",").map(s => s.trim().toLowerCase());
                    return !notInList.includes(itemStr);
                default:
                    return true;
            }
        });
    });
};

// Helper to apply client-side multi-column sorting
export const applyClientSideSorters = (items, sortRules) => {
    if (!sortRules || sortRules.length === 0) return items;
    const sorted = [...items];
    sorted.sort((a, b) => {
        for (const sorter of sortRules) {
            const { field, order } = sorter;
            let valA = a[field];
            let valB = b[field];

            if (field === "custom_select_temple" && Array.isArray(valA)) {
                valA = valA.map(t => t.temple_name || t.temple || "").join(", ");
            }
            if (field === "custom_select_temple" && Array.isArray(valB)) {
                valB = valB.map(t => t.temple_name || t.temple || "").join(", ");
            }

            if (valA === undefined || valA === null) valA = "";
            if (valB === undefined || valB === null) valB = "";

            const numA = Number(valA);
            const numB = Number(valB);
            const isNumeric = !isNaN(numA) && !isNaN(numB) && typeof valA !== 'string' && typeof valB !== 'string';

            if (isNumeric) {
                if (numA !== numB) {
                    return order === "ascend" ? numA - numB : numB - numA;
                }
            } else {
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                if (strA !== strB) {
                    return order === "ascend"
                        ? strA.localeCompare(strB)
                        : strB.localeCompare(strA);
                }
            }
        }
        return 0;
    });
    return sorted;
};
