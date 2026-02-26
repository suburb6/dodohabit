import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';
import SEO from '../components/SEO';


const Terms = () => {
    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)] selection:text-white flex flex-col transition-colors duration-300">
            <SEO
                title="Terms and Conditions"
                description="Read DodoHabit's terms and conditions for using the app and related services."
            />
            <main className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-8">
                        <h1 className="text-4xl font-extrabold tracking-tight">Terms and Conditions</h1>
                    </div>

                    <div className="prose dark:prose-invert prose-lg max-w-none text-[var(--text-secondary)]">
                        <p className="text-xl text-[var(--text-secondary)] mb-8">
                            Last updated: January 30, 2026
                        </p>

                        <p className="mb-6">
                            Welcome to DodoHabit! By downloading, installing, or using the DodoHabit mobile application (the "App"), you agree to be bound by these Terms and Conditions ("Terms"). Please read them carefully.
                        </p>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 border-l-4 border-[var(--accent-primary)] pl-4 uppercase tracking-tight">1. Acceptance of Terms & Eligibility</h2>
                            <p className="mb-4">By accessing DodoHabit, you agree to these Terms.</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Age Requirement:</strong> You must be at least 13 years of age to use this App.</li>
                                <li><strong>Minors:</strong> If you are under 18, you represent that you have the consent of a parent or guardian to use the App. We utilize platform-level age signals (Apple/Google APIs) to ensure compliance with regional age-assurance laws.</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 border-l-4 border-[var(--accent-primary)] pl-4 uppercase tracking-tight">2. No Medical Advice (CRITICAL)</h2>
                            <p className="mb-4">
                                <strong className="text-[var(--text-primary)]">DODOHABIT IS A PRODUCTIVITY TOOL ONLY.</strong> It is not a medical device and does not provide medical advice, diagnosis, or treatment.
                            </p>
                            <p>
                                Step tracking and habit suggestions are for informational purposes only. The App does not monitor heart conditions or physiological emergencies. Always consult a qualified healthcare provider before starting any new fitness routine. <strong className="text-[var(--text-primary)]">Never disregard professional medical advice because of something you read in the App.</strong>
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-4">3. Intellectual Property</h2>
                            <p>
                                The DodoHabit name, logo, "Dodo" mascot, custom code, and design assets are the exclusive property of the DodoHabit Developer Team. You may not decompile, reverse engineer, or "skin" the App for redistribution.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-4">4. License & User Content</h2>
                            <p>
                                We grant you a personal, revocable license to use the App. You retain ownership of your habit names and logs, but by using the cloud-sync feature, you grant us a license to host and transmit that data solely to provide the service to you.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-4">5. User Responsibility & Device Security</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You are responsible for keeping your device and login (Apple/Google) secure.</li>
                                <li><strong>Jailbreaking:</strong> Use of the App on "jailbroken" or "rooted" devices is at your own risk; we are not responsible for resulting security breaches or data corruption.</li>
                                <li><strong>Guest vs. Signed-In:</strong> You acknowledge that Guest Data exists only on your physical device. If you lose your phone or delete the App as a guest, that data is permanently lost.</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 border-l-4 border-[var(--accent-primary)] pl-4 uppercase tracking-tight">6. Limitation of Liability</h2>
                            <p className="mb-4 text-[var(--text-secondary)] font-bold">TO THE MAXIMUM EXTENT PERMITTED BY LAW, DODOHABIT IS PROVIDED "AS IS." WE ARE NOT LIABLE FOR:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>SENSOR INACCURACY:</strong> Errors in step counting or motion detection.</li>
                                <li><strong>DATA LOSS:</strong> Failure of cloud sync or accidental deletion of local data.</li>
                                <li><strong>PHYSICAL INJURY:</strong> Any health issues arising from attempting habits or fitness goals tracked in the App.</li>
                                <li><strong>WIDGET ERRORS:</strong> Inaccuracies in data displayed on system widgets.</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 border-l-4 border-[var(--accent-primary)] pl-4 uppercase tracking-tight">7. Account Termination & Deletion</h2>
                            <p>
                                We reserve the right to terminate accounts that misuse the service. You may delete your account and all associated cloud data at any time via the "Delete Account" button in Settings.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-4">8. Updates & Availability</h2>
                            <p>
                                We do not guarantee 100% uptime. We may modify features, adjust app mechanics, habit calculation logic, or visual elements, or discontinue parts of the App to improve the user experience without prior notice.
                            </p>
                            <p className="mt-2">
                                We may push mandatory updates to your device for security, stability, or feature enhancement. Continued use of the App following an update constitutes your acceptance of any changes.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-4">9. Governing Law</h2>
                            <p>
                                These Terms are governed by the laws of Mauritius. Any disputes shall be settled in the courts of Mauritius.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-4">10. Contact</h2>
                            <p>
                                Support & Feedback: <a href="mailto:dodohabitapp@gmail.com" className="text-[var(--accent-primary)] hover:underline">dodohabitapp@gmail.com</a>
                            </p>
                        </section>

                        <hr className="border-[var(--border-color)] my-10" />

                        <p className="text-sm text-gray-500 italic">
                            Ownership: DodoHabit, its branding, and all assets are the property of the DodoHabit Developer Team.
                        </p>
                    </div>
                </motion.div>
            </main>


        </div>
    );
};

export default Terms;
