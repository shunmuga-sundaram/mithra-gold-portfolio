import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

export function TermsOfService() {
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
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-orange-100 mt-1">Last updated: March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 text-gray-700">

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Mithra Gold Portfolio Tracker ("Service"), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">2. Description of Service</h2>
          <p>
            Mithra Gold Portfolio Tracker is a platform that allows registered members to track their gold
            holdings, view transaction history, and manage buy and sell requests. All transactions are
            subject to admin approval before completion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">3. Account Registration</h2>
          <p>
            Accounts are created by administrators. You are responsible for maintaining the confidentiality
            of your account credentials and for all activities that occur under your account. You must
            immediately notify us of any unauthorized use of your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">4. Gold Transactions</h2>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Buy transactions are initiated and completed by administrators on your behalf.</li>
            <li>Sell requests submitted by members are subject to admin review and approval.</li>
            <li>Gold prices are set by administrators and may change at any time.</li>
            <li>All transaction values are calculated based on the gold rate at the time of the trade.</li>
            <li>Pending sell requests may be approved or cancelled at the discretion of the administrator.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">5. Pricing and Rates</h2>
          <p>
            Gold buy and sell prices are determined by the administrator and displayed on the platform.
            Prices are subject to change without prior notice. The rate at the time of trade execution
            will be recorded and applied to your transaction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">6. Accuracy of Information</h2>
          <p>
            We strive to ensure the accuracy of all information displayed on the platform. However,
            portfolio values and current gold rates shown are for reference purposes only. We are not
            responsible for any decisions made based on information displayed on the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">7. Limitation of Liability</h2>
          <p>
            Mithra Gold Portfolio Tracker shall not be liable for any indirect, incidental, special,
            or consequential damages arising from your use of the Service or any transactions conducted
            through the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">8. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Continued use of the
            Service after any such changes constitutes your acceptance of the new terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">9. Contact</h2>
          <p>
            For any questions regarding these Terms of Service, please contact your account administrator
            or reach out through the official Mithra support channels.
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
