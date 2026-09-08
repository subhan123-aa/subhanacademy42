import { PolicyPage, type PolicySection } from "@/components/policy-page";

const sections: PolicySection[] = [
  { title: "1. 3-Day Refund Policy", callout: true, paragraphs: ["We offer a 3-day refund period for eligible course purchases.", "A refund request must be submitted within 3 calendar days from the date of purchase."] },
  { title: "2. How to Request a Refund", paragraphs: ["To request a refund, contact Subhan Academy support at subhanacademysupport@gmail.com.", "Please provide:"], bullets: ["Your full name", "Registered email address", "Order/payment details", "Reason for the refund request"] },
  { title: "3. Refund Eligibility", paragraphs: ["Refund requests submitted within the 3-day refund period will be reviewed by our support team.", "A refund may be approved after verification of the purchase and account details."] },
  { title: "4. Course Content Usage", paragraphs: ["Refund eligibility may be affected if substantial course content has already been accessed, downloaded, copied, or otherwise extensively used."] },
  { title: "5. Duplicate Payments", paragraphs: ["If you are accidentally charged more than once for the same purchase, please contact support. After verification, the duplicate payment may be refunded."] },
  { title: "6. Payment Gateway Issues", paragraphs: ["If a payment is deducted from your account but the course enrollment is not successfully completed, please contact support. We will verify the transaction and take the appropriate action."] },
  { title: "7. Refund Processing", paragraphs: ["Once a refund is approved, the refund will be processed through the applicable payment method or payment gateway. The time required for the amount to appear in your account may depend on the payment provider or bank."] },
  { title: "8. Refund After the 3-Day Period", paragraphs: ["Refund requests submitted after 3 calendar days from the date of purchase may not be eligible for a refund."] },
  { title: "9. Contact Us", paragraphs: ["For refund-related questions or requests, please contact Subhan Academy support at subhanacademysupport@gmail.com."] }
];

export default function RefundsPage() {
  return <PolicyPage title="Refund Policy" sections={sections} />;
}
