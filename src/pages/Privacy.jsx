import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import SEO from '../components/SEO';


const Privacy = () => {
    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)] selection:text-white flex flex-col transition-colors duration-300">
            <SEO
                title="Privacy Policy"
                description="Read DodoHabit's privacy policy, including what data we collect and how it's used."
            />
            <main className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-8">
                        <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
                    </div>

                    <div className="prose dark:prose-invert prose-lg max-w-none text-[var(--text-secondary)]">
                        <p className="text-xl text-[var(--text-secondary)] mb-8 italic">
                            Last updated: January 30, 2026
                        </p>

                        <p className="mb-8">
                            DodoHabit ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our mobile application (the "App").
                        </p>

                        {/* Section 1 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 border-l-4 border-[var(--accent-primary)] pl-4 uppercase tracking-tight">1. Information We Collect</h2>

                            <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6 mb-3">a. Account Information</h3>
                            <ul className="list-disc pl-6 space-y-2 mb-4">
                                <li><strong className="text-[var(--text-primary)]">Anonymous Usage:</strong> You can use DodoHabit as a guest without providing personal information. No account is required for basic usage.</li>
                                <li><strong className="text-[var(--text-primary)]">Sign-In (Optional):</strong> If you choose to sign in (Google or Apple), we collect your basic profile information (such as email, display name, and unique user ID) from the authentication provider.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-white mt-6 mb-3">b. Activity & Habit Data</h3>
                            <ul className="list-disc pl-6 space-y-2 mb-4">
                                <li>We store your habit tracking data, preferences, and activity history. This data is associated with your account if you sign in, or stored locally if you remain a guest.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-white mt-6 mb-3">c. Device Permissions</h3>
                            <ul className="list-disc pl-6 space-y-2 mb-4">
                                <li><strong className="text-[var(--text-primary)]">Motion/Activity Recognition:</strong> If you enable step tracking, we request permission to access your device's motion sensors. This data is used only for step counting and is not shared. <em className="text-[var(--text-secondary)] opacity-60">On iOS, DodoHabit declares its use of motion data in the app's Privacy Manifest (PrivacyInfo.xcprivacy) and infoPlist with the required reason: "DodoHabit uses motion data to automatically track your daily steps for your habits."</em></li>
                                <li><strong className="text-[var(--text-primary)]">Notifications:</strong> If enabled, we use notification permissions to send reminders.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-white mt-6 mb-3">d. Analytics & Technical Logs</h3>
                            <ul className="list-disc pl-6 space-y-2 mb-4">
                                <li>We do <strong className="text-[var(--text-primary)]">not</strong> use third-party marketing or behavioral analytics or advertising SDKs.</li>
                                <li>We collect technical logs via Firebase required for app functionality and security (e.g., preventing unauthorized access and fraud prevention). This may include device identifiers, IP addresses, and timestamps as required by Firebase Auth and Firestore.</li>
                            </ul>
                        </section>

                        {/* Section 2 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 border-l-4 border-[var(--accent-primary)] pl-4 uppercase tracking-tight">2. How We Use Your Information</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>To provide and improve the App's features.</li>
                                <li>To sync your data across devices (if signed in).</li>
                                <li>To back up your data securely in the cloud (if signed in).</li>
                                <li>To respond to support requests.</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 border-l-4 border-[var(--accent-primary)] pl-4 uppercase tracking-tight">3. Data Storage, Security & Residency</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-[var(--text-primary)]">Cloud Storage:</strong> If you sign in, your data is stored securely in Google Firebase (Firestore). Our cloud services are hosted in the United States. By using the sign-in feature, you consent to this transfer.</li>
                                <li><strong className="text-[var(--text-primary)]">Local Storage:</strong> Guest data is stored only on your device and is not uploaded to our servers.</li>
                                <li><strong className="text-[var(--text-primary)]">Data Deletion:</strong> You can delete your account and all associated cloud data at any time via the "Delete Account" button in Settings. Guest data can be deleted by uninstalling the app or using the "Reset All Local Data" option in Settings.</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 border-l-4 border-[var(--accent-primary)] pl-4 uppercase tracking-tight">4. Your Rights (GDPR/CCPA)</h2>
                            <p>
                                Depending on your location, you may have the right to access, port, or delete your personal data. You can exercise these rights directly through the in-app deletion tools or by contacting us at <a href="mailto:dodohabitapp@gmail.com" className="text-[var(--accent-primary)] hover:underline">dodohabitapp@gmail.com</a>.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 border-l-4 border-[var(--accent-primary)] pl-4 uppercase tracking-tight">5. Data Sharing</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>We do <strong className="text-[var(--text-primary)]">not</strong> sell, rent, or share your personal data with third parties.</li>
                                <li>Data is shared with authentication providers (Google/Apple) only to facilitate the sign-in process.</li>
                            </ul>
                        </section>

                        {/* Section 6 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-4">6. Children's Privacy</h2>
                            <p>
                                DodoHabit is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-4">7. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. Changes will be posted here with an updated date.
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 border-l-4 border-[var(--accent-primary)] pl-4 uppercase tracking-tight">8. Contact Us</h2>
                            <p>
                                If you have any questions, please contact us at: <a href="mailto:dodohabitapp@gmail.com" className="text-[var(--accent-primary)] hover:underline">dodohabitapp@gmail.com</a>
                            </p>
                        </section>

                        <hr className="border-[var(--border-color)] my-10" />

                        <p className="text-sm text-gray-500 italic">
                            This policy reflects how DodoHabit operates as of the date above. For more details, see in-app settings or our website.
                        </p>
                    </div>
                </motion.div>
            </main>


        </div>
    );
};

export default Privacy;
