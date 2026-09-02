import { PolicyPage, type PolicySection } from "@/components/policy-page";

const sections: PolicySection[] = [
  { title: "1. Information We Collect", paragraphs: ["When you use Subhan Academy, we may collect information such as your name, email address, mobile number, account information, enrollment information, and other information you provide to us."] },
  { title: "2. Payment Information", paragraphs: ["Payments may be processed through third-party payment providers. Subhan Academy does not need to store your complete card, UPI, or banking credentials on our servers when the payment provider handles the transaction."] },
  { title: "3. How We Use Your Information", paragraphs: ["We may use your information to:"], bullets: ["Create and manage your account", "Provide course access", "Process enrollments and payments", "Provide customer support", "Send important account or course-related communications", "Improve our website and educational services", "Prevent fraud and unauthorized activity"] },
  { title: "4. Cookies", paragraphs: ["Our website may use cookies and similar technologies to provide essential functionality, remember preferences, understand website usage, and improve the user experience."] },
  { title: "5. Third-Party Services", paragraphs: ["We may use trusted third-party services for payment processing, hosting, analytics, authentication, communication, and other website functions.", "These services may process information according to their own privacy policies."] },
  { title: "6. Data Security", paragraphs: ["We take reasonable measures to protect user information from unauthorized access, misuse, alteration, or disclosure.", "However, no internet-based system can be guaranteed to be completely secure."] },
  { title: "7. Data Retention", paragraphs: ["We may retain information for as long as reasonably necessary to provide our services, maintain records, comply with applicable requirements, and resolve disputes."] },
  { title: "8. Your Choices", paragraphs: ["You may contact us regarding your personal information or account-related questions using the support contact information available on our website."] },
  { title: "9. Children's Privacy", paragraphs: ["Our services are not intentionally designed to collect personal information from children without appropriate authorization."] },
  { title: "10. Changes to This Privacy Policy", paragraphs: ["We may update this Privacy Policy from time to time. Any changes will be published on this page with an updated date."] },
  { title: "11. Contact Us", paragraphs: ["If you have questions about this Privacy Policy or how your information is handled, please contact Subhan Academy through the support contact information available on our website."] }
];

export default function PrivacyPage() {
  return <PolicyPage title="Privacy Policy" sections={sections} />;
}
