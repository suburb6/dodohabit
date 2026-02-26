import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertTriangle, Mail } from 'lucide-react';
import SEO from '../components/SEO';

const DeleteAccount = () => {
    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans selection:bg-red-500 selection:text-white flex flex-col transition-colors duration-300">
            <SEO
                title="Delete Account"
                description="Request permanent deletion of your DodoHabit account and associated data."
            />
            <main className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-8 border-b border-[var(--border-color)] pb-8">
                        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2">Request Account Deletion</h1>
                        <p className="text-xl text-[var(--text-secondary)]">
                            We value your privacy and your right to control your data.
                        </p>
                    </div>

                    <div className="prose dark:prose-invert prose-lg max-w-none text-[var(--text-secondary)] space-y-12">

                        {/* Section 1: How to Delete */}
                        <section className="bg-[var(--bg-secondary)] p-8 rounded-2xl border border-[var(--border-color)]">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                                <Mail className="text-[var(--accent-primary)]" />
                                How to Request Deletion
                            </h2>
                            <p className="mb-6">
                                To ensure the security of your account, we process deletion requests manually.
                                <strong className="text-[var(--text-primary)] block mt-2">
                                    You MUST send this email from the address associated with your DodoHabit account.
                                </strong>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <a
                                    href="mailto:dodohabitapp@gmail.com?subject=Permanent Account Deletion Request&body=I hereby request the permanent deletion of my DodoHabit account and all associated data.%0D%0A%0D%0AI acknowledge that this action is irreversible and I will lose all my habit history and settings.%0D%0A%0D%0AI confirm that I am sending this request from the email address associated with the account I wish to delete.%0D%0A%0D%0AMy account email is: [INSERT EMAIL HERE]%0D%0A%0D%0ARegards,%0D%0A[YOUR NAME]"
                                    className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                                >
                                    <Trash2 size={20} />
                                    Send Deletion Request
                                </a>
                                <span className="text-sm text-[var(--text-secondary)] opacity-60">
                                    Opens your default email client
                                </span>
                            </div>
                        </section>

                        {/* Section 2: What Happens */}
                        <section>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                                <AlertTriangle className="text-yellow-500" />
                                What Happens Next?
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)]">
                                    <h3 className="text-lg font-bold text-red-500 mb-3">Data We Delete</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-[var(--text-secondary)]">
                                        <li>Your account profile (Email, ID, Name)</li>
                                        <li>All tracked habit history and logs</li>
                                        <li>Cloud backups stored in Firebase</li>
                                        <li>Custom habit configurations</li>
                                    </ul>
                                </div>
                                <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)]">
                                    <h3 className="text-lg font-bold text-green-600 mb-3">Data We Keep</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-[var(--text-secondary)]">
                                        <li>
                                            Aggregated, anonymous usage statistics (e.g., "total habits created globally") that cannot be traced back to you.
                                        </li>
                                        <li>
                                            Correspondence records regarding your support or deletion requests for legal compliance.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Timeline */}
                        <section>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Processing Timeline</h2>
                            <p>
                                Once we receive your request, we will process it within <strong className="text-[var(--text-primary)]">30 days</strong>. You will receive a final confirmation email once your data has been permanently removed from our systems.
                            </p>
                        </section>

                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default DeleteAccount;
