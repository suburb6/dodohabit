const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (res, status, payload) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
};

const normalizeString = (value, max = 4000) => String(value || '').trim().slice(0, max);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return json(res, 405, { error: 'Method not allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

        const name = normalizeString(body.name, 120);
        const email = normalizeString(body.email, 180).toLowerCase();
        const message = normalizeString(body.message, 5000);
        const turnstileToken = normalizeString(body.turnstileToken, 4096);
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

        if (!name) return json(res, 400, { error: 'Name is required.' });
        if (!email) return json(res, 400, { error: 'Email is required.' });
        if (!EMAIL_REGEX.test(email) || email.includes('..')) {
            return json(res, 400, { error: 'Invalid email format.' });
        }
        if (!message || message.length < 10) {
            return json(res, 400, { error: 'Message must be at least 10 characters.' });
        }
        if (!turnstileSecret) {
            return json(res, 500, { error: 'Server misconfigured: missing TURNSTILE_SECRET_KEY.' });
        }
        if (!projectId) {
            return json(res, 500, { error: 'Server misconfigured: missing FIREBASE_PROJECT_ID.' });
        }
        if (!turnstileToken) {
            return json(res, 400, { error: 'Verification token is required.' });
        }

        const remoteip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim();
        const verifyBody = new URLSearchParams({
            secret: turnstileSecret,
            response: turnstileToken,
        });
        if (remoteip) verifyBody.set('remoteip', remoteip);

        const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: verifyBody.toString(),
        });
        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok || !verifyData?.success) {
            return json(res, 400, { error: 'Verification failed. Please try again.' });
        }

        const now = new Date().toISOString();
        const payload = {
            fields: {
                name: { stringValue: name },
                email: { stringValue: email },
                message: { stringValue: message },
                status: { stringValue: 'new' },
                source: { stringValue: 'website-feedback-form' },
                createdAt: { timestampValue: now },
                updatedAt: { timestampValue: now },
                turnstileVerified: { booleanValue: true },
            },
        };

        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/feedback`;
        const writeResponse = await fetch(firestoreUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!writeResponse.ok) {
            const text = await writeResponse.text();
            return json(res, 500, { error: `Failed to store feedback: ${text}` });
        }

        return json(res, 200, { ok: true });
    } catch (error) {
        return json(res, 500, { error: error?.message || 'Unexpected server error.' });
    }
}
