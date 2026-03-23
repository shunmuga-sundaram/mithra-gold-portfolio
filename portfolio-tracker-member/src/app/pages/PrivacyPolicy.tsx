import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

export function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-orange-600 mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-orange-100 mt-1">Last updated: March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 text-gray-700">

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">1. Information We Collect</h2>
          <p>We collect the following information when you use the Mithra Gold Portfolio Tracker:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong>Personal Information:</strong> Name, email address, and phone number provided during account creation.</li>
            <li><strong>Transaction Data:</strong> Records of all buy and sell trades including quantities, rates, and timestamps.</li>
            <li><strong>Portfolio Data:</strong> Your gold holdings and current portfolio value.</li>
            <li><strong>Usage Data:</strong> Login activity and session information.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">2. How We Use Your Information</h2>
          <p>Your information is used to:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Maintain and manage your gold portfolio account.</li>
            <li>Process and record buy and sell transactions.</li>
            <li>Send account-related communications such as password reset emails.</li>
            <li>Provide customer support and resolve account issues.</li>
            <li>Ensure platform security and prevent unauthorized access.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">3. Data Storage and Security</h2>
          <p>
            Your data is stored securely in our database. We implement industry-standard security
            measures including encrypted passwords and JWT-based authentication to protect your account.
            Access tokens are stored locally on your device and are used to authenticate your sessions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">4. Data Sharing</h2>
          <p>
            We do not sell, trade, or transfer your personal information to third parties. Your data
            is only accessible to authorized administrators of the Mithra platform for the purpose
            of managing your account and processing transactions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">5. Cookies and Local Storage</h2>
          <p>
            The platform uses browser local storage and session storage to maintain your login session.
            This data is used solely for authentication purposes and is cleared when you log out.
            If you choose "Remember me" at login, your session will persist across browser restarts.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Access the personal information we hold about you.</li>
            <li>Request correction of inaccurate personal data.</li>
            <li>Request deletion of your account and associated data by contacting an administrator.</li>
            <li>Receive a copy of your transaction history.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">7. Data Retention</h2>
          <p>
            We retain your account and transaction data for as long as your account is active.
            Transaction records are kept for audit and compliance purposes even after account deactivation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be reflected with
            an updated date at the top of this page. Continued use of the platform constitutes
            acceptance of the revised policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">9. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or how your data is handled,
            please contact your account administrator or reach out through the official Mithra support channels.
          </p>
        </section>

        <div className="pt-4 border-t">
          <Button
            onClick={() => navigate(-1)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
