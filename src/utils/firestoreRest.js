import { auth } from '../firebase';

// Helper to convert JS Object into Firestore JSON format
const toFirestoreValue = (value) => {
    if (value === null || value === undefined) return { nullValue: null };
    if (typeof value === 'boolean') return { booleanValue: value };
    if (typeof value === 'number') {
        if (Number.isInteger(value)) return { integerValue: value.toString() };
        return { doubleValue: value };
    }
    if (value instanceof Date) return { timestampValue: value.toISOString() };
    if (typeof value === 'string') return { stringValue: value };
    if (Array.isArray(value)) {
        return { arrayValue: { values: value.map(toFirestoreValue) } };
    }
    if (typeof value === 'object') {
        // Check for special valid objects if needed, else assumes map
        const fields = {};
        for (const k in value) {
            fields[k] = toFirestoreValue(value[k]);
        }
        return { mapValue: { fields } };
    }
    return { stringValue: String(value) };
};

const getBaseUrl = () => {
    const projectId = auth.app.options.projectId;
    return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
};

// Generic REST Add (Create)
export const restAddDoc = async (collectionName, data) => {
    try {
        const token = await auth.currentUser.getIdToken();
        const url = `${getBaseUrl()}/${collectionName}`;

        // Convert flat data object to Firestore "fields" format
        const fields = {};
        for (const key in data) {
            fields[key] = toFirestoreValue(data[key]);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fields })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`REST Add Failed: ${response.status} - ${errText}`);
        }

        const resData = await response.json();
        // Extract ID from name path: "projects/.../documents/collection/DOC_ID"
        const docId = resData.name.split('/').pop();
        return { id: docId, ...data };
    } catch (error) {
        console.error("REST Add Error:", error);
        throw error;
    }
};

// Generic REST Update
export const restUpdateDoc = async (collectionName, docId, data) => {
    try {
        const token = await auth.currentUser.getIdToken();
        // Query params for updateMask are needed to avoid overwriting the whole document if we only want partial updates
        // But for simplicity in this fallback, we might just patch what we have.
        // Firestore REST API requires specifying updateMask to merge.

        const fields = {};
        const updateMask = [];
        for (const key in data) {
            fields[key] = toFirestoreValue(data[key]);
            updateMask.push(`updateMask.fieldPaths=${key}`);
        }

        const maskQuery = updateMask.join('&');
        const url = `${getBaseUrl()}/${collectionName}/${docId}?${maskQuery}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fields })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`REST Update Failed: ${response.status} - ${errText}`);
        }

        return { id: docId, ...data };
    } catch (error) {
        console.error("REST Update Error:", error);
        throw error;
    }
};

// Generic REST Delete
export const restDeleteDoc = async (collectionName, docId) => {
    try {
        const token = await auth.currentUser.getIdToken();
        const url = `${getBaseUrl()}/${collectionName}/${docId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`REST Delete Failed: ${response.status} - ${errText}`);
        }
        return true;
    } catch (error) {
        console.error("REST Delete Error:", error);
        throw error;
    }
};
