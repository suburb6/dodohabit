import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error);
        console.error('Error info:', errorInfo);
        console.error('Component stack:', errorInfo.componentStack);
        // Log to external service for debugging (optional)
        if (import.meta.env.PROD) {
            // Could send to Sentry, LogRocket, etc.
        }
    }

    render() {
        if (this.state.hasError) {
            return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-md text-center">
                        <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
                        <p className="text-gray-400 mb-6">
                            We're sorry, but something unexpected happened. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                        >
                            Refresh Page
                        </button>
                        {import.meta.env.DEV && this.state.error && (
                            <pre className="mt-4 text-left text-xs text-red-400 bg-gray-900 p-4 rounded overflow-auto max-h-40">
                                {this.state.error.toString()}
                            </pre>
                        )}
                        <p className="text-gray-500 text-xs mt-4">
                            Check browser console for details
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
